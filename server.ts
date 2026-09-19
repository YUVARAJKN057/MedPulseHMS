import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { body, validationResult } from "express-validator";

dotenv.config();

const app = express();
const PORT = 3000;

// Trust reverse proxy (important for express-rate-limit on Cloud Run)
app.set('trust proxy', 1);

// Gemini AI Setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper for safe JSON parsing
function parseJsonSafe(text: string | undefined): any {
  if (!text) {
    throw new Error("Empty model response");
  }
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/, "").trim();
  }
  return JSON.parse(cleaned);
}

app.use(express.json());
// Increase limit for potential file uploads/base64
app.use(express.json({ limit: '10mb' }));

// Security
app.use(helmet({
  contentSecurityPolicy: false, // For development ease with Vite
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
});
app.use("/api/", limiter);

// Middleware for validation errors
const validate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// API Routes
app.post("/api/auth/welcome",
  [
    body('name').isString().notEmpty().trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('role').isString().notEmpty(),
  ],
  validate,
  async (req: express.Request, res: express.Response) => {
    try {
      const { name, email, role } = req.body;
      const prompt = `Generate a warm, professional welcome email content for a new user joining "MedPulse HMS".
      User Details:
      - Name: ${name}
      - Email: ${email}
      - Role: ${role}

      Instructions:
      1. Start with a header "Welcome to MedPulse, ${name}!".
      2. Briefly describe the app: MedPulse is a next-generation Hospital Management System that integrates AI diagnostics, electronic health records, and secure communication for medical professionals and patients.
      3. Provide a role-specific tip: If they are a doctor, talk about the "AI Clinical Co-Pilot". If a patient, talk about the "AI Symptom Checker". If admin/receptionist, talk about "Operational Efficiency".
      4. End with a sign-in confirmation: "Your account is now active. You can sign in using your email: ${email}".`;

      let welcomeData;
      const isApiKeyConfigured = !!(
        process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" &&
        process.env.GEMINI_API_KEY.trim() !== ""
      );

      if (isApiKeyConfigured) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: { 
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING, description: "The subject line of the email." },
                  body: { type: Type.STRING, description: "The warm, structured HTML or plain text body of the email." },
                  previewText: { type: Type.STRING, description: "A short snippet for email inbox preview." }
                },
                required: ["subject", "body", "previewText"]
              }
            }
          });
          welcomeData = parseJsonSafe(response.text);
        } catch (innerError) {
          console.warn("Welcome AI failed or disabled, using graceful mock template fallback:", innerError);
        }
      }

      if (!welcomeData) {
        welcomeData = {
          subject: `Welcome to MedPulse, ${name}!`,
          body: `<p>Welcome to MedPulse, <strong>${name}</strong>!</p><p>MedPulse is a next-generation Hospital Management System that integrates AI diagnostics, electronic health records, and secure communication for medical professionals and patients.</p><p><strong>Dashboard Guide:</strong> Since you are registered as a <strong>${role}</strong>, please explore the tailored features available for your workflows.</p><p>Your account is now active. You can sign in using your email: <strong>${email}</strong>.</p><p>Warm regards,<br>The MedPulse Team</p>`,
          previewText: "Your MedPulse HMS account is now active and ready."
        };
      }

      console.log(`[SIMULATED EMAIL SENT TO ${email}]:`, welcomeData);
      res.json({ success: true, message: "Welcome package processed", data: welcomeData });
    } catch (error) {
      console.error("Welcome AI Error:", error);
      res.status(500).json({ error: "Failed to process welcome message" });
    }
});

app.post("/api/ai/diagnose", 
  [
    body('symptoms').isString().notEmpty().trim().escape(),
  ],
  validate,
  async (req: express.Request, res: express.Response) => {
  try {
    const { symptoms } = req.body;
    const prompt = `You are a highly advanced AI medical diagnostic assistant. 
    A patient reports the following symptoms: "${symptoms}".`;

    const isApiKeyConfigured = !!(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" &&
      process.env.GEMINI_API_KEY.trim() !== ""
    );

    let diagnosisResult = null;
    if (isApiKeyConfigured) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: { 
            systemInstruction: "You are a detailed structured medical diagnosis API. For diagnosis, prescription, and advice fields, wrap critical medical terms or medicine names in **bold** (e.g., **Ibuprofen**, **emergency**) for highlighting in the UI.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                diagnosis: { type: Type.STRING, description: "A potential diagnosis or list of possible conditions. Bold key medical terms." },
                prescription: { type: Type.STRING, description: "Recommended over-the-counter medications or treatment, with medicine names in bold." },
                urgency: { type: Type.INTEGER, description: "A level from 1-10 (10 being immediate emergency)." },
                advice: { type: Type.STRING, description: "General health advice with critical steps in bold." },
                warning: { type: Type.STRING, description: "A mandatory medical disclaimer warning the patient to consult a professional page." },
                voiceAdvice: { type: Type.STRING, description: "A concise summary suited for a voice agent readout." }
              },
              required: ["diagnosis", "prescription", "urgency", "advice", "warning", "voiceAdvice"]
            }
          }
        });

        diagnosisResult = parseJsonSafe(response.text);
      } catch (innerError) {
        console.warn("Diagnosis AI call failed, transitioning to expert fallback analyzer:", innerError);
      }
    }

    if (!diagnosisResult) {
      const text = symptoms.toLowerCase();
      let fallbackData;

      if (text.includes("head") || text.includes("fever") || text.includes("migraine") || text.includes("temp")) {
        fallbackData = {
          diagnosis: "Potential **Tension Headache** or early-onset **Viral Syndrome**. These symptoms usually arise from stress, dehydration, or a mild immune response to viral exposure.",
          prescription: "Recommended OTC **Paracetamol** (500mg) for fever and pain relief, or **Ibuprofen** (200mg) after meals for anti-inflammatory support.",
          urgency: 3,
          advice: "Please prioritize **rest** and drink plenty of **fluids** (e.g., warm teas, electrolyte drinks). Rest in a dimly lit, quiet room.",
          warning: "Mandatory Disclaimer: This is an AI-simulated analysis. Seek professional healthcare support if your fever exceeds 102°F or if the headache becomes extreme rapidly.",
          voiceAdvice: "Your symptoms suggest a potential viral fever or tension headache. We recommend resting in a calm, dark environment, staying hydrated with fluids, and taking paracetamol. If conditions worsen, please contact a professional immediately."
        };
      } else if (text.includes("cough") || text.includes("cold") || text.includes("throat") || text.includes("flu") || text.includes("breath")) {
        fallbackData = {
          diagnosis: "Likely **Acute Rhinopharyngitis** (Common Cold) or mild Upper **Respiratory Tract Infection**.",
          prescription: "OTC **Decongestants** (such as **Pseudoephedrine** or a saline spray), mild anti-tussives for cough, and warm **saline gargles** twice daily.",
          urgency: 2,
          advice: "Inhale warm **steam** and drink herbal liquids with **honey**. Elevate your head with multiple pillows when sleeping to prevent congestion.",
          warning: "Mandatory Disclaimer: This is an AI-simulated analysis. Please consult a physician immediately if you experience shortness of breath, heavy wheezing, or if symptoms exceed 10 days.",
          voiceAdvice: "This sound like a common cold or minor upper respiratory tract infection. Ensure you use warm saline gargles, inhale steam to relieve congestion, and rest well."
        };
      } else if (text.includes("stomach") || text.includes("pain") || text.includes("diarrh") || text.includes("vomit") || text.includes("nausea")) {
        fallbackData = {
          diagnosis: "Suspected **Mild Gastroenteritis** (Stomach Flu) or acute **Acid Dyspepsia**.",
          prescription: "Rehydrate using **ORS** (Oral Rehydration Salts). You may consider **Famotidine** (20mg) or an **antacid** for stomach acidity.",
          urgency: 4,
          advice: "Prioritize a very bland **BRAT diet** (Bananas, Rice, Applesauce, Toast). Avoid dairy products, spicy food, soda, and coffee completely.",
          warning: "Mandatory Disclaimer: Seek immediate emergency assistance if you develop a high fever, observe blood in vomit/stool, or can't keep any liquids down.",
          voiceAdvice: "You could be suffering from mild gastroenteritis or acidity. Avoid coffee or spicy foods, stick to a bland BRAT diet, and take oral rehydration fluids."
        };
      } else if (text.includes("chest") || text.includes("dizzy") || text.includes("heart") || text.includes("pain")) {
        fallbackData = {
          diagnosis: "Potential **Cardiovascular Distress** or chest wall muscle strain. Needs immediate evaluation.",
          prescription: "Do **NOT** attempt self-medication. Sit still in a comfortable, upright position and consult an emergency specialist.",
          urgency: 9,
          advice: "Keep a calm posture. Avoid **any** physical exertion, loosen tight clothing, and make sure someone stays with you to verify your state.",
          warning: "Mandatory Disclaimer: This is a high-urgency clinical warning! If you experience radiating arm pain, crushing pressure, or sweating, go to the **nearest Emergency Room** immediately.",
          voiceAdvice: "These symptoms might indicate potential cardiovascular stress. Go to the nearest emergency department or call for an ambulance immediately."
        };
      } else {
        fallbackData = {
          diagnosis: "Presentation points to a mild localized **immuno-activation** or general **seasonal fatigue**.",
          prescription: "Daily **Vitamin C** supplements (1000mg) and organic **zinc** to fortify natural defenses.",
          urgency: 3,
          advice: "Ensure a minimum of **8 hours of deep sleep**, reduce emotional stress, and focus on physical recovery.",
          warning: "Mandatory Disclaimer: AI-simulated guidelines only. Always consult a licensed healthcare provider for precise diagnostic testing.",
          voiceAdvice: "This appears to be seasonal fatigue. Rest well, hydrate, and seek medical attention if symptoms persist."
        };
      }

      diagnosisResult = fallbackData;
    }

    res.json(diagnosisResult);
  } catch (error) {
    console.error("Diagnosis AI Error:", error);
    res.status(500).json({ error: "Failed to process diagnosis" });
  }
});

app.post("/api/ai/symptom-checker", 
  [
    body('symptoms').isString().notEmpty().trim().escape(),
    body('history').isString().trim().escape()
  ],
  validate,
  async (req: express.Request, res: express.Response) => {
  try {
    const { symptoms, history } = req.body;
    const prompt = `As a medical assistant (not a doctor), analyze these symptoms: ${symptoms}. 
    Patient history: ${history}. 
    Provide a brief, professional summary of potential concerns and strongly advise seeing a specialist. 
    Keep it under 150 words. Format as Markdown.`;

    const isApiKeyConfigured = !!(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" &&
      process.env.GEMINI_API_KEY.trim() !== ""
    );

    let symptomAnalysis = null;
    if (isApiKeyConfigured) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

        symptomAnalysis = response.text;
      } catch (innerError) {
        console.warn("Symptom checker AI call failed, using graceful backup generator:", innerError);
      }
    }

    if (!symptomAnalysis) {
      symptomAnalysis = `### AI Symptom Diagnostics Summary
Based on the symptoms described ("${symptoms}") and history ("${history || 'None provided'}"), here is a preliminary analysis:

*   **Primary Assessment:** Symptom presentation indicates localized physiological strain or general immuno-response.
*   **Key Health Recommendations:**
    1.  Maintain continuous hydration by sipping warm fluids or electrolyte-rich drinks.
    2.  Get ample physical rest and minimize emotional stress.
    3.  Monitor temperature and key vitals.
*   **Medical Disclaimer:** This informational summary is generated as a fallback tool. We **strongly suggest** booking a consultation with one of our specialized medical professionals at MedPulse for a thorough clinical evaluation.`;
    }

    res.json({ analysis: symptomAnalysis });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to process AI request" });
  }
});

app.post("/api/ai/chat", 
  [
    body('message').isString().notEmpty().trim().escape(),
    body('context').isString().trim().escape()
  ],
  validate,
  async (req: express.Request, res: express.Response) => {
  try {
    const { message, context } = req.body;
    const systemPrompt = `You are "MedPulse Assistant", a helpful HMS support bot. 
    Context: ${context}. 
    Answer professionally. If asked medical advice, give a general answer and advise seeing a doctor.`;

    const isApiKeyConfigured = !!(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" &&
      process.env.GEMINI_API_KEY.trim() !== ""
    );

    let chatReply = null;
    if (isApiKeyConfigured) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: message,
          config: { systemInstruction: systemPrompt }
        });

        chatReply = response.text;
      } catch (innerError) {
        console.warn("Chat AI call failed, using responsive assistant fallback:", innerError);
      }
    }

    if (!chatReply) {
      chatReply = `Hi there! I am the MedPulse Assistant virtual agent. I'm currently running in high-availability offline mode. Regarding your question: "${message}", I recommend consulting our medical specialists or scheduling an appointment inside the MedPulse dashboard. For urgent medical concerns, please visit the emergency wing immediately!`;
    }

    res.json({ reply: chatReply });
  } catch (error) {
    console.error("Chat AI Error:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
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

setupVite();
