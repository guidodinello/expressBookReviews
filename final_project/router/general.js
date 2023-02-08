const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    // if one of those wasnt provided
    if (!(username || password))
        return res.status(400).json({ message: "Username and password must be provided!" });
    // if the username is already taken
    if (isValid(username))
        return res.status(400).json({ message: "Username already taken!" });
    // if the username is valid
    users.push({ username, password });
    return res.status(201).json({ message: "User created!" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const book = books[req.params.isbn];
    if (book)
        return res.send(JSON.stringify(book, null, 4));
    return res.status(404).json({ message: "No books found for this ISBN" });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const matches = Object.values(books).filter(book => book.author === req.params.author);
    if (matches.length === 0)
        return res.status(404).json({ message: "No books found for this author" });
    return res.send(JSON.stringify(matches, null, 4));
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const matches = Object.values(books).filter(book => book.title === req.params.title);
    if (matches.length === 0)
        return res.status(404).json({ message: "No books found for this title" });
    return res.send(JSON.stringify(matches, null, 4));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const book = books[req.params.isbn];
    if (book)
        return res.send(JSON.stringify(book.reviews, null, 4));
    return res.status(404).json({ message: "No books found for this ISBN" });
});

module.exports.general = public_users;
