const mongoose = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { createTokenForUser } = require("../services/Authentication");

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre("save", async function () {
  const user = this;

  if (!user.isModified("password")) return;
  const secSalt = randomBytes(16).toString("hex");

  const hshPass = createHmac("sha256", secSalt)
    .update(user.password)
    .digest("hex");
  user.password = hshPass;
  user.salt = secSalt;
});

UserSchema.statics.matchPasswordAndGenToken = async function (email, password) {
  const user = await this.findOne({ email });

  if (!user) throw new Error("User not found");
  const UserPass = createHmac("sha256", user.salt)
    .update(password)
    .digest("hex");

  if (UserPass !== user.password) throw new Error("Invalid password");
  const token = createTokenForUser(user);
  return token;
};

module.exports = mongoose.model("User", UserSchema);
