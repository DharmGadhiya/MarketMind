import { Router } from "express";
const router = Router();
import USER from "../models/user.js";
import Redis from "ioredis";
import { sendEmail } from "../utils/emailService.js";
import { randomBytes } from "crypto";
import { createTokenForUser } from "../services/Authentication.js";

const otpRetryStrategy = (times) => {
  if (times <= 3) return times * 1000;
  return 15000;
};

const getOtpRedisUrl = () => {
  const url = process.env.REDIS_URL;
  if (!url) return "";
  if (url.includes("upstash.io") && url.startsWith("redis://")) {
    return url.replace("redis://", "rediss://");
  }
  return url;
};

const otpRedisUrl = getOtpRedisUrl();
const otpRedisOptions = {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableOfflineQueue: false, // Don't queue commands when offline
  retryStrategy: otpRetryStrategy,
};

if (otpRedisUrl.startsWith("rediss://")) {
  otpRedisOptions.tls = {
    rejectUnauthorized: false,
  };
}

const redisOTP = new Redis(otpRedisUrl, otpRedisOptions);

let hasLoggedOtpError = false;

redisOTP.on("error", (err) => {
  if (!hasLoggedOtpError) {
    console.error("[Redis OTP Error] Client connection failed:", err.message);
    console.warn("[Redis OTP] Using in-memory fallback store for OTPs.");
    hasLoggedOtpError = true;
  }
});

redisOTP.on("ready", () => {
  console.log("Redis Connected (OTP Cache)");
  hasLoggedOtpError = false;
});

redisOTP.connect().catch(() => {});

async function sendOTP(email, otp) {
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf9f6; padding: 40px 20px; color: #0a0e14;">
      <div style="max-width: 460px; margin: 0 auto; background-color: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.01);">
        
        <div style="margin-bottom: 32px; text-align: center;">
          <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #0a8c5b;">MarketMind</span>
        </div>

        <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #0a0e14;">Verify your email address</h2>
        
        <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
          Thank you for signing up. Please use the following one-time password (OTP) to complete your account registration:
        </p>

        <div style="background-color: #f4f6f8; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #6b7280; font-weight: 700; display: block; margin-bottom: 8px;">Verification Code</span>
          <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0a8c5b; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${otp}</div>
        </div>

        <p style="font-size: 12px; color: #6b7280; margin: 0 0 32px 0; text-align: center; line-height: 1.5;">
          This code is valid for <strong>5 minutes</strong>.<br />
          If you did not request this code, you can safely ignore this email.
        </p>

        <hr style="border: 0; border-top: 1px solid rgba(0,0,0,0.06); margin: 0 0 24px 0;" />

        <div style="text-align: center;">
          <p style="font-size: 11px; color: #9ca3af; margin: 0;">
            &copy; 2026 MarketMind. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "MarketMind Verification Code",
    htmlContent,
  });
}



// Simple in-memory fallback store for OTPs when Redis is down
const memoryOTPStore = {
  otps: new Map(),
  attempts: new Map(),

  async get(key) {
    const item = this.otps.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.otps.delete(key);
      return null;
    }
    return item.value;
  },

  async set(key, value, mode, durationSeconds) {
    this.otps.set(key, {
      value,
      expiresAt: Date.now() + durationSeconds * 1000,
    });
  },

  async del(key) {
    this.otps.delete(key);
    this.attempts.delete(key);
  },

  async incr(key) {
    const current = this.attempts.get(key) || 0;
    const nextVal = current + 1;
    this.attempts.set(key, nextVal);
    return nextVal;
  },

  async expire(key, durationSeconds) {
    setTimeout(() => {
      this.attempts.delete(key);
    }, durationSeconds * 1000);
  }
};

let isMemoryFallbackLogged = false;

const otpStore = {
  async get(key) {
    try {
      if (redisOTP && redisOTP.status === "ready") {
        return await redisOTP.get(key);
      }
    } catch (err) {
      console.warn("[Redis OTP Store Get Error, falling back to memory]", err.message);
    }
    if (!isMemoryFallbackLogged && (!redisOTP || redisOTP.status !== "ready")) {
      console.log("[OTP Service] Redis is offline. Using in-memory fallback store for OTPs.");
      isMemoryFallbackLogged = true;
    }
    return await memoryOTPStore.get(key);
  },

  async set(key, value, mode, durationSeconds) {
    try {
      if (redisOTP && redisOTP.status === "ready") {
        return await redisOTP.set(key, value, mode, durationSeconds);
      }
    } catch (err) {
      console.warn("[Redis OTP Store Set Error, falling back to memory]", err.message);
    }
    if (!isMemoryFallbackLogged && (!redisOTP || redisOTP.status !== "ready")) {
      console.log("[OTP Service] Redis is offline. Using in-memory fallback store for OTPs.");
      isMemoryFallbackLogged = true;
    }
    return await memoryOTPStore.set(key, value, mode, durationSeconds);
  },

  async del(key) {
    try {
      if (redisOTP && redisOTP.status === "ready") {
        return await redisOTP.del(key);
      }
    } catch (err) {
      console.warn("[Redis OTP Store Del Error, falling back to memory]", err.message);
    }
    return await memoryOTPStore.del(key);
  },

  async incr(key) {
    try {
      if (redisOTP && redisOTP.status === "ready") {
        return await redisOTP.incr(key);
      }
    } catch (err) {
      console.warn("[Redis OTP Store Incr Error, falling back to memory]", err.message);
    }
    return await memoryOTPStore.incr(key);
  },

  async expire(key, durationSeconds) {
    try {
      if (redisOTP && redisOTP.status === "ready") {
        return await redisOTP.expire(key, durationSeconds);
      }
    } catch (err) {
      console.warn("[Redis OTP Store Expire Error, falling back to memory]", err.message);
    }
    return await memoryOTPStore.expire(key, durationSeconds);
  }
};

router.post("/createaccount", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await USER.findOne({ email }).select({ _id: 1 }).lean();
    if (user) {
      return res.status(400).send({
        msg: "Email already exists",
      });
    }

    const existingOTP = await otpStore.get(`otp:${email}`);
    if (existingOTP) {
      return res.status(400).send({
        msg: "OTP already sent. Please wait 5 minutes.",
      });
    }

    const genOTP = Math.floor(10000 + Math.random() * 90000).toString();
    await otpStore.set(`otp:${email}`, genOTP, "EX", 300);

    console.log("Attempting to send email...");
    try {
      await sendOTP(email, genOTP);
    } catch (mailErr) {
      console.log("MAIL ERROR:", mailErr);
      try {
        await otpStore.del(`otp:${email}`);
      } catch (redisErr) {
        // Ignore
      }
      return res.status(500).send({
        msg: "Failed to send OTP",
      });
    }

    return res.send({ msg: "OTP sent successfully" });
  } catch (err) {
    console.error("Create Account Error:", err);
    return res.status(500).send({
      msg: "Verification service temporarily unavailable. Please try again later.",
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    const foundOTP = await otpStore.get(`otp:${email}`);

    if (!foundOTP) {
      return res.status(400).send({
        msg: "OTP expired or not found",
      });
    }

    if (foundOTP !== otp) {
      const attempts = await otpStore.incr(`attempts:${email}`);

      await otpStore.expire(`attempts:${email}`, 300);

      if (attempts >= 3) {
        await otpStore.del(`otp:${email}`);
        await otpStore.del(`attempts:${email}`);

        return res.status(429).send({
          msg: "Maximum OTP attempts exceeded. Please request a new OTP.",
        });
      }

      return res.status(400).send({
        msg: "Wrong OTP!",
        attemptsLeft: 3 - attempts,
      });
    }

    const user = await USER.findOne({ email }).select({ _id: 1 }).lean();

    if (user) {
      return res.status(400).send({
        msg: "Email already exists",
      });
    }

    await USER.create({
      userName: name,
      email,
      password,
    });

    await otpStore.del(`otp:${email}`);
    await otpStore.del(`attempts:${email}`);

    return res.status(200).send({
      msg: "User verified and created!",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).send({
      msg: "Something went wrong",
    });
  }
});

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
};

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const token = await USER.matchPasswordAndGenToken(email, password);
    const user = await USER.findOne({ email }).select({ _id: 1, userName: 1, email: 1 }).lean();

    res.cookie("Token", token, cookieOptions);

    return res.send({
      msg: "Logged In",
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(400).send({
      msg: error.message,
    });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("Token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  return res.send({
    msg: "Logged Out",
  });
});

router.get("/current-user", (req, res) => {
  return res.send({
    user: req.user || null,
  });
});

// POST endpoint for Google Sign-In verification and login
router.post("/google-login", async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).send({ msg: "Google credential token is required" });
  }

  try {
    // 1. Verify token with Google API
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!response.ok) {
      const errText = await response.text();
      return res.status(400).send({ msg: "Invalid Google token", error: errText });
    }

    const payload = await response.json();
    
    // Optional check: verify that client ID aud matches ours
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId && payload.aud !== clientId) {
      return res.status(400).send({ msg: "Token was not generated for this application" });
    }

    const { email, name } = payload;
    if (!email) {
      return res.status(400).send({ msg: "Google account does not provide an email" });
    }

    // 2. Find or create user
    let user = await USER.findOne({ email });
    if (!user) {
      // Create new user with random password (schema requires password)
      const randPassword = randomBytes(16).toString("hex");
      user = await USER.create({
        userName: name || email.split("@")[0],
        email,
        password: randPassword,
      });
    }

    // 3. Generate token and set cookie
    const token = createTokenForUser(user);
    res.cookie("Token", token, cookieOptions);

    return res.send({
      msg: "Logged In with Google",
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Google Login Error:", err);
    return res.status(500).send({ msg: "Google login service failed. Please try again." });
  }
});

export default router;
