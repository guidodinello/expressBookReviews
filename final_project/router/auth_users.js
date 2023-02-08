const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    return users.find(user => user.username === username) !== undefined;
}

const authenticatedUser = (username, password) => { //returns boolean
    return users.find(user => user.username === username && user.password === password) !== 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!(username && password))
        return res.status(400).json({ message: "Username and password must be provided!" });    
    if (!authenticatedUser(username, password))
        return res.status(401).json({ message: "Invalid username or password!" });
    
    // create and save credentials
    const accessToken = jwt.sign({ data : password }, "access", { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return res.status(200).send("User successfully logged in!");
});

// Add (or modify) a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const book = books[req.params.isbn];
    if (book) {
        const { review } = req.query;
        if (!review)
            return res.status(400).json({ message: "No review provided!" });
        book.reviews[req.session.authorization.username] = review;
        return res.status(201).json({ message: "Review added!" });
    }
    return res.status(404).json({ message: "No books found for this ISBN" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const book = books[req.params.isbn];
    if (book) {
        const bookUsrReviews = book.reviews[req.session.authorization.username];
        if (!bookUsrReviews)
            return res.status(404).json({ message: "No review found for this user" });
        delete bookUsrReviews;
        return res.status(200).json({ message: "Review deleted!" });
    }
    return res.status(404).json({ message: "No books found for this ISBN" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
