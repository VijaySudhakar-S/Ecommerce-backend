  import express from "express";
  import { protect } from "../middlewares/authMiddleware.js";
  import { addAddress, updateAddress, deleteAddress,addToCart,removeFromCart,getCart,addToWishlist,removeFromWishlist,getWishlist } from "../controllers/userController.js";

  const router = express.Router();

  // User Profile
  router.get("/profile", protect, (req, res) => {
    res.json(req.user);
  });

  // User Add Address
  router.post("/profile/address", protect, addAddress);
  router.put("/profile/address/:addressId", protect, updateAddress);
  router.delete("/profile/address/:addressId", protect, deleteAddress);

  // Cart
  router.post("/:id/cart", protect, addToCart);
  router.delete("/:id/cart/:productId", protect, removeFromCart);
  router.get("/:id/cart", protect, getCart);

  // Wishlist
  router.post("/:id/wishlist", protect, addToWishlist);
  router.delete("/:id/wishlist/:productId", protect, removeFromWishlist);
  router.get("/:id/wishlist", protect, getWishlist);

  export default router;