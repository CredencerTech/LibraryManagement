const express = require("express");
const path = require("path");
const collection = require("./config"); // Assuming config.js for users
const Category = require("./categoryModel"); // Assuming categoryModel.js for categories
const Book =  require("./addbookmodel");
const multer = require('multer'); // To handle image uploads
const bcrypt = require('bcrypt');
const app = express();


// Set up storage for image uploads using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); // Images will be saved in public/uploads folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Name image uniquely with current timestamp
    }
});
const upload = multer({ storage });

// Middleware
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");



app.get("/signup", (req, res) => {
    res.render("signup");
});


app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/home", (req, res) => {
    res.render("home");
});


app.get("/", (req, res) => {
    res.render("navbar");
});

app.get("/navbar", (req, res) => {
    res.render("navbar");
});


app.get("/fictionbooks",(req,res)=>{
    res.render("fictionbooks");
});

app.get("/actionbooks",(req,res)=>{
    res.render("actionbooks");
});

app.get("/borrowbooks",(req,res)=>{
    res.render("borrowbooks");
});
app.get("/mybooks",(req,res)=>{
    res.render("mybooks");
});



// Register User
app.post("/signup", async (req, res) => {
    try {
        const data = {
            name: req.body.username,
            password: req.body.password
        };

        const existingUser = await collection.findOne({ name: data.name });
        if (existingUser) {
            return res.render("signup", { errorMessage: 'User already exists. Please choose a different username.' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;

        await collection.insertMany(data);
        res.render("signup", { errorMessage: 'Registration successful! Please log in.' });
    } catch (err) {
        res.render("signup", { errorMessage: 'An error occurred. Please try again.' });
    }
});

// Login User
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            return res.render("login", { errorMessage: 'User not found. Please sign up first.' });
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            return res.render("login", { errorMessage: 'Incorrect password. Please try again.' });
        }

        res.render("home");
    } catch (err) {
        res.render("login", { errorMessage: 'An error occurred. Please try again.' });
    }
});

app.get("/category", async (req, res) => {
    try {
        // Fetch all categories from the database
        const categories = await Category.find();
        res.render("category", { categories: categories, errorMessage: null });
    } catch (err) {
        res.render("category", { categories: [], errorMessage: 'An error occurred while fetching categories.' });
    }
});

// Add Category
app.post("/category", upload.single('categoryImage'), async (req, res) => {
    try {
        const data = {
            categoryId: req.body.categoryId,
            categoryName: req.body.categoryName,
            categoryImage: req.file.path // Image path is stored in the database
        };

        // Check if category ID already exists
        const existingCategory = await Category.findOne({ categoryId: data.categoryId });
        if (existingCategory) {
            return res.render("category", { errorMessage: 'Category ID already exists. Please use a different ID.' });
        }

        // Save category data to MongoDB
        const newCategory = new Category(data);
        await newCategory.save();
        res.render("category", { errorMessage: 'Category added successfully!' });
    } catch (err) {
        res.render("category", { errorMessage: 'An error occurred. Please try again.' });
    }
});

app.get("/admin", async (req, res) => {
    try {
        // Fetch categories from the database
        const categories = await Category.find({});
        
        // Render admin.ejs with the categories data
        res.render("admin", { categories, errorMessage: null });
    } catch (err) {
        // In case of an error, pass an error message
        res.render("admin", { categories: [], errorMessage: 'An error occurred while fetching categories.' });
    }
});





app.get("/addbook", async (req, res) => {
    try {
        const categories = await Category.find(); // Fetch categories from the database
        res.render("addbook", { categories, errorMessage: null, successMessage: null });
    } catch (error) {
        res.render("addbook", { categories: [], errorMessage: 'Error fetching categories. Please try again.', successMessage: null });
    }
});

// Route to handle form submission
app.post('/addbook', upload.single('bookImage'), async (req, res) => {
    const { bookId, bookName, author, category } = req.body;
    const bookImage = req.file.filename; // Get the uploaded file name

    try {
        const newBook = new Book({ bookId, bookName, author, category, bookImage });
        await newBook.save();
        res.render('addbook', { categories: await Category.find(), errorMessage: null, successMessage: 'Book record uploaded successfully!' });
    } catch (error) {
        res.render('addbook', { categories: await Category.find(), errorMessage: 'Error adding book. Please try again.', successMessage: null });
    }
});





// Define Port
const port = 5100;
app.listen(port, () => {
    console.log(`Server listening on port  ${port}`);
});
