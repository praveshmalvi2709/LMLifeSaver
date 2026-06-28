import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client to prevent crash if key is missing
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not set or configured. Please add it to your environment secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}

// Helper to interact with Gemini safely
async function callGemini(prompt: string, jsonMode = false): Promise<string> {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: jsonMode ? { responseMimeType: "application/json" } : undefined,
    });
    return response.text || "";
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    throw new Error(err.message || "Failed to contact Gemini AI. Check your API key setup.");
  }
}

// 1. Health & Configuration status endpoints
app.get("/api/health", (req, res) => {
  const keyExists = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  res.json({
    status: "ok",
    aiEnabled: keyExists,
    message: keyExists ? "LM Life Saver AI backend ready." : "AI running in offline/simulation mode. Set GEMINI_API_KEY in Secrets to activate."
  });
});

// 2. AI Task Breakdown endpoint
app.post("/api/breakdown", async (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Task title is required." });
  }

  const prompt = `
    You are the AI Task Breakdown Planner for 'The Last-Minute Life Saver' app.
    Given a high-priority task, break it down into 3-5 logical, bite-sized, sequential milestones.
    Each milestone needs:
    - A clear, action-oriented title/text (humble, human labels, no tech-slop).
    - An estimated duration in minutes (total should sum to around 45 to 120 mins).
    - A focusType, which must be exactly one of: 'High Focus', 'Design Work', 'Admin', 'Routine', 'Creative'.

    Task Title: "${title}"
    Task Description: "${description || 'None'}"

    Return ONLY a JSON array matching this structure:
    [
      {
        "text": "Milestone description",
        "durationMin": 30,
        "focusType": "High Focus"
      },
      ...
    ]
    Do not add markdown formatting or extra descriptions outside of the JSON block.
  `;

  try {
    const responseText = await callGemini(prompt, true);
    let milestones = JSON.parse(responseText);
    // Add unique IDs to the milestones
    milestones = milestones.map((m: any, idx: number) => ({
      id: `milestone-${Date.now()}-${idx}`,
      text: m.text || "Milestone Item",
      durationMin: m.durationMin || 15,
      focusType: m.focusType || "Routine",
      completed: false
    }));
    res.json({ milestones });
  } catch (err: any) {
    console.warn("Falling back to local fallback breakdown due to:", err.message);
    // Return high-quality offline fallbacks
    const fallbackMilestones = [
      { id: `m-1-${Date.now()}`, text: "Analyze primary requirements", durationMin: 15, focusType: "High Focus" as const, completed: false },
      { id: `m-2-${Date.now()}`, text: "Draft initial outline and scope", durationMin: 30, focusType: "Creative" as const, completed: false },
      { id: `m-3-${Date.now()}`, text: "Refine specifications and edit draft", durationMin: 20, focusType: "Design Work" as const, completed: false },
      { id: `m-4-${Date.now()}`, text: "Final verification and submit", durationMin: 10, focusType: "Admin" as const, completed: false }
    ];
    res.json({ milestones: fallbackMilestones, note: "Offline mode enabled. Generated local default breakdown plan." });
  }
});

// 3. AI Schedule Optimization and Risk Rescue recommendations
app.post("/api/optimize", async (req, res) => {
  const { tasks } = req.body;
  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: "Tasks array is required." });
  }

  const prompt = `
    You are the 'Smart Rescue & Scheduling Agent' for LM Life Saver.
    Analyze the current user's workload below and suggest 2-3 highly specific, actionable optimization proposals.
    Proposals can be of types:
    - 'RESCHEDULE': Move a low-priority task to a later time/date to open up immediate focused time.
    - 'BATCH': Bundle quick administration/email tasks together into a shorter block.
    - 'POSTPONE': Delay a routine, non-critical routine task if there is high risk of overcommitment.

    Current Tasks:
    ${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, status: t.status, dueDate: t.dueDate })))}

    Return ONLY a JSON array representing optimization proposals:
    [
      {
        "type": "RESCHEDULE",
        "targetTaskId": "id-of-task",
        "targetTaskTitle": "Title of task to move",
        "title": "Short title (e.g., Reschedule Inbox Triage)",
        "description": "Short explanation of why and where to move it to match energy/buffers."
      }
    ]
    Do not add formatting other than this JSON structure. If no optimization is needed, return empty array.
  `;

  try {
    const responseText = await callGemini(prompt, true);
    const suggestions = JSON.parse(responseText).map((s: any, idx: number) => ({
      ...s,
      id: `proposal-${Date.now()}-${idx}`,
      applied: false
    }));
    res.json({ suggestions });
  } catch (err: any) {
    console.warn("Using local optimization suggestions fallback:", err.message);
    const fallbackSuggestions = [
      {
        id: `prop-1-${Date.now()}`,
        type: "RESCHEDULE",
        targetTaskId: tasks[1]?.id || "task-2",
        targetTaskTitle: tasks[1]?.title || "Inbox Triage",
        title: "Reschedule Administrative Work",
        description: "Move routine inbox review to 2:00 PM to free up premium morning hours for deep focus work.",
        applied: false
      },
      {
        id: `prop-2-${Date.now()}`,
        type: "BATCH",
        targetTaskId: tasks[2]?.id || "task-3",
        targetTaskTitle: tasks[2]?.title || "Sync Design Assets",
        title: "Bundle Routine Communications",
        description: "Batch Slack notifications and syncs together inside the final 30 minutes of your workday.",
        applied: false
      }
    ];
    res.json({ suggestions: fallbackSuggestions });
  }
});

// 4. Conversational Chat & Daily briefing endpoint
app.post("/api/chat", async (req, res) => {
  const { message, history, currentTasks, currentRoutines, autonomyLevel } = req.body;

  const currentHour = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const tasksCtx = currentTasks ? JSON.stringify(currentTasks.map((t: any) => ({
    title: t.title,
    priority: t.priority,
    status: t.status,
    due: t.dueDate,
    risk: t.riskLevel
  }))) : "None";

  const routinesCtx = currentRoutines ? JSON.stringify(currentRoutines.map((r: any) => ({
    title: r.title,
    duration: r.duration,
    done: r.done
  }))) : "None";

  const prompt = `
    You are 'Life Saver', an intelligent productivity co-pilot, circadian rhythm guide, and deadline rescue partner.
    You assist the user in avoiding crisis situations, breaking down overcommitments, and organizing schedule conflicts gracefully.

    Overview of the Entire Last-Minute Life Saver Platform Features:
    1. Circadian-aligned Cognitive Wave: A dynamic SVG wave mapping natural daily energy peaks (e.g., morning deep work windows) and valleys (e.g., lunch energy dips). It analyzes task/routine loads to suggest scheduling heavy cognitive work during peaks and low-intensity routine tasks during valleys.
    2. Sound & Brainwave Synthesizer (Abstract Soundscapes tab): Implements real-time Web Audio API sound generators (Alpha/Beta/Theta/Delta binaural beats, White noise, Deep Space Ambient) to entrain the user's focus state to match active workloads.
    3. AI Plan Optimizer / "Optimize Actionable Plans" button: Breaks down massive, vague tasks into clear, micro-achievable checklists, shift priority hours, and schedules routines to avoid creative exhaustion.
    4. Synergy Arena (Synergy League tab): A high-vibe gamified leaderboard. Users gain XP points by checking off tasks, managing stress, or sticking to habits. It unlocks dynamic badges like "Focus Monk", "Circadian Master", and "Zen Warrior".
    5. Goals & Habits Trackers (Goals & Habits tab): Monitors habits with daily micro-commitments, visual checklist grids, and automated streak-protection buffers.
    6. Settings Configuration (Settings tab): Allows shifting between full "Auto-Pilot", "Co-Pilot", and "Advisor" autonomy modes, which alters how aggressively the AI restructures conflicts.

    User Settings context:
    - Autonomy Level: ${autonomyLevel || 'Co-Pilot'}
    - Current Time: ${currentHour}

    User Tasks Context:
    ${tasksCtx}

    User Routines Context:
    ${routinesCtx}

    Chat History:
    ${JSON.stringify(history || [])}

    User's incoming message: "${message}"

    Guidelines for Adding/Scheduling Tasks or Routine Tasks:
    - If the user wants to add/schedule a Task (e.g. "add task...", "schedule...", "create a task...", "add project sync..."), you can add it. If they didn't specify priority (URGENT, HIGH, MEDIUM, LOW) or description, you can make a smart assumption, or if they are extremely vague, ask them for details.
    - If the user wants to add a Routine Task / Daily Chore (e.g. "add routine...", "add routine task...", "schedule chore..."), you can add a routine task. A routine task has a "title" and a "duration" (e.g., "15 min", "30 min", "1 hr").
    - If the user wants to optimize or reschedule, set "shouldOptimize": true.
    - If the user asks about how the platform works, how the wave works, or any features (soundscapes, leaderboard, habits, settings, tasks, optimization), provide an enthusiastic, clear, and easy-to-understand explanation. Since the user might be using audio/text, keep responses highly structured, punchy, conversational, and direct.

    You MUST respond with a JSON object containing:
    {
      "reply": "Empathetic, clear, and direct conversational response to the user. Do not show raw JSON or telemetry inside this string. Ensure it answers the user's question, or confirms what was added, or asks for details if the user request was vague.",
      "taskToAdd": null or {
        "title": "Title of the task",
        "priority": "URGENT" | "HIGH" | "MEDIUM" | "LOW",
        "description": "Short explanation of the task"
      },
      "routineToAdd": null or {
        "title": "Title of the routine task",
        "duration": "Duration of the routine task (e.g. 15 min, 30 min, 1 hr)"
      },
      "shouldOptimize": true or false
    }

    Keep replies humble, helpful, and focused on reducing cognitive load. Do not use markdown code tags outside of the outermost JSON block. Keep JSON valid.
  `;

  try {
    const replyText = await callGemini(prompt, true);
    const result = JSON.parse(replyText);
    res.json({
      reply: result.reply,
      taskToAdd: result.taskToAdd || null,
      routineToAdd: result.routineToAdd || null,
      shouldOptimize: !!result.shouldOptimize
    });
  } catch (err: any) {
    console.warn("Using local chat helper fallback:", err.message);
    
    // Smart local regex parser for task addition and schedule commands
    let reply = "I am monitoring your deadlines to ensure everything stays on track. If there is a priority conflict, let's restructure your afternoon.";
    let taskToAdd: any = null;
    let routineToAdd: any = null;
    let shouldOptimize = false;

    const lower = message.toLowerCase();
    
    if (lower.includes("brief") || lower.includes("summary") || lower.includes("morning")) {
      reply = "Good morning! Your schedule has 1 High-Priority focus session today. Your biggest risk is 'Client Onboarding' in 2 hours, which has 3 pending tasks. Let's tackle that first before routine meetings.";
    } else if (lower.includes("optimize") || lower.includes("reschedule") || lower.includes("move")) {
      reply = "Understood. I have optimized your slots. I've moved 'Sync Design Assets' to 4:00 PM so you have an uninterrupted 2-hour window for deep focus.";
      shouldOptimize = true;
    } else if (lower.includes("routine") && (lower.includes("add") || lower.includes("schedule") || lower.includes("create"))) {
      let cleanTitle = message
        .replace(/add routine task/gi, "")
        .replace(/add routine/gi, "")
        .replace(/create routine/gi, "")
        .replace(/schedule routine/gi, "")
        .replace(/routine/gi, "")
        .replace(/add/gi, "")
        .replace(/create/gi, "")
        .replace(/schedule/gi, "")
        .trim();
      
      if (!cleanTitle) cleanTitle = "Daily Routine Task";
      cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

      let duration = "15 min";
      const durMatch = message.match(/(\d+)\s*(min|minute|hour|hr|h)/i);
      if (durMatch) {
        duration = `${durMatch[1]} ${durMatch[2].toLowerCase().startsWith('m') ? 'min' : 'hr'}`;
      }

      routineToAdd = {
        title: cleanTitle,
        duration: duration
      };
      reply = `I have successfully added the routine task "${cleanTitle}" with a duration of ${duration} to your daily routines checklist!`;
    } else if (lower.includes("add") || lower.includes("schedule") || lower.includes("create")) {
      let cleanTitle = message
        .replace(/add task to/gi, "")
        .replace(/add task/gi, "")
        .replace(/add/gi, "")
        .replace(/schedule task/gi, "")
        .replace(/schedule/gi, "")
        .replace(/create task/gi, "")
        .replace(/create/gi, "")
        .trim();
      
      if (!cleanTitle) cleanTitle = "AI Generated Task";
      cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
      
      let priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
      if (lower.includes("urgent") || lower.includes("asap")) {
        priority = 'URGENT';
      } else if (lower.includes("low")) {
        priority = 'LOW';
      } else if (lower.includes("medium")) {
        priority = 'MEDIUM';
      }

      taskToAdd = {
        title: cleanTitle,
        priority: priority,
        description: "Task parsed from voice or text assistant chat input."
      };
      
      reply = `I have added the task "${cleanTitle}" to your active list with ${priority} priority. I'll ensure it's accommodated smoothly in today's window!`;
    } else if (lower.includes("platform") || lower.includes("how it works") || lower.includes("how does") || lower.includes("features")) {
      reply = "Welcome to Last-Minute Life Saver! I can help you with: \n\n" +
              "1. 📈 Circadian Cognitive Wave: We map your focus peaks (like 11:00 AM deep work) and lunch dips to plan tasks.\n" +
              "2. 🎛️ Sound Synthesizer: Play real Alpha/Beta brainwaves, binaural beats, and ambient synths to get in flow.\n" +
              "3. 🧠 Plan Optimizer: Click 'Optimize Actionable Plans' on any task to divide it into checklists.\n" +
              "4. 🏆 Synergy Arena: Earn XP, compete on the leaderboard, and unlock awesome badges!\n" +
              "5. 📅 Goals & Habits: Keep daily streaks protected with automated micro-commitment buffers.\n\n" +
              "You can type or speak to me to add tasks or routine tasks, and I'll keep your schedule fully optimized!";
    }

    res.json({ reply, taskToAdd, routineToAdd, shouldOptimize, note: "Offline mode. Parsed via smart fallback rules." });
  }
});

// 5. "Tell Me Anything" Mind Dump & Clarity Converter
app.post("/api/dump", async (req, res) => {
  const { dumpText } = req.body;
  if (!dumpText) {
    return res.status(400).json({ error: "Mind dump text is required." });
  }

  const prompt = `
    You are the 'Mental Refactoring Assistant' for the Last-Minute Life Saver productivity platform.
    The user is doing a "mind dump" (venting their thoughts, stress, random ideas, tasks, or worries).
    
    Your job is to:
    1. Listen empathetically, summarize their core underlying struggle in 2-3 warm, supportive, but practical sentences ("refactorFeedback"). Avoid patronizing tone.
    2. Assess the level of mental release or stress reduction (return a value for "stressReleasePct" from 10 to 90).
    3. Identify 1 to 3 concrete, extremely clear and actionable tasks that can be pulled out of this mental dump to make them feel in control ("suggestedTasks"). Each task must have a "title", a "priority" ("URGENT", "HIGH", "MEDIUM", "LOW"), and a "description" containing the next immediate action step.
    
    User's Mind Dump:
    "${dumpText}"
    
    Return ONLY a JSON object matching this structure:
    {
      "refactorFeedback": "Your warm, helpful, structured mental translation.",
      "stressReleasePct": 45,
      "suggestedTasks": [
        {
          "title": "Clear task title",
          "priority": "HIGH",
          "description": "Short explanation of the first step."
        }
      ]
    }
    Do not include any markdown backticks or other text outside the JSON object.
  `;

  try {
    const responseText = await callGemini(prompt, true);
    const result = JSON.parse(responseText);
    res.json(result);
  } catch (err: any) {
    console.warn("Falling back to local fallback for mind dump:", err.message);
    let refactorFeedback = "I've processed your thoughts. When everything hits you at once, translating background noise into singular actions is the best way to regain control. Let's tackle the top concerns step-by-step.";
    const suggestedTasks = [];
    const lower = dumpText.toLowerCase();

    if (lower.includes("meeting") || lower.includes("call") || lower.includes("sync")) {
      suggestedTasks.push({
        title: "Block prep time before sync",
        priority: "MEDIUM" as const,
        description: "Draft 3 quick talking points to keep the session highly streamlined."
      });
    }
    if (lower.includes("email") || lower.includes("write") || lower.includes("send")) {
      suggestedTasks.push({
        title: "Draft response in focus block",
        priority: "HIGH" as const,
        description: "Set a 15-minute timer and write a bulleted outline first to save time."
      });
    }
    if (suggestedTasks.length === 0) {
      suggestedTasks.push({
        title: "Take a 5-minute tactical breather",
        priority: "LOW" as const,
        description: "Use the Quantum Resonator below to reset your cognitive rhythm."
      });
    }

    res.json({
      refactorFeedback,
      stressReleasePct: 35,
      suggestedTasks,
      note: "Offline mode. Parsed via smart fallback rules."
    });
  }
});

// Vite Middleware & Static Fallback Setup
const startServer = async () => {
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
    console.log(`[LM Life Saver Server] running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
