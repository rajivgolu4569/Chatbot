const express = require("express");
const mongoose = require("mongoose");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cors = require("cors");
require("dotenv").config();

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.json());
app.use(cors());

// Validate MongoDB URI
if (!MONGO_URI) {
    console.error("❌ MongoDB URI is missing! Check your .env file.");
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });

// Define Query Schema
const querySchema = new mongoose.Schema({
    query: { type: String, required: true, unique: true },
    response: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Query = mongoose.model("Query", querySchema);

// CDP Documentation Links
const CDP_DOCS = {
    Segment: "https://segment.com/docs/",
    mParticle: "https://docs.mparticle.com/",
    Lytics: "https://docs.lytics.com/",
    Zeotap: "https://docs.zeotap.com/home/en-us/"
};

// Function to scroll down and load all content
const autoScroll = async (page) => {
    await page.evaluate(async () => {
        await new Promise(resolve => {
            let totalHeight = 0;
            let distance = 300;
            let timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= document.body.scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 400);
        });
    });
};

// Function to fetch documentation using Puppeteer
const fetchDocumentation = async (url, query) => {
    let browser;
    try {
        console.log(`🔍 Searching in: ${url} for query: "${query}"`);

        browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");

        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
        await autoScroll(page);

        const pageContent = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("h1, h2, h3, p, li"))
                .map(el => el.innerText.trim())
                .filter(text => text.length > 10)
                .join("\n");
        });

        await browser.close();
        
        if (!pageContent) {
            return "❌ No relevant information found.";
        }

        console.log(`📄 Extracted Content from ${url}:
`, pageContent.substring(0, 500));
        
        const lowerQuery = query.toLowerCase();
        const relevantInfo = pageContent
            .split("\n")
            .filter(line => line.toLowerCase().includes(lowerQuery))
            .slice(0, 5)
            .join("\n");

        return relevantInfo.length ? `✅ Found relevant information:\n${relevantInfo}` : "❌ No relevant information found.";
    } catch (error) {
        console.error(`❌ Puppeteer Error on ${url}:`, error.message);
        return "❌ Error fetching documentation. Please try again later.";
    } finally {
        if (browser) await browser.close();
    }
};

// API Route to handle user questions
app.post("/ask", async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || query.trim() === "") {
            return res.status(400).json({ answer: "⚠ Please provide a valid question." });
        }

        // Check MongoDB cache first
        const cachedQuery = await Query.findOne({ query: query.toLowerCase() });
        if (cachedQuery) {
            console.log("⚡ Returning cached response.");
            return res.json({ answer: cachedQuery.response });
        }

        let bestMatch = null;
        for (const [cdp, url] of Object.entries(CDP_DOCS)) {
            const response = await fetchDocumentation(url, query);
            if (response !== "❌ No relevant information found.") {
                bestMatch = { cdp, response };
                break;
            }
        }

        const answer = bestMatch
            ? `📖 From ${bestMatch.cdp} documentation:\n${bestMatch.response}`
            : "❌ No relevant information found in the documentation.";

        await Query.updateOne(
            { query: query.toLowerCase() },
            { response: answer },
            { upsert: true }
        );

        res.json({ answer });
    } catch (error) {
        console.error("❌ API Error:", error.message);
        res.status(500).json({ answer: "❌ Internal Server Error. Please try again later." });
    }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
