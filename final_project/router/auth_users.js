const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    { username: 'admin', password: 'admin' }
];
const JWT_SECRET = ('mySuperSecretKey123');

// Function to check if the username is valid (returns boolean)
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Function to check if the username and password match (returns boolean)
const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);
    return user ? user.password === password : false;
};

// POST route for user login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required!" });
    }

    // Validate the username and password
    if (authenticatedUser(username, password)) {
        // Create a JWT token for the authenticated user
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' }); // token expires in 1 hour

        // Send the JWT token as a response
        res.status(200).json({ message: "Login successful", token });
    } else {
        res.status(401).json({ message: "Invalid username or password" });
    }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.user.username; // Username from the JWT

    if (!username) {
        return res.status(401).json({ message: "Unauthorized. Please log in" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review text is required" });
    }

    if (!books[isbn]) {
        books[isbn] = { title: "Unknown Title", author: "Unknown Author", reviews: {} };
    }

    // If the user has already reviewed the book, modify the existing review
    if (books[isbn].reviews[username]) {
        books[isbn].reviews[username] = review; // Modify the review
    } else {
        // Otherwise, add a new review
        books[isbn].reviews[username] = review;
    }

    res.status(200).json({
        message: `Review for ISBN ${isbn} by user ${username} has been added/updated.`,
        book: books[isbn]
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username; // Username from the JWT

    if (!username) {
        return res.status(401).json({ message: "Unauthorized. Please log in" });
    }

    if (!books[isbn] || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found" });
    }

    // Delete the review for the specific ISBN and username
    delete books[isbn].reviews[username];

    res.status(200).json({
        message: `Review for ISBN ${isbn} by user ${username} has been deleted.`,
        book: books[isbn]
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
