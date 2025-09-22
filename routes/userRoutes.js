import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { addAddress, updateAddress, deleteAddress } from "../controllers/userController.js";

const router = express.Router();

// User Profile
router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

// User Add Address
router.post("/profile/address", protect, addAddress);
router.put("/profile/address/:addressId", protect, updateAddress);
router.delete("/profile/address/:addressId", protect, deleteAddress);

export default router;