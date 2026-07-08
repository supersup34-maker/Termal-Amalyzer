import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize GoogleGenAI client (safe server-side initialization)
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      console.warn("⚠️ Warning: GEMINI_API_KEY is not defined in environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit to handle base64 image uploads
  app.use(express.json({ limit: "15mb" }));

  // REST API Route: Analyze thermal hotspot image
  app.post("/api/analyze-hotspot", async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 parameter" });
      }

      const ai = getAiClient();
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is missing. Please configure it in Settings > Secrets.",
        });
      }

      // Extract the raw base64 data (strip prefix if present)
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const systemPrompt = `You are an expert electrical engineer, certified thermographer (ISO 18436-7 Level III), and safety investigator.
Your job is to analyze thermal infrared (IR) hotspot images of electrical equipment (such as transformers, cables, busbars, circuit breakers, disconnect switches, and insulator strings).
Identify abnormal thermal anomalies, estimate temperatures, evaluate critical risk based on temperature difference (Delta T) standards, identify probable causes, and recommend corrective maintenance actions.

You must respond with a strictly formatted JSON object matching the provided schema.
Ensure your descriptions, explanations, probable causes, and corrective actions are in Thai (ภาษาไทย) as requested by the user, using accurate technical terminology (e.g. Bushing, Contact Resistance, Oxidization, Torque).`;

      const userPrompt = `Analyze this electrical thermal IR image.
Determine:
1. Equipment type (e.g. Transformer bushing, Breaker contact, Cable joint, Switch terminal, Fuse connection, etc.)
2. Severity level ("LOW", "MEDIUM", "HIGH", or "CRITICAL") based on standard electrical thermography guidelines:
   - Low: Delta T < 10°C (Minor anomaly, monitor closely)
   - Medium: Delta T 10°C - 20°C (Moderate anomaly, plan maintenance)
   - High: Delta T 21°C - 40°C (Severe anomaly, repair at earliest opportunity)
   - Critical: Delta T > 40°C (Immediate hazard, potential failure, remove from service or repair immediately)
3. Estimated maximum hotspot temperature (°C) and ambient temperature (°C).
4. Exact coordinate of the primary hotspot (the center point of the heat concentration) as percentages of image width and height (x: 0-100, y: 0-100).
5. Detailed description of the anomaly in Thai.
6. List of probable causes of this hotspot in Thai.
7. List of recommended corrective maintenance actions in Thai.
8. Estimated urgency timeframe and compliance standard in Thai.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: mimeType || "image/jpeg",
              data: base64Data,
            },
          },
          { text: userPrompt },
        ],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: [
              "equipmentType",
              "severity",
              "maxTemp",
              "ambientTemp",
              "tempDiff",
              "anomalyDescription",
              "hotspotCoordinates",
              "causes",
              "actions",
              "urgencyWindow",
              "standardsCompliance"
            ],
            properties: {
              equipmentType: {
                type: Type.STRING,
                description: "Type of electrical equipment identified in the thermal image (in Thai, e.g. หม้อแปลงไฟฟ้า, บัสบาร์, เซอร์กิตเบรกเกอร์, ขั้วต่อสายไฟ)",
              },
              severity: {
                type: Type.STRING,
                description: "Severity level of the hotspot: LOW, MEDIUM, HIGH, or CRITICAL",
              },
              maxTemp: {
                type: Type.NUMBER,
                description: "Estimated maximum hotspot temperature in Celsius",
              },
              ambientTemp: {
                type: Type.NUMBER,
                description: "Estimated ambient or reference temperature in Celsius",
              },
              tempDiff: {
                type: Type.NUMBER,
                description: "Temperature difference (Delta T) in Celsius between the hotspot and reference/ambient",
              },
              anomalyDescription: {
                type: Type.STRING,
                description: "Detailed description of the abnormal heat concentration, where it is located, and how it is behaving (in Thai)",
              },
              hotspotCoordinates: {
                type: Type.OBJECT,
                description: "Approximate relative coordinate center of the primary hotspot in percentage of the image dimensions",
                required: ["x", "y"],
                properties: {
                  x: {
                    type: Type.NUMBER,
                    description: "X-axis coordinate of the hotspot center, from 0 (left) to 100 (right)",
                  },
                  y: {
                    type: Type.NUMBER,
                    description: "Y-axis coordinate of the hotspot center, from 0 (top) to 100 (bottom)",
                  },
                },
              },
              causes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of probable causes for the thermal hotspot (in Thai, e.g. ขั้วต่อหลวม, เกิดสนิม/คราบออกไซด์, โอเวอร์โหลด)",
              },
              actions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of step-by-step recommended corrective actions (in Thai, e.g. ขันอัดสายด้วยประแจปอนด์, ทำความสะอาดด้วย Contact Cleaner, ปรับสมดุลโหลด)",
              },
              urgencyWindow: {
                type: Type.STRING,
                description: "Timeframe of repair urgency (in Thai, e.g. แก้ไขด่วนที่สุดภายใน 24 ชั่วโมง, วางแผนแก้ไขในรอบบำรุงรักษาประจำเดือน)",
              },
              standardsCompliance: {
                type: Type.STRING,
                description: "Standard or guideline referenced for this assessment (in Thai, e.g. มาตรฐานสมาคมทดสอบวัสดุแห่งอเมริกา ASTM หรือเกณฑ์ NETA MTS / IEEE)",
              },
            },
          },
        },
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Empty response from Gemini API");
      }

      const analysisData = JSON.parse(resultText.trim());
      return res.json(analysisData);
    } catch (error: any) {
      console.error("Analysis API error:", error);
      return res.status(500).json({
        error: "เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพด้วย AI",
        details: error.message || error,
      });
    }
  });

  // Setup Vite Dev Server / Static Assets Serving
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    // Vite dev mode integration
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted for development");
  } else {
    // Production mode: Serve built static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static files from dist/ in production");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`⚡ Server running on http://localhost:${PORT} in ${isProd ? "production" : "development"} mode`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
