import Product from "../models/product.model.js";

// add product :/api/product/add
export const addProduct = async (req, res) => {
  try {
    const { name, price, offerPrice, description, category, expiryDate } = req.body;
    // const image = req.files?.map((file) => `/uploads/${file.filename}`);
    const image = req.files?.map((file) => file.filename);
    if (
      !name ||
      !price ||
      !offerPrice ||
      !description ||
      !category ||
      !image ||
      image.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields including images are required",
      });
    }

    const product = new Product({
      name,
      price,
      offerPrice,
      description,
      category,
      image,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    });

    const savedProduct = await product.save();

    return res.status(201).json({
      success: true,
      product: savedProduct,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error("Error in addProduct:", error);

    return res
      .status(500)
      .json({ success: false, message: "Server error while adding product" });
  }
};

// get products :/api/product/get
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// get single product :/api/product/id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// change stock  :/api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    const product = await Product.findByIdAndUpdate(
      id,
      { inStock },
      { new: true }
    );
    res
      .status(200)
      .json({ success: true, product, message: "Stock updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// scan expiry dates :/api/product/scan-expiry
export const scanExpiryDates = async (req, res) => {
  try {
    const currentDate = new Date();
    const products = await Product.find({ expiryDate: { $exists: true } });
    
    const expiringSoon = [];
    const expired = [];
    
    products.forEach(product => {
      const daysUntilExpiry = Math.ceil((product.expiryDate - currentDate) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry < 0) {
        expired.push({
          ...product.toObject(),
          daysUntilExpiry
        });
      } else if (daysUntilExpiry <= 7) {
        expiringSoon.push({
          ...product.toObject(),
          daysUntilExpiry
        });
      }
    });
    
    res.status(200).json({
      success: true,
      expiringSoon,
      expired,
      totalExpiring: expiringSoon.length,
      totalExpired: expired.length
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// check product expiry :/api/product/check-expiry
export const checkProductExpiry = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    if (!product.expiryDate) {
      return res.status(200).json({ 
        success: true, 
        hasExpiry: false,
        message: "No expiry date set for this product" 
      });
    }
    
    const currentDate = new Date();
    const daysUntilExpiry = Math.ceil((product.expiryDate - currentDate) / (1000 * 60 * 60 * 24));
    
    let status = 'valid';
    let warning = '';
    
    if (daysUntilExpiry < 0) {
      status = 'expired';
      warning = `This product expired ${Math.abs(daysUntilExpiry)} days ago`;
    } else if (daysUntilExpiry <= 3) {
      status = 'critical';
      warning = `This product expires in ${daysUntilExpiry} days`;
    } else if (daysUntilExpiry <= 7) {
      status = 'warning';
      warning = `This product expires in ${daysUntilExpiry} days`;
    }
    
    res.status(200).json({
      success: true,
      hasExpiry: true,
      status,
      daysUntilExpiry,
      expiryDate: product.expiryDate,
      warning
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
