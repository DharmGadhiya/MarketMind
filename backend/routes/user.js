const { Router } = require("express");
const router = Router();
const USER = require("../models/user");
const Redis = require("ioredis");

const redisOTP = new Redis(process.env.REDIS_URL);

async function sendOTP(email, otp) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY.trim(),
    },
    body: JSON.stringify({
      sender: {
        name: "Lost & Found Portal",
        email: process.env.EMAIL,
      },
      to: [
        {
          email: email,
        },
      ],
      subject: "Lost & Found Portal OTP Verification",
      htmlContent: `
          <h2>Verify Your Account</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
        `,
    }),
    
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

redisOTP.on("connect", () => {
  console.log("Redis Connected");
});

router.post("/createaccount", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await USER.findOne({ email });
    if (user) {
      return res.status(400).send({
        msg: "Email already exists",
      });
    }
  } catch (err) {
    return res.status(400).send({ msg: "Something went wrong" });
  }
  const existingOTP = await redisOTP.get(`otp:${email}`);

  if (existingOTP) {
    return res.status(400).send({
      msg: "OTP already sent. Please wait 5 minutes.",
    });
  }
  const genOTP = Math.floor(10000 + Math.random() * 90000).toString();
  try {
    await redisOTP.set(`otp:${email}`, genOTP, "EX", 300);

    console.log("Attempting to send email...");
    await sendOTP(email, genOTP);
  } catch (err) {
    console.log("MAIL ERROR:", err);

    await redisOTP.del(`otp:${email}`);

    return res.status(500).send({
      msg: "Failed to send OTP",
    });
  }

  return res.send({ msg: "OTP sent successfully" });
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    const foundOTP = await redisOTP.get(`otp:${email}`);

    if (!foundOTP) {
      return res.status(400).send({
        msg: "OTP expired or not found",
      });
    }

    if (foundOTP !== otp) {
      const attempts = await redisOTP.incr(`attempts:${email}`);

      await redisOTP.expire(`attempts:${email}`, 300);

      if (attempts >= 3) {
        await redisOTP.del(`otp:${email}`);
        await redisOTP.del(`attempts:${email}`);

        return res.status(429).send({
          msg: "Maximum OTP attempts exceeded. Please request a new OTP.",
        });
      }

      return res.status(400).send({
        msg: "Wrong OTP!",
        attemptsLeft: 3 - attempts,
      });
    }

    const user = await USER.findOne({ email });

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

    await redisOTP.del(`otp:${email}`);
    await redisOTP.del(`attempts:${email}`);

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

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const token = await USER.matchPasswordAndGenToken(email, password);

    res.cookie("Token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.send({
      msg: "Logged In",
      user: req.body,
    });
  } catch (error) {
    return res.send({
      msg: error.message,
    });
  }
});

router.get("/current-user", (req, res) => {
  return res.send({
    user: req.user || null,
  });
});

module.exports = router;
