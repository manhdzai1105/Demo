const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
require("dotenv").config();

const imageAvatar = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1731513700/hc9crwt3for3cddi2pdc.jpg`;
const accountSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
    address: {
      type: String,
    },
    phone: {
      type: String,
      unique: true,
    },
    imageUrl: {
      type: String,
      default: imageAvatar,
    },
    publicId: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin", "manager"],
      default: "user",
      required: true,
    },
    refreshToken: {
      type: String,
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// xu ly bat dong bo
accountSchema.pre("save", async function (next) {
  const account = this;
  if (account.password) {
    // Mã hóa mật khẩu trước khi lưu
    account.password = await bcrypt.hash(account.password, 10);
  }
  next();
});

/* xu ly dong bo
accountSchema.pre('save', function (next) {
  const account = this;
  if (account.password) {
    // Mã hóa mật khẩu trước khi lưu
    account.password = bcrypt.hashSync(account.password, 10);
  }
  next();
});
*/

accountSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    update.password = await bcrypt.hash(update.password, 10);
    this.setUpdate(update);
  }
  next();
});

accountSchema.methods = {
  createPasswordChangeToken: async function () {
    const tokenReset = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(tokenReset)
      .digest("hex");
    this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await this.save();
    return tokenReset; // Trả về token gốc cho người dùng
  },
};

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
