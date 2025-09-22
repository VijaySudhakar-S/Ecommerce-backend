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