import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  type: { type: String, enum: ["home", "work", "other"], default: "home" },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, default: "India" },
  isDefault: { type: Boolean, default: false }
});

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1 }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
  otpAttempts: { type: Number, default: 0 },
  passwordResetToken: String,
  passwordResetExpires: Date,
  addresses: [addressSchema],
  status: { 
    type: String, 
    enum: ["active", "inactive", "suspended"], 
    default: "inactive"
  },
  cart: [cartItemSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }]

}, { timestamps: true });

export default mongoose.model("User", userSchema);
