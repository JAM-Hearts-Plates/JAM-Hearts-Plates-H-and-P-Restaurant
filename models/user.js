import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    fullName: { type: String, required: true },
    // lastName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "manager", "ceo", "chef", "waitstaff", "finance", "admin"],
      default: "user",
    },
    isVIP: {
      type: Boolean,
      default: false,
    },
    vipLevel: {
      type: String,
      enum: ["silver", "gold", "platinum"],
      default: null,
    },
    vipSince: Date,
    vipExpiresAt: Date,
    resetPasswordExpires: { type: Date }, // Expiry timestamp for the reset token
  },
  {
    timestamps: true,
  }
);

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password;
  },
});

export const UserModel = model("User", userSchema);
