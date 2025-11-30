import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    email: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    passwordHash: {
      type: String,
      required: function () {
        return !this.googleId && !this.isPendingRegistration; 
      },
      select: false,
    },

    profilePicture: {
      type: String,
      validate: {
        validator: function (v) {
          return v.startsWith("/") || /^https?:\/\/.+\..+/.test(v);
        },
        message: "Invalid URL format for profile picture",
      },
    },
    bio: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    socialLinks: {
      twitter: {
        type: String,
        match: [
          /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/,
          "Invalid X/Twitter URL. Example: https://x.com/username or https://twitter.com/username",
        ],
      },
      linkedin: {
        type: String,
        match: [
          /^https?:\/\/(www\.)?linkedin\.com\/.*/,
          "Invalid LinkedIn URL",
        ],
      },
      website: {
        type: String,
        match: [/^https?:\/\/.+\..+/, "Invalid website URL"],
      },
      instagram: {
        type: String,
        match: [
          /^https?:\/\/(www\.)?instagram\.com\/.*/,
          "Invalid Instagram URL",
        ],
      },
    },
    profileVisibility: {
      type: String,
      enum: ["public", "private", "friends"],
      default: "public",
    },
    emailNotifications: {
      newFeedback: { type: Boolean, default: false },
    },

    accountDeletionToken: {
      type: String,
      select: false,
    },
    magicLinkToken:{type: String, select: false},
    magicLinkExpires:{type: Date, select:false},

    isPendingRegistration: { 
      type: Boolean, 
      default: false,
      index: true 
    },
    
    accountDeletionTokenExpiry: {
      type: Date,
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedIps: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

userSchema.statics.hashPassword = async function (password) {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (err) {
    throw new Error("Error hashing password");
  }
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    if (!this.passwordHash) {
      throw new Error("Password hash not available for comparison");
    }
    const isMatch = await bcrypt.compare(candidatePassword, this.passwordHash);
    return isMatch;
  } catch (err) {
    throw new Error("Error comparing passwords");
  }
};

userSchema.index({ 
  isPendingRegistration: 1, 
  isActive: 1, 
  magicLinkExpires: 1 
});

const User = mongoose.model("User", userSchema);

export default User;
