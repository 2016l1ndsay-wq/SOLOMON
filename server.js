const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { Configuration, OpenAIApi } = require("openai");

dotenv.config();
const app = express();
app.use(bodyParser.json());

const users = {};
let messages = [];

// Auth middleware
const authenticateJWT = (req, res, next) => {
    const token = req.headers["authorization"];
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Register endpoint
app.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        return res.status(400).send("User already exists");
    }
    users[username] = { password };
    res.status(201).send("User registered");
});

// Login endpoint
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (user && user.password === password) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.json({ token });
    }
    res.status(401).send("Invalid credentials");
});

// Protected chat endpoint
app.post("/chat", authenticateJWT, async (req, res) => {
    const { message } = req.body;
    messages.push({ user: req.user.username, message });

    const configuration = new Configuration({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    
    try {
        const chatResponse = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }]
        });
        res.json(chatResponse.data.choices[0].message.content);
    } catch (error) {
        res.status(500).send("Error communicating with Anthropic API");
    }
});

// Endpoint to retrieve chat messages
app.get("/messages", authenticateJWT, (req, res) => {
    res.json(messages);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
