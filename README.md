# CDP Documentation Scraper

## 📌 Overview
This project is a **web scraper** that extracts relevant information from various **Customer Data Platform (CDP) documentation** using **Puppeteer**. It enables users to search for specific queries and retrieves answers from the documentation of Segment, mParticle, Lytics, and Zeotap.

## 🚀 Features
- **Scrapes CDP documentation** using Puppeteer with a stealth plugin.
- **Caches responses** in MongoDB to avoid redundant scrapes.
- **Fuzzy search** to find relevant content from documentation.
- **REST API** built with **Express.js**.
- **Error handling & logging** for better debugging.
- **CORS enabled** to allow cross-origin requests.

## 🛠️ Tech Stack
- **Node.js** (Backend API)
- **Express.js** (Server framework)
- **Puppeteer Extra** (Web scraping)
- **MongoDB & Mongoose** (Database & ORM)
- **dotenv** (Environment variable management)
- **CORS** (Cross-origin requests handling)

## 📂 Project Structure
```
📦 cdp-docs-scraper
├── 📂 node_modules
├── 📂 models
│   ├── Query.js          # Mongoose schema for caching queries
├── 📂 routes
│   ├── scraper.js        # API endpoint for querying documentation
├── 📂 utils
│   ├── scraperUtil.js    # Puppeteer scraping functions
├── .env                  # Environment variables (MongoDB URI, etc.)
├── .gitignore            # Ignored files
├── package.json          # Dependencies and scripts
├── server.js             # Main server file
├── README.md             # Project documentation
```

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-username/cdp-docs-scraper.git
cd cdp-docs-scraper
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Set Up Environment Variables
Create a `.env` file in the root directory and add:
```
PORT=5001
MONGO_URI=your_mongodb_connection_string
```

### 4️⃣ Start the Server
```sh
npm start
```
Server will run at: `http://localhost:5001`

## 📌 API Endpoints

### 🔍 Query Documentation
**POST** `/ask`
#### Request Body:
```json
{
  "query": "How does Segment's audience creation process compare to Lytics?"
}
```
#### Response:
```json
{
  "answer": "📖 From Segment documentation: ..."
}
```

## 🚀 Future Enhancements
- Add support for more CDP platforms.
- Improve query matching with NLP techniques.
- Implement a frontend UI for user-friendly queries.

## 🛠️ Troubleshooting
- If MongoDB fails to connect, verify **MONGO_URI** in `.env`.
- If Puppeteer crashes, add `--no-sandbox` to launch options.

## 📜 License
This project is licensed under **MIT License**.

