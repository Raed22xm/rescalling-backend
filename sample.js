import express from "express";

const app = express();
const PORT = 5000;

// Middleware to parse JSON data
app.use(express.json());

// Sample product data (you can replace with DB later)
let products = [
  { id: 1, name: "Laptop", price: 70000, category: "Electronics" },
  { id: 2, name: "Phone", price: 30000, category: "Electronics" },
  { id: 3, name: "Shoes", price: 2000, category: "Fashion" },
];

// ✅ GET all products
app.get("/api/products", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    data: products,
  });
});

// ✅ GET single product by ID
app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const product = products.find((p) => p.id === parseInt(id));
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  res.json({ success: true, data: product });
});

// ✅ POST - Add new product
app.post("/api/products", (req, res) => {
  const { name, price, category } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const newProduct = {
    id: products.length + 1,
    name,
    price,
    category,
  };

  products.push(newProduct);
  res.status(201).json({
    success: true,
    message: "Product added successfully",
    data: newProduct,
  });
});

// ✅ PUT - Update product by ID
app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, price, category } = req.body;
  const productIndex = products.findIndex((p) => p.id === parseInt(id));

  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  products[productIndex] = {
    ...products[productIndex],
    name: name || products[productIndex].name,
    price: price || products[productIndex].price,
    category: category || products[productIndex].category,
  };

  res.json({
    success: true,
    message: "Product updated successfully",
    data: products[productIndex],
  });
});

// ✅ DELETE - Remove product by ID
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const productIndex = products.findIndex((p) => p.id === parseInt(id));

  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const deletedProduct = products.splice(productIndex, 1);
  res.json({
    success: true,
    message: "Product deleted successfully",
    data: deletedProduct[0],
  });
});

// Server start
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
