const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

//only registered users can login
const isValid = (username) => {
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => { //returns boolean
    return users.some(user => user.username === username && user.password === password);
}

regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!isValid(username)) {
        return res.status(400).json({ message: "Invalid username" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign(
            { username: username },
            'access',
            { expiresIn: 60 * 60 }
        );
        req.session.authorization = { accessToken };
        return res.status(200).send("Customer successfully logged in");
    } else {
        return res.status(208).send("Incorrect Login. Check credentials");
    }
});

// Add a book review
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

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const { isbn } = req.params;

    if (!books[isbn]) {
        return res.status(404).json({ message: 'Book not found' });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: 'Review not found' });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({ message: 'Review deleted successfully' });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
