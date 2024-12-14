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

// Get book lists
const getBooks = () => {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
};

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const bookList = await getBooks();
        res.json(bookList); // Neatly format JSON output
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving book list" });
    }
});

const getByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        let isbnNum = parseInt(isbn);
        if (isNaN(isbnNum)) {
            return reject({ status: 400, message: 'Invalid ISBN' });
        }
        if (books[isbnNum]) {
            resolve(books[isbnNum]);
        } else {
            reject({ status: 404, message: `ISBN ${isbn} not found` });
        }
    });
};

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const book = await getByISBN(req.params.isbn);
        res.send(book);
    } catch (error) {
        res.status(error.status).json({ message: error.message });
    }
});

// Helper function to get books by a specific field
const getBooksByField = async (field, value) => {
    const bookEntries = await getBooks();
    return Object.values(bookEntries).filter((book) => book[field] === value);
};

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    try {
        const booksByAuthor = await getBooksByField('author', req.params.author);
        res.send(booksByAuthor);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books by author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    try {
        const booksByTitle = await getBooksByField('title', req.params.title);
        res.send(booksByTitle);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books by title" });
    }
});

// Get book review
public_users.get('/review/:isbn', async (req, res) => {
    try {
        const book = await getByISBN(req.params.isbn);
        res.send(book.reviews);
    } catch (error) {
        res.status(error.status).json({ message: error.message });
    }
});

module.exports.general = public_users;
