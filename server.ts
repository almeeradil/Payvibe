import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

async function callGeminiWithRetry(model: string, contents: any, config: any, maxRetries = 2) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      if (!ai) throw new Error("Gemini client not initialized");
      return await ai.models.generateContent({ model, contents, config });
    } catch (error: any) {
      if (error?.status === 503 && attempt < maxRetries) {
        attempt++;
        console.log(`[AI Retry System] Handled Gemini 503 service spike, retrying attempt ${attempt}...`);
        await new Promise(res => setTimeout(res, 2000 * attempt)); // wait 2s, then 4s
      } else {
        throw error;
      }
    }
  }
}

// AI OCR Endpoint
app.post("/api/gemini/ocr", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured on the server." });
    }
    
    const { imageBase64, mimeType } = req.body;
    
    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: "Image data and mime type are required." });
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: imageBase64,
      },
    };

    const textPart = {
      text: `Analyze this invoice or receipt image. Extract the following details: 
      1. Supplier or Customer Name
      2. Invoice Date (if any)
      3. Items (List of items with name, quantity, and rate/price)
      4. Total Amount
      Make sure to return only valid JSON according to the schema provided.`,
    };

    const config = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          partyName: { type: Type.STRING, description: "Name of the supplier or customer" },
          date: { type: Type.STRING, description: "Date on the invoice in YYYY-MM-DD format, or leave empty if not found" },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Item description or name" },
                qty: { type: Type.NUMBER, description: "Quantity" },
                rate: { type: Type.NUMBER, description: "Unit price or rate" }
              }
            }
          },
          total: { type: Type.NUMBER, description: "Total amount on the invoice" }
        },
        required: ["partyName", "items", "total"]
      }
    };

    const response = await callGeminiWithRetry("gemini-3.7-flash", { parts: [imagePart, textPart] }, config);

    res.json({ result: JSON.parse(response!.text || "{}") });
  } catch (error: any) {
    console.error("Error in OCR:", error);
    res.status(500).json({ error: error.message || "Failed to process image" });
  }
});

// AI Voice Command Endpoint
app.post("/api/gemini/voice-invoice", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured on the server." });
    }
    
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Voice prompt is required." });
    }

    const contents = `Extract invoice details from this voice command: "${prompt}". 
      Find the customer name, amount, and if mentioned, the product/item name and quantity. If quantity is not mentioned, assume 1. If product is not mentioned, use "General Item".`;

    const config = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          customerName: { type: Type.STRING, description: "Customer name extracted from the prompt" },
          productName: { type: Type.STRING, description: "Product name extracted from the prompt" },
          qty: { type: Type.NUMBER, description: "Quantity" },
          rate: { type: Type.NUMBER, description: "Rate or total amount if quantity is 1" }
        },
        required: ["customerName", "productName", "qty", "rate"]
      }
    };

    const response = await callGeminiWithRetry("gemini-3.7-flash", contents, config);

    res.json({ result: JSON.parse(response!.text || "{}") });
  } catch (error: any) {
    console.error("Error in voice command:", error);
    res.status(500).json({ error: error.message || "Failed to process voice command" });
  }
});

// AI Predictive Analytics Endpoint
app.post("/api/gemini/predict-late-payments", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured on the server." });
    }
    
    const { clients, invoices } = req.body;
    
    const textPart = {
      text: `Analyze this list of clients and their past invoice payment history.
      Clients: ${JSON.stringify(clients)}
      Invoices: ${JSON.stringify(invoices)}
      
      Identify which clients consistently pay late (e.g. have multiple overdue invoices or pay after the due date). 
      For those late payers, generate a short, polite smart payment reminder message.`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: { parts: [textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              clientId: { type: Type.STRING, description: "ID of the client who is likely to pay late" },
              clientName: { type: Type.STRING, description: "Name of the client" },
              riskLevel: { type: Type.STRING, description: "High, Medium, or Low risk of late payment" },
              reminderMessage: { type: Type.STRING, description: "A personalized, polite reminder message for this client" }
            },
            required: ["clientId", "clientName", "riskLevel", "reminderMessage"]
          }
        }
      },
    });

    res.json({ result: JSON.parse(response.text || "[]") });
  } catch (error: any) {
    console.error("Error in predictive analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
