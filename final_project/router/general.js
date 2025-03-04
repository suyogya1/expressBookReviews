const express = require('express');
const axios = require('axios'); // Import axios
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required!" });
    }

    if (users[username]) {
        return res.status(400).json({ message: "Username already exists" });
    }

    users[username] = { password };
    res.status(201).json({ message: "User registered successfully" });
});

// Get the book list using Promises
public_users.get('/', (req, res) => {
    new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject({ message: "No books available." });
        }
    })
    .then(data => res.status(200).json(data))
    .catch(error => res.status(500).json(error));
});

// Get the book list using Async-Await with Axios
public_users.get('/async-books', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/');
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books.", error: error.message });
    }
});

// Get book details based on ISBN using Promise
public_users.get('/promise/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject({ message: "Book not found" });
        }
    })
    .then(data => res.status(200).json(data))
    .catch(error => res.status(404).json(error));
});

// Get book details based on ISBN using Async-Await with Axios
public_users.get('/async/isbn/:isbn', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${req.params.isbn}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ message: "Book not found", error: error.message });
    }
});

// Get book details based on Author using Promise
public_users.get('/promise/author/:author', (req, res) => {
    const authorName = req.params.author.toLowerCase();

    new Promise((resolve, reject) => {
        const foundBooks = Object.values(books).filter(book => book.author.toLowerCase() === authorName);
        if (foundBooks.length > 0) {
            resolve(foundBooks);
        } else {
            reject({ message: "No books found for this author." });
        }
    })
    .then(data => res.status(200).json(data))
    .catch(error => res.status(404).json(error));
});

// Get book details based on Author using Async-Await with Axios
public_users.get('/async/author/:author', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:5000/author/${req.params.author}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ message: "No books found for this author", error: error.message });
    }
});

// Get books based on Title using Promise
public_users.get('/promise/title/:title', (req, res) => {
    const titleName = req.params.title.toLowerCase();

    new Promise((resolve, reject) => {
        const foundBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(titleName));
        if (foundBooks.length > 0) {
            resolve(foundBooks);
        } else {
            reject({ message: "No books found with this title." });
        }
    })
    .then(data => res.status(200).json(data))
    .catch(error => res.status(404).json(error));
});

// Get books based on Title using Async-Await with Axios
public_users.get('/async/title/:title', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:5000/title/${req.params.title}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ message: "No books found with this title", error: error.message });
    }
});

// Get book details based on ISBN (standard method)
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        res.json(books[isbn]);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

// Get book details based on Author (standard method)
public_users.get('/author/:author', (req, res) => {
    const authorName = req.params.author.toLowerCase();
    const foundBooks = Object.values(books).filter(book => book.author.toLowerCase() === authorName);

    if (foundBooks.length > 0) {
        res.json(foundBooks);
    } else {
        res.status(404).json({ message: "No books found for this author." });
    }
});

// Get books based on Title (standard method)
public_users.get('/title/:title', (req, res) => {
    const titleName = req.params.title.toLowerCase();
    const foundBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(titleName));

    if (foundBooks.length > 0) {
        res.json(foundBooks);
    } else {
        res.status(404).json({ message: "No books found with this title" });
    }
});

// Get book reviews
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        if (Object.keys(books[isbn].reviews).length > 0) {
            res.json(books[isbn].reviews);
        } else {
            res.status(404).json({ message: "No reviews available for this book" });
        }
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
