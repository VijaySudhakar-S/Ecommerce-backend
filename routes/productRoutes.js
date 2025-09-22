import express from "express";
import {
  addProduct,
  getProducts,
  getFeaturedProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  getRelatedProducts,
} from "../controllers/productController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public Routes
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);

// Admin Routes
router.post("/", protect, admin, addProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

export default router;
