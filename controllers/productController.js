import Product from "../models/Product.js";

// Add new product (Admin only)
export const addProduct = async (req, res) => {
  try {
    const { name, amt, pic, images, category, description, stock } = req.body;

    const product = new Product({
      name,
      amt,
      pic,
      images,
      category,
      description,
      stock,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: "Failed to add product", error });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error });
  }
};

// Get featured products (e.g., top 4 with highest rating)
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ rating: -1 }).limit(4);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch featured products", error });
  }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const { name, amt, pic, images, category, description, stock } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.name = name || product.name;
    product.amt = amt || product.amt;
    product.pic = pic || product.pic;
    product.images = images || product.images;
    product.category = category || product.category;
    product.description = description || product.description;
    product.stock = stock ?? product.stock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error });
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    res.json({ message: "Product removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error });
  }
};

// Get Single Product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error });
  }
};

// Get Related Products
export const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);

    res.json(related);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch related products", error });
  }
};
