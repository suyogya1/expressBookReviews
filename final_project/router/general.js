const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(400).json({message: "Username and password required!"});
    }

    if (users[username]){
        return res.status(400).json({message: "Username already exists"});
    }
    users[username] = { password };
    res.status(201).json({message: "User registered successfully"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
    res.send(JSON.stringify(books,null,2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
    const isbn = req.params.isbn;

    if(books[isbn]){
        res.send(JSON.stringify(books[isbn], null, 2));
    } else {
        res.status(404).json({message : "Book not found"});
    }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
    const authorName = req.params.author;
    let foundBooks = [];

    for (let isbn in books){
        if (books[isbn].author.toLowerCase() === authorName.toLowerCase()){
            return res.send(JSON.stringify(books[isbn], null, 2));
        }
    }
    res.status(404).json({message : "No books found for this author."});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
    const titleName = req.params.title;
    let foundBooks = [];
    
    for (let isbn in books) {
        if (books[isbn].title.toLowerCase().includes(titleName)) {
          foundBooks.push(books[isbn]);
        }
      }

    if (foundBooks.length > 0){
        res.send(JSON.stringify(foundBooks,null,2));
    }else{
        res.status(404).json({message: "No books found with this title"});
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  if (books[isbn]) {
    if (Object.keys(books[isbn].reviews).length > 0) {
      res.send(JSON.stringify(books[isbn].reviews, null, 2));
    } else {
      res.status(404).json({ message: "No reviews available for this book" });
    }
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
