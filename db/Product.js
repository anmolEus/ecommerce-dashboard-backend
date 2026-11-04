import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    userId: String,
    category: String,
    company: String,
});

const Product = mongoose.model("products", productSchema);

export default Product;

