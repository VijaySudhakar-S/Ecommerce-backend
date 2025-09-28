import User from "../models/User.js";

//addAddress
export const addAddress = async (req, res) => {
  try {
    const { type, street, city, state, zipCode, isDefault } = req.body;

    if (!street || !city || !state || !zipCode) {
      return res.status(400).json({ message: "All required address fields must be provided." });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.addresses.length === 2) {
      return res.status(400).json({ message: "Only Add Upto 2 address" });
    }

    const newAddress = { type, street, city, state, zipCode, isDefault };

    if (newAddress.isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully!",
      addresses: user.addresses
    });

  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ message: "Server error while adding address." });
  }
};

//updateAddress
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { type, street, city, state, zipCode, isDefault } = req.body;

    if (!street || !city || !state || !zipCode) {
      return res.status(400).json({ message: "All required address fields must be provided." });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found." });
    }

    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      type,
      street,
      city,
      state,
      zipCode,
      isDefault: isDefault || user.addresses[addressIndex].isDefault
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully!",
      addresses: user.addresses
    });

  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ message: "Server error while updating address." });
  }
};

//deleteAddress
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found." });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    
    user.addresses.splice(addressIndex, 1);
    
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully!",
      addresses: user.addresses
    });

  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Server error while deleting address." });
  }
};


//================================== Cart ===========================================


// Add to Cart
export const addToCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { cart } = req.body;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = [];
    
    // Add all items from the cart array
    for (const item of cart) {
      const existingItem = user.cart.find(
        cartItem => cartItem.productId.toString() === item.productId
      );

      if (existingItem) {
        existingItem.quantity = item.quantity;
      } else {
        user.cart.push({ 
          productId: item.productId, 
          quantity: item.quantity 
        });
      }
    }

    await user.save();
    res.json(user.cart);
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: error.message });
  }
};

// Remove from Cart
export const removeFromCart = async (req, res) => {
  try {
    const { id, productId } = req.params;
    const user = await User.findById(id);

    user.cart = user.cart.filter(item => item.productId.toString() !== productId);

    await user.save();
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Products from Cart
export const getCart = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate("cart.productId");
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//================================== Wishlist ===========================================

//  Add to Wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;

    const user = await User.findById(id);
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
    }

    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Remove from Wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { id, productId } = req.params;
    const user = await User.findById(id);

    user.wishlist = user.wishlist.filter(pid => pid.toString() !== productId);

    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get from wishlist
export const getWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate("wishlist");
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
