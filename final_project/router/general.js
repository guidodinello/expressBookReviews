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
    if (!isValid(username))
        return res.status(400).json({ message: "Username already taken!" });

    users.push({ "username": username, "password": password });
    return res.status(201).json({ message: "User created!" });
});


const getAllBooks = () => { return new Promise((resolve, reject) => { return resolve(books)}) }
const getBookByISBN = (isbn) => { 
    return new Promise((resolve, reject) => { 
        if (books[isbn])    
            resolve(books[isbn]) 
        else
            reject({ status: 404, message: `No books found for ISBN ${isbn}` })
    }) 
}
const filterBooksBy = (conditionFunc, message) => {
    return new Promise((resolve, reject) => {
        const matches = Object.values(books).filter(book => conditionFunc(book));
        if (matches.length === 0)
            reject({ status: 404, message: `No books found for author ${author}` })
        else
            resolve(matches)
    })  
}

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    return getAllBooks()
    .then(books => res.send(JSON.stringify(books, null, 4)))
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    return getBookByISBN(req.params.isbn)
    .then(book => res.send(JSON.stringify(book, null, 4)))
    .catch(err => res.status(err.status).json({ message: err.message }))
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    return filterBooksBy(
        (book) => { book.author === req.params.author },
        `No books found for author ${req.params.author}`
    )
    .then(books => res.send(JSON.stringify(books, null, 4)))
    .catch(err => res.status(err.status).json({ message: err.message }))
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    return filterBooksBy(
        (book) => { book.title === req.params.title },
        `No books found for title ${req.params.title}`
    )
    .then(books => res.send(JSON.stringify(books, null, 4)))
    .catch(err => res.status(err.status).json({ message: err.message }))
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    return getBookByISBN(req.params.isbn)
    .then(book => res.send(JSON.stringify(book.reviews, null, 4)))
    .catch(err => res.status(err.status).json({ message: err.message }))
});

module.exports.general = public_users;
