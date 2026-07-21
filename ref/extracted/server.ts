import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI client lazily to avoid crashing on startup if the key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined. The app will use offline fallback generator.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 2.5D Rig & Animation generator API using Gemini
app.post("/api/generate-rig", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  console.log(`Received rig generation request for prompt: "${prompt}"`);

  // Intercept reset / clear / delete / kosongkan requests
  const cleanPrompt = prompt.toLowerCase().trim();
  const isResetRequest = 
    cleanPrompt.includes("hapus") || 
    cleanPrompt.includes("clear") || 
    cleanPrompt.includes("reset") || 
    cleanPrompt.includes("bersih") || 
    cleanPrompt.includes("kosong") || 
    cleanPrompt.includes("delete") ||
    cleanPrompt.includes("buang");

  if (isResetRequest) {
    console.log("Detected canvas clear/reset request via AI prompt.");
    return res.json({
      name: "Canvas Bersih",
      bones: [],
      animations: [
        {
          id: "idle",
          name: "Idle Loop",
          duration: 40,
          keyframes: [
            { frame: 0, boneTransforms: {} },
            { frame: 40, boneTransforms: {} }
          ]
        }
      ],
      isClearAction: true,
      message: "Siap Mbah! Saya sudah mengosongkan dan membersihkan seluruh susunan tulang di canvas sesuai perintah Mbah. Silakan klik tombol hijau di bawah untuk menerapkan perubahan ini!"
    });
  }

  const ai = getAiClient();
  if (!ai) {
    // Graceful offline fallback if GEMINI_API_KEY is not configured
    console.log("Using high-quality offline procedural generator (No API key found).");
    return res.json(generateProceduralFallback(prompt));
  }

  try {
    const systemPrompt = `You are an expert 2D animator and spritesheet coordinator.
Your task is to generate a comprehensive JSON spritesheet configuration based on the user's description. The spritesheet is assumed to have 4 horizontal cells (each 100x100px) from x:0 to x:300, with y:0.
Always output a valid, clean, parseable JSON object matching this schema:
{
  "name": "Descriptive character name",
  "slices": [
    { "id": "slice_0", "name": "Frame 1 Name", "x": 0, "y": 0, "width": 100, "height": 100 },
    { "id": "slice_1", "name": "Frame 2 Name", "x": 100, "y": 0, "width": 100, "height": 100 },
    { "id": "slice_2", "name": "Frame 3 Name", "x": 200, "y": 0, "width": 100, "height": 100 },
    { "id": "slice_3", "name": "Frame 4 Name", "x": 300, "y": 0, "width": 100, "height": 100 }
  ],
  "animations": [
    {
      "id": "idle",
      "name": "Idle Animation",
      "frames": ["slice_0", "slice_0", "slice_1", "slice_0"],
      "fps": 4,
      "loop": true
    },
    {
      "id": "action",
      "name": "Aksi Jurus (Special Move)",
      "frames": ["slice_1", "slice_2", "slice_3", "slice_0"],
      "fps": 6,
      "loop": true
    }
  ]
}

CRITICAL RULES:
1. Slices must be mapped to 100x100 cells at coordinates x=0, 100, 200, 300.
2. Provide interesting animations that arrange these frames in creative order.
3. The entire output must be valid JSON only. Do not wrap in markdown blocks, do not add trailing commas or comments. Just return the raw JSON string.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a spritesheet configuration and animations based on this request: "${prompt}". Create two animations: "idle" and "action".`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanText);

    res.json(result);
  } catch (error: any) {
    console.error("Gemini Generation failed, falling back to procedural:", error);
    res.json(generateProceduralFallback(prompt));
  }
});

// High-quality procedural generator fallback
function generateProceduralFallback(prompt: string) {
  const slices = [
    { id: 'slice_0', name: 'Pose Diam', x: 0, y: 0, width: 100, height: 100 },
    { id: 'slice_1', name: 'Pose Kuda-Kuda', x: 100, y: 0, width: 100, height: 100 },
    { id: 'slice_2', name: 'Pose Tebasan', x: 200, y: 0, width: 100, height: 100 },
    { id: 'slice_3', name: 'Pose Pemulihan', x: 300, y: 0, width: 100, height: 100 },
  ];

  const animations = [
    {
      id: 'idle',
      name: 'Santai Saja (Idle)',
      frames: ['slice_0', 'slice_0', 'slice_1', 'slice_0'],
      fps: 4,
      loop: true
    },
    {
      id: 'action',
      name: 'Gerakan Cepat (Action)',
      frames: ['slice_1', 'slice_2', 'slice_3', 'slice_0'],
      fps: 6,
      loop: true
    }
  ];

  return {
    name: prompt ? `Karakter ${prompt}` : "Petualang Misterius",
    slices,
    animations
  };
}

// Vite and Express serving integration
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
