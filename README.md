# AI Form Builder for DHTMLX Suite

A full-stack web application that uses an AI language model to generate complex DHTMLX Form configurations from a simple natural language description.


## Features

-   **Natural Language to UI:** Describe your form in plain English (e.g., "A login form with email, password, and a remember me checkbox") and watch it come to life.
-   **Live Preview:** See the generated DHTMLX Form instantly.
-   **Editable JSON:** View, edit, and fine-tune the generated JSON configuration in a built-in code editor.
-   **Instant Updates:** Modify the JSON and click "Update Preview" to see your changes immediately without calling the AI again.

## AI Service

-   Configured to work with any OpenAI API-compatible service.

## Setup and Installation

Follow these steps to get the project running on your local machine.

```bash
# 1. Clone the repository
git clone https://github.com/DHTMLX/form-builder-ai-demo.git
cd form-builder-ai-demo

# 2. Install dependencies
npm install
```

### Set up Environment Variables

Create a new file named `.env` by copying from `env.sample`. This file holds your secret keys and configuration.

📄 `.env`
```ini
# --- OpenAI API Configuration ---
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_BASE_URL=https://api.openai.com/v1

# --- Security Configuration ---
CORS_ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3002,http://127.0.0.1:3001,http://localhost:5500,http://127.0.0.1:5500
```

-   **`OPENAI_API_KEY`**: (Required) Your secret API key for the AI service.
-   **`OPENAI_BASE_URL`**: The API endpoint for the AI service.
-   **`CORS_ALLOWED_ORIGINS`**: A crucial security setting. A comma-separated list of web addresses allowed to connect to your backend server.

### Run the Application

```bash
npm start
```

You should see output like `Server started on port 3002`. Now, open your browser and navigate to: **[http://localhost:3002](http://localhost:3002)**

## How It Works

1.  **Prompt:** The user enters a description of a form on the frontend.
2.  **Request:** The frontend sends this text to the Node.js server via a Socket.IO event.
3.  **AI Call:** The server injects the user's request into a carefully crafted system prompt (see `backend/formBuilderPrompt.js`) and makes a single call to the OpenAI API, forcing it to return a JSON object.
4.  **Response:** The generated JSON is sent back to the client.
5.  **Render:** The frontend receives the JSON, renders a live DHTMLX Form for preview, and displays the raw JSON in a Monaco editor for further refinement.

## Deployment

This application is ready to be deployed on any service that supports Node.js (e.g., Render, Heroku, Vercel).

**Key deployment steps:**
- **Do not** upload your `.env` file. Use the hosting provider's "Environment Variables" section to set `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `CORS_ALLOWED_ORIGINS`.
- The `Start Command` should be `npm start`.

## License

DHTMLX Form is a commercial library - use it under a [valid license](https://dhtmlx.com/docs/products/licenses.shtml) or [evaluation agreement](https://dhtmlx.com/docs/products/dhtmlxSuite/download.shtml).