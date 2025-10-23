const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
const public_users = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');

let users = []; 

const doesExist = (username) => {
  return users.some((user) => user.username === username);
};

// Register new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (doesExist(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Save user
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered" });
});

// Get the book list available in the shop
public_users.get('/', function(req, res) {
    new Promise((resolve, reject) => {
        resolve(books);
    }).then((booksList) => {
        res.status(200).send(JSON.stringify(booksList, null, 4));
    }).catch((err) => {
        res.status(500).json({ message: "Error fetching books", error: err });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function(req, res) {
    try {
        const isbn = req.params.isbn;
        const book = books[isbn];
        if (!book) throw new Error("Book not found");
        res.status(200).send(JSON.stringify(book, null, 4));
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

  
// Get book details based on author
public_users.get('/author/:author', async function(req, res) {
    try {
        const author = req.params.author.toLowerCase();
        const keys = Object.keys(books);
        let result = [];

        keys.forEach((key) => {
            if (books[key].author.toLowerCase() === author) {
                result.push(books[key]);
            }
        });
        if (result.length > 0) {
            return res.status(200).send(JSON.stringify(result, null, 4));
        } else {
            return res.status(404).json({ message: "No books found for this author" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
});


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
  const title = req.params.title.toLowerCase();
  const keys = Object.keys(books);
  let result = [];

  keys.forEach((key) => {
    if (books[key].title.toLowerCase() === title) {
      result.push(books[key]);
    }
  });

  if (result.length > 0) {
    return res.status(200).send(JSON.stringify(result, null, 4));
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }}catch (err){
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
module.exports.users = users;