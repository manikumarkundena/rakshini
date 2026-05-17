import express from "express";
import net from "net";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function findAvailablePort(startPort: number) {
  for (let port = startPort; port < startPort + 20; port += 1) {
    const isAvailable = await new Promise<boolean>((resolve) => {
      const server = net.createServer();

      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close(() => resolve(true));
      });

      server.listen(port, '0.0.0.0');
    });

    if (isAvailable) {
      return port;
    }
  }

  return startPort;
}

async function startServer() {
  const app = express();
  const PORT = await findAvailablePort(Number(process.env.PORT || 3000));
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();

  app.use(express.json());

  const ai = geminiApiKey
    ? new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      })
    : null;

  app.post("/api/gemini/chat", async (req, res) => {
    try {
      if (!ai) {
        return res.status(503).json({
          error: "MISSING_GEMINI_API_KEY",
          message: "Set GEMINI_API_KEY in .env.local or your environment before using the Gemini chat endpoint.",
        });
      }

      const { prompt, history, latLng } = req.body;
      
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          ...(history || []).map((h: any) => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: h.parts
          })),
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: `You are Rakshini AI, the core intelligence of the Rakshini Women's Safety Ecosystem. 
          Your personality is calm, highly intelligent, emotionally supportive, and hyper-focused on safety. 
          You provide safety guidance, emotional reassurance, route safety suggestions, and emergency protocols. 
          
          Guidelines:
          1. Always prioritize the user's immediate safety.
          2. Use the user's name if provided in the context.
          3. If the user feels unsafe, provide step-by-step calming instructions and safety actions.
          4. If they ask for 'safest route', mention that you are analyzing spatial risk factors and neural threat maps.
          5. Keep responses concise but ultra-premium in tone.
          6. If they are in danger, remind them of the SOS button.`,
        }
      });

      res.json({ text: response.text, grounding: response.candidates?.[0]?.groundingMetadata });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      
      const errorMsg = error.message || String(error);
      const isQuotaError = error.status === 429 || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');

      if (isQuotaError) {
        return res.status(429).json({ 
          error: "QUOTA_EXHAUSTED",
          text: "I'm operating in Low-Power Safety Mode due to high neural network traffic. I am still here to guide you. If you feel unsafe: 1. Move to a well-lit area. 2. Keep your phone in hand. 3. Prepare to trigger the SOS button. How can I assist you right now?" 
        });
      }

      res.status(500).json({ error: "FAILED_TO_GENERATE", message: "Failed to get AI response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    process.env.DISABLE_HMR = 'true';
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
