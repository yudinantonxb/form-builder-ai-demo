// --- 1. IMPORTS AND INITIAL SETUP ---
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import OpenAI from 'openai';
import { generateFormBuilderPrompt } from './formBuilderPrompt.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const http = createServer(app);

// --- 2. SECURITY & CONNECTION SETUP ---

// Flexible CORS setup: allow connections only from the frontend's origin
const allowedOriginsString = process.env.CORS_ALLOWED_ORIGINS || "http://localhost:3002,http://127.0.0.1:3002";
const allowedOrigins = allowedOriginsString.split(',').map(origin => origin.trim());

const io = new Server(http, {
    cors: {
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            // or from our list of allowed origins
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`CORS policy does not allow access from: ${origin}`));
            }
        },
        methods: ["GET", "POST"]
    }
});

// Initialize the OpenAI client with keys from the .env file
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
});

// Serve the static frontend files (index.html, app.js, etc.)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// --- 3. MAIN LOGIC: WEBSOCKET CONNECTION HANDLING ---
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('generate_form', async (userRequest, callback) => {
        const systemPrompt = generateFormBuilderPrompt();
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userRequest }
        ];

        console.log(`Received form generation request: "${userRequest}"`);

        try {
            const res = await openai.chat.completions.create({
                model: 'gpt-4.1-nano',
                messages: messages,
                temperature: 0.2, 
                response_format: { "type": "json_object" } 
            });

            const jsonString = res.choices[0].message.content.trim();
            console.log("--- RAW AI RESPONSE --- \n", jsonString, "\n-----------------------");

            // Use the callback to send a success response to the specific client
            callback({ success: true, json: jsonString });

        } catch (e) {
            console.error("OpenAI API Error:", e);
            // Use the callback to send an error response
            callback({ success: false, error: e.message || "Failed to generate form from AI." });
        }
    });
});

// --- 4. START THE SERVER ---
const PORT = process.env.PORT || 3002;
http.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));