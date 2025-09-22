import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amt: { type: Number, required: true },
    pic: { type: String, required: true }, 
    images: [{ type: String }],
    category: {
      type: String,
      enum: ["T-Shirts", "Chocolates", "Frames", "Flowers", "Lamps", "Cups", "Key Chains", "Home Decor"],
      required: true,
    },
    description: { type: String, default: "No description available" },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    reviewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
