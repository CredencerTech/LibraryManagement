const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb://localhost:27017/Login");


const bookSchema = new mongoose.Schema({
    bookId: { type: String, required: true, unique: true },
    bookName: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    bookImage: { type: String, required: true } // Store the path to the image
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
