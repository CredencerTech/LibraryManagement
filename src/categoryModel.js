const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb://localhost:27017/Login");

// Define the category schema
const categorySchema = new mongoose.Schema({
    categoryId: {
        type: String,
        required: true,
        unique: true
    },
    categoryName: {
        type: String,
        required: true
    },
    categoryImage: {
        type: String, // Store image path or URL
        required: true
    }
});

// Create the model for categories
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;