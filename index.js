import "dotenv/config";
import express from "express";
import cors from "cors";
import user from "./db/User.js";
import connectDB from "./db/config.js";
import product from "./db/Product.js";
import jsonwebtoken from "jsonwebtoken";

const jwtKey = process.env.JWT_SECRET || "e-comm";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "authorization"],
  })
);

// Health check endpoint for hosting platforms (Render, Railway, etc.)
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "E-Commerce Dashboard API is running" });
});

app.post("/register", async (req, res) => {
  try {
    const savedUser = await user.create(req.body);
    jsonwebtoken.sign({ savedUser }, jwtKey, { expiresIn: "2h" }, (err, token) => {
      if (err) {
        return res.status(500).json({ message: "Registration token error" });
      }
      res.status(201).json({

        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        auth: token
      });
    });
  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const foundUser = await user.findOne({ email, password });
    if (!foundUser) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    jsonwebtoken.sign({ foundUser }, jwtKey, { expiresIn: "2h" }, (err, token) => {
      if (err) {
        return res.status(500).json({ message: "Authentication token error" });
      }
      res.status(200).json({

        _id: foundUser._id,
        username: foundUser.username,
        email: foundUser.email,
        auth: token
      });
    });

  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

app.post("/add-product", verifyToken, async (req, res) => {
  try {
    const newProduct = await product.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Adding product failed:", error);
    res.status(500).json({ message: "Adding product failed" });
  }
});

app.get("/products", verifyToken, async (req, res) => {
  try {
    const products = await product.find();
    res.status(200).json(products);
    // console.log("Products fetched successfully:", products);
  } catch (error) {
    console.error("Fetching products failed:", error);
    res.status(500).json({ message: "Fetching products failed" });
  }
});

app.delete("/products/:id", verifyToken, async (req, res) => {
  try {
    const result = await product.deleteOne({ _id: req.params.id });
    res.status(200).json(result);
  } catch (error) {
    console.error("Deleting product failed:", error);
    res.status(500).json({ message: "Deleting product failed" });
  }
});

app.get("/products/:id", verifyToken, async (req, res) => {
  try {
    const foundProduct = await product.findById(req.params.id);
    if (!foundProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(foundProduct);
  } catch (error) {
    console.error("Fetching product failed:", error);
    res.status(500).json({ message: "Fetching product failed" });
  }
});

app.put("/products/:id", verifyToken, async (req, res) => {
  try {
    const updatedProduct = await product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Updating product failed:", error);
    res.status(500).json({ message: "Updating product failed" });
  }
});

function verifyToken(req, res, next) {
  let token = req.headers['authorization'];
  if (token && token !== "null" && token !== "undefined") {
    if (token.startsWith("Bearer ") || token.startsWith("bearer ")) {
      token = token.slice(7).trim();
    }
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
    jsonwebtoken.verify(token, jwtKey, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Failed to authenticate token' });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    return res.status(403).json({ message: 'No token provided' });
  }
}


const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (error) {
    console.error("Could not connect to MongoDB:", error);
  }
};

startServer();