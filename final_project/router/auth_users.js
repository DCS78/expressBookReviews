const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const crypto = require('crypto');

let users = [];

const generateSecretKey = () => {
    return crypto.randomBytes(32).toString('hex');
}
const secretKey = generateSecretKey();

//only registered users can login
const isValid = (username) => {
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => { //returns boolean
    return users.some(user => user.username === username && user.password === password);
}

regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!isValid(username, password)) {
        return res.status(400).json({ message: "Invalid username" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken, username

        }
        return res.status(200).send("Customer successfully logged in");
    } else {
        return res.status(208).send("Incorrect Login. Check credentials");
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;

    // Find the book with the given ISBN in the books database
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Ensure the book has a reviews array
    if (!Array.isArray(book.reviews)) {
        book.reviews = [];
    }

    // Add the review to the book
    book.reviews.push(review);

    return res.status(200).json({ message: "Book review added successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
