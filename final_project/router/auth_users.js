const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    { username: 'admin', password: 'admin' }
];
const JWT_SECRET = ('hsjdfh_234HAJKSHKDF&4');

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

// Add a book review (placeholder for your code)
regd_users.put("/auth/review/:isbn", (req, res) => {
    // Placeholder response, you can implement this as needed
    const isbn = req.params.isbn;
  const review = req.query.review;  // Get the review text from the query string
  const username = req.user.username; // Username from the JWT

  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  if (books[isbn]) {
    // Ensure the book has a reviews object
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
    // Add or update the review for this username
    books[isbn].reviews[username] = review;
    return res.status(200).json({ 
      message: "Review added/updated successfully", 
      reviews: books[isbn].reviews 
    });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
