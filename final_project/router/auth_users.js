const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if the username is valid (exists in the users array)
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    // Check if username and password match the one we have in records
    return users.some(user => user.username === username && user.password === password);
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        console.log('Username and password are required');
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // Validate user credentials
    if (!isValid(username)) {
        console.log('Invalid username');
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (!authenticatedUser(username, password)) {
        console.log('Invalid password');
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' });
    console.log('Login successful, token generated:', token);

    return res.status(200).json({ message: 'Login successful', token });
});


// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;
    let filtered_book = books[isbn]
    if (filtered_book) {
        let review = req.query.review;
        let reviewer = req.session.authorization['username'];
        if (review) {
            filtered_book['reviews'][reviewer] = review;
            books[isbn] = filtered_book;
        }
        res.send(`The review for the book with ISBN  ${isbn} has been added/updated.`);
    }
    else {
        res.send("Unable to find this ISBN!");
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;