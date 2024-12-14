const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", async (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    // Create new user
    const newUser = { username, password };
    users.push(newUser);

    return res.status(201).json({ message: 'User registered successfully' });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        res.send(JSON.stringify({ books }, null, 4));
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving book list' });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        const bookDetails = books[isbn];
        if (bookDetails) {
            return res.status(200).json(bookDetails);
        } else {
            return res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving book details' });
    }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;

    try {
        const booksByAuthor = Object.values(books).filter(book => book.author === author);
        if (booksByAuthor.length > 0) {
            return res.status(200).json(booksByAuthor);
        } else {
            return res.status(404).json({ message: 'No book found for this author' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving books by author' });
    }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;

    try {
        const booksByTitle = Object.values(books).filter(book => book.title === title);
        if (booksByTitle.length > 0) {
            return res.status(200).json(booksByTitle);
        } else {
            return res.status(404).json({ message: 'No book with this title' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving books by title' });
    }
});

// Get book review
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        const bookDetails = books[isbn];
        if (bookDetails) {
            return res.status(200).json(bookDetails);
        } else {
            return res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving book review' });
    }
});

module.exports.general = public_users;
