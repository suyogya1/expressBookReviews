const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    { username: 'admin', password: 'admin' }
];

const JWT_SECRET = 'access';

// Function to check if the username exists
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Function to check if the username and password match
const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);
    return user ? user.password === password : false;
};

// Middleware for authenticating JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(403).json({ message: "User not logged in" });
    }

    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "User not authenticated" });
        }
        req.user = user;
        next();
    });
};

// POST route for user login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required!" });
    }

    if (authenticatedUser(username, password)) {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: "Login successful", token });
    } else {
        res.status(401).json({ message: "Invalid username or password" });
    }
});

// PUT route to add or modify a review
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.user.username; 

    if (!review) {
        return res.status(400).json({ message: "Review text is required" });
    }

    if (!books[isbn]) {
        books[isbn] = { title: "Unknown Title", author: "Unknown Author", reviews: {} };
    }

    books[isbn].reviews[username] = review;

    res.status(200).json({
        message: `Review for ISBN ${isbn} by user ${username} has been added/updated.`,
        book: books[isbn]
    });
});

// DELETE route to remove a user's review
regd_users.delete("/auth/review/:isbn", authenticateToken, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;

    if (!books[isbn] || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found" });
    }

    delete books[isbn].reviews[username];

    res.status(200).json({
        message: `Review for ISBN ${isbn} by user ${username} has been deleted.`,
        book: books[isbn]
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
