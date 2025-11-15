/**
 * server.js
 * Single Express server that:
 * - serves client/dist static files
 * - exposes /api/auth/register to register Firebase-signed-in user (simple registration)
 * - exposes /api/users/:uid (get user info)
 * - exposes /api/admin/make-premium (to mark a user premium manually)
 * - exposes /api/features (list of features)
 * - exposes /api/ai/<feature-id> endpoints (80 features)
 *
 * NOTE: For production trust of Firebase ID tokens use firebase-admin verification.
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import OpenAI from 'openai';
import { Low, JSONFile } from 'lowdb';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const PORT = process.env.PORT || 8877;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const FREE_TRIAL_DAYS = Number(process.env.FREE_TRIAL_DAYS || 7);

// DB (file-based using lowdb)
const dbFile = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

async function initDB() {
  await db.read();
  db.data = db.data || { users: {}, audit: [] };
  await db.write();
}
await initDB();

// OpenAI client
if (!OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY not set — AI features will fail until you set it.');
}
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Helper: call OpenAI (centralized)
async function callAI({ messages, max_tokens = 600 }) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
  // If SDK version differs, change here.
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens
  });
  return resp?.choices?.[0]?.message?.content ?? '';
}

// Rate limiter (basic)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 40, // 40 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(limiter);

// Health endpoint
app.get('/_health', (req, res) => res.json({ ok: true }));

/**
 * Simple user registration
 * Client should call this after Firebase sign-in with the user's basic info:
 * {
 *   uid, email, displayName, photoURL
 * }
 *
 * We store user with trialStart and isPremium fields.
 *
 * NOTE: This is a simple registration flow. For production verify
 * the Firebase ID token on the backend (firebase-admin).
 */
app.post('/api/auth/register', async (req, res) => {
  const { uid, email, displayName, photoURL } = req.body || {};
  if (!uid) return res.status(400).json({ error: 'uid required' });

  await db.read();
  const existing = db.data.users[uid];
  if (!existing) {
    const now = new Date().toISOString();
    db.data.users[uid] = {
      uid,
      email: email || null,
      displayName: displayName || null,
      photoURL: photoURL || null,
      createdAt: now,
      trialStart: now,
      isPremium: false,
      // You can also track usage counts here
      usageCount: 0
    };
    await db.write();
  }
  res.json({ ok: true, user: db.data.users[uid] });
});

// Get user info
app.get('/api/users/:uid', async (req, res) => {
  const uid = req.params.uid;
  await db.read();
  const user = db.data.users[uid];
  if (!user) return res.status(404).json({ error: 'not found' });

  // compute trial remaining
  const trialStart = new Date(user.trialStart);
  const trialEnd = new Date(trialStart.getTime() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000);
  const now = new Date();
  const trialRemainingMs = Math.max(trialEnd - now, 0);
  const trialRemainingDays = Math.ceil(trialRemainingMs / (24 * 60 * 60 * 1000));
  res.json({ user, trial: { trialStart, trialEnd, trialRemainingDays } });
});

// Admin: mark user premium (manual)
// For demo only — protect or disable in production
app.post('/api/admin/make-premium', async (req, res) => {
  const { uid } = req.body || {};
  if (!uid) return res.status(400).json({ error: 'uid required' });
  await db.read();
  db.data.users[uid] = db.data.users[uid] || {};
  db.data.users[uid].isPremium = true;
  await db.write();
  res.json({ ok: true, user: db.data.users[uid] });
});

// ===== AI FEATURES: list of 80 features metadata =====
const FEATURES = [
  { id: 'chat', title: 'Conversational Chat', system: 'You are a friendly conversational assistant.', defaultPrompt: 'Hello, tell me about yourself.' },
  { id: 'summarize', title: 'Text Summarization', system: 'You are a concise summarizer. Output a short summary.', defaultPrompt: 'Summarize this text:' },
  { id: 'translate', title: 'Translate Text', system: 'You are a translation assistant. Translate into requested language.', defaultPrompt: 'Translate the following to English:' },
  { id: 'paraphrase', title: 'Paraphrase', system: 'You are a paraphraser. Rewrite preserving meaning.', defaultPrompt: 'Paraphrase this sentence:' },
  { id: 'grammar', title: 'Grammar Correction', system: 'You fix grammar and punctuation.', defaultPrompt: 'Correct grammar for:' },
  { id: 'rewrite-tone', title: 'Rewrite Tone', system: 'You change the tone (formal/casual).', defaultPrompt: 'Rewrite this to sound more formal:' },
  { id: 'qa', title: 'Question Answering', system: 'You answer questions concisely and clearly.', defaultPrompt: 'Answer the question:' },
  { id: 'codegen', title: 'Code Generation', system: 'You generate code snippets and comments.', defaultPrompt: 'Write code to:' },
  { id: 'explain-code', title: 'Explain Code', system: 'You explain code line-by-line.', defaultPrompt: 'Explain this code:' },
  { id: 'fix-bug', title: 'Find & Fix Bug', system: 'You identify bugs and suggest fixes.', defaultPrompt: 'Find bugs and suggest fixes for the code:' },
  { id: 'unit-tests', title: 'Unit Test Generator', system: 'You generate unit tests for given code.', defaultPrompt: 'Generate unit tests for this function:' },
  { id: 'sql-gen', title: 'SQL Generator', system: 'You create SQL queries and explain them.', defaultPrompt: 'Produce an SQL query to:' },
  { id: 'data-clean', title: 'Data Cleaning', system: 'You propose data cleaning steps and code.', defaultPrompt: 'How to clean dataset with columns: ...' },
  { id: 'excel-formula', title: 'Excel Formula Helper', system: 'You write Excel formulas with explanation.', defaultPrompt: 'Create an Excel formula to:' },
  { id: 'image-gen', title: 'Image Generation', system: 'You create descriptive prompts for image models.', defaultPrompt: 'Create a prompt to generate an image of:' },
  { id: 'image-edit', title: 'Image Edit', system: 'You explain how to edit images step-by-step.', defaultPrompt: 'How to edit an image to:' },
  { id: 'text-to-speech', title: 'Text to Speech', system: 'You produce TTS instructions or SSML.', defaultPrompt: 'Convert this text to SSML:' },
  { id: 'speech-to-text', title: 'Speech to Text', system: 'You transcribe audio.', defaultPrompt: 'Transcribe the following audio (describe audio content):' },
  { id: 'summarize-audio', title: 'Summarize Audio', system: 'You summarize transcripts.', defaultPrompt: 'Summarize the transcript:' },
  { id: 'meeting-notes', title: 'Meeting Notes', system: 'You extract decisions and action items.', defaultPrompt: 'Create meeting notes from the following:' },
  { id: 'conversation-insights', title: 'Conversation Insights', system: 'You extract insights and sentiment.', defaultPrompt: 'Extract insights from the conversation:' },
  { id: 'sentiment', title: 'Sentiment Analysis', system: 'You detect sentiment and confidence.', defaultPrompt: 'Analyze sentiment for:' },
  { id: 'entity-extraction', title: 'Entity Extraction', system: 'You extract named entities.', defaultPrompt: 'Extract entities from:' },
  { id: 'keyword-extract', title: 'Keyword Extraction', system: 'You extract keywords and phrases.', defaultPrompt: 'Extract keywords from:' },
  { id: 'email-draft', title: 'Email Draft', system: 'You write professional emails.', defaultPrompt: 'Write an email to a hiring manager applying for:' },
  { id: 'cover-letter', title: 'Cover Letter', system: 'You write targeted cover letters.', defaultPrompt: 'Write a cover letter for the role:' },
  { id: 'resume-review', title: 'Resume Review', system: 'You suggest improvements for resumes.', defaultPrompt: 'Review this resume and give suggestions:' },
  { id: 'job-descriptions', title: 'Job Description', system: 'You write inclusive job descriptions.', defaultPrompt: 'Create a job description for a:' },
  { id: 'idea-brainstorm', title: 'Idea Brainstorm', system: 'You generate many creative ideas.', defaultPrompt: 'Brainstorm ideas for:' },
  { id: 'marketing-copy', title: 'Marketing Copy', system: 'You write ad and landing copy.', defaultPrompt: 'Write short ad copy for:' },
  { id: 'seo-optimizer', title: 'SEO Optimizer', system: 'You recommend SEO improvements.', defaultPrompt: 'Optimize this content for SEO:' },
  { id: 'product-namer', title: 'Product Namer', system: 'You suggest product names with rationale.', defaultPrompt: 'Generate product names for:' },
  { id: 'ux-review', title: 'UX Review', system: 'You prioritize UX improvements.', defaultPrompt: 'Review this UI/UX and suggest improvements:' },
  { id: 'a-b-test', title: 'A/B Test Ideas', system: 'You propose test variants and metrics.', defaultPrompt: 'Suggest A/B test ideas for:' },
  { id: 'legal-summarize', title: 'Legal Summarizer', system: 'You summarize legal content in plain language (non-legal).', defaultPrompt: 'Summarize this legal document:' },
  { id: 'privacy-review', title: 'Privacy Advice', system: 'You list privacy best practices.', defaultPrompt: 'Suggest privacy best practices for an app that:' },
  { id: 'cyber-ops', title: 'Cybersecurity Tips', system: 'You give high-level security recommendations.', defaultPrompt: 'Security checklist for a web app:' },
  { id: 'design-system', title: 'Design Tokens', system: 'You propose design tokens (colors, spacing).', defaultPrompt: 'Create a basic design token set for a product:' },
  { id: 'tone-analyzer', title: 'Tone Analyzer', system: 'You analyze tone and suggest changes.', defaultPrompt: 'Analyze tone for the text:' },
  { id: 'persona-gen', title: 'User Persona Generator', system: 'You generate user personas with needs and goals.', defaultPrompt: 'Create a user persona for a product used by:' },
  { id: 'roadmap-gen', title: 'Product Roadmap', system: 'You make concise roadmaps by quarter.', defaultPrompt: 'Generate a 6-month roadmap for:' },
  { id: 'feature-prioritize', title: 'Feature Prioritization', system: 'You score features using RICE.', defaultPrompt: 'Prioritize these features using RICE:' },
  { id: 'bug-report', title: 'Bug Report Generator', system: 'You format bug reports with steps to reproduce.', defaultPrompt: 'Create a bug report for the issue:' },
  { id: 'changelog', title: 'Changelog Writer', system: 'You write release notes highlighting impacts.', defaultPrompt: 'Write release notes for these changes:' },
  { id: 'scheduler', title: 'Meeting Scheduler', system: 'You suggest meeting times across timezones.', defaultPrompt: 'Suggest meeting times for participants in:' },
  { id: 'summary-action', title: 'Action Items', system: 'You extract action items and owners.', defaultPrompt: 'Extract action items from the meeting transcript:' },
  { id: 'visualize-data', title: 'Data Visualization Plan', system: 'You recommend charts and axes for datasets.', defaultPrompt: 'Suggest visualizations for dataset with columns:' },
  { id: 'regex-gen', title: 'Regex Generator', system: 'You produce regex patterns and explain them.', defaultPrompt: 'Create a regex to match:' },
  { id: 'explain-ml', title: 'Explain ML Concepts', system: 'You explain ML topics simply.', defaultPrompt: 'Explain the concept of:' },
  { id: 'prompt-engineer', title: 'Prompt Engineering', system: 'You optimize prompts for clarity.', defaultPrompt: 'Improve this prompt:' },
  { id: 'persona-chat', title: 'Role-play Chat', system: 'You role-play as described persona.', defaultPrompt: 'Act as a friendly travel agent who:' },
  { id: 'story-gen', title: 'Story Generator', system: 'You write short stories tailored to audience.', defaultPrompt: 'Write a short story about:' },
  { id: 'poetry', title: 'Poetry Generator', system: 'You write poems in requested style.', defaultPrompt: 'Write a short poem about:' },
  { id: 'lesson-plan', title: 'Lesson Plan', system: 'You create lesson plans with objectives and activities.', defaultPrompt: 'Create a lesson plan for teaching:' },
  { id: 'flashcards', title: 'Flashcards Creator', system: 'You create Q/A flashcards for study.', defaultPrompt: 'Create flashcards for the topic:' },
  { id: 'math-solver', title: 'Math Solver', system: 'You solve math problems step-by-step.', defaultPrompt: 'Solve this math problem step-by-step:' },
  { id: 'chem-helper', title: 'Chemistry Helper', system: 'You explain chemistry topics safely.', defaultPrompt: 'Explain the reaction:' },
  { id: 'medical-info', title: 'Medical Info', system: 'You provide general medical info with disclaimer.', defaultPrompt: 'Explain symptoms and possible causes for:' },
  { id: 'fitness-plan', title: 'Fitness Plan', system: 'You create safe workout plans for adults.', defaultPrompt: 'Create a 4-week fitness plan for someone who:' },
  { id: 'meal-plan', title: 'Meal Planner', system: 'You create balanced meal plans and shopping lists.', defaultPrompt: 'Create a 7-day meal plan for:' },
  { id: 'budgeting', title: 'Budget Planner', system: 'You create simple monthly budget templates.', defaultPrompt: 'Create a monthly budget for income and expenses:' },
  { id: 'tax-tips', title: 'Tax Tips', system: 'You provide general tax-filing tips (non-legal).', defaultPrompt: 'General tax tips for a freelancer in:' },
  { id: 'trivia', title: 'Trivia Generator', system: 'You create trivia Q/A by topic.', defaultPrompt: 'Create 5 trivia questions about world capitals' },
  { id: 'quiz-maker', title: 'Quiz Maker', system: 'You produce multiple-choice quizzes.', defaultPrompt: 'Create a 10-question multiple-choice quiz on:' },
  { id: 'game-idea', title: 'Game Idea', system: 'You propose game concepts and mechanics.', defaultPrompt: 'Suggest indie game concepts for mobile devices:' },
  { id: 'music-lyrics', title: 'Music Lyrics', system: 'You write song lyrics and choruses.', defaultPrompt: 'Write a chorus for a pop song about:' },
  { id: 'chord-prog', title: 'Chord Progression', system: 'You suggest chord progressions and mood.', defaultPrompt: 'Suggest a chord progression for a melancholic song in C major' },
  { id: 'photo-caption', title: 'Photo Caption', system: 'You craft social media captions.', defaultPrompt: 'Write a caption for a photo of:' },
  { id: 'resume-tailor', title: 'Resume Tailor', system: 'You tailor resumes for job postings.', defaultPrompt: 'Tailor this resume for the job posting:' },
  { id: 'interview-prep', title: 'Interview Prep', system: 'You produce interview Q/A and model answers.', defaultPrompt: 'Generate common interview questions for a software engineer role' },
  { id: 'cold-email', title: 'Cold Email', system: 'You write concise outreach emails.', defaultPrompt: 'Write a cold email to a potential client about:' },
  { id: 'sales-pitch', title: 'Sales Pitch', system: 'You create short persuasive sales pitches.', defaultPrompt: 'Create a short sales pitch for:' },
  { id: 'invest-summary', title: 'Investment Summary', system: 'You summarize memos into bullets.', defaultPrompt: 'Summarize this investment memo into key points:' },
  { id: 'risk-assess', title: 'Risk Assessment', system: 'You list risks and mitigations.', defaultPrompt: 'Assess risks for the project:' },
  { id: 'compliance-check', title: 'Compliance Check', system: 'You provide a basic compliance checklist (non-legal).', defaultPrompt: 'Compliance checklist for a SaaS handling user data:' },
  { id: 'translation-multiple', title: 'Multi-language Translator', system: 'You translate into multiple target languages.', defaultPrompt: 'Translate this into Spanish, French, and German:' },
  { id: 'voice-persona', title: 'Voice Persona', system: 'You generate voice personas for TTS.', defaultPrompt: 'Create a voice persona for a calm, trustworthy narrator' }
];

// List endpoint
app.get('/api/features', (req, res) => {
  res.json(FEATURES.map(({ id, title, defaultPrompt }) => ({ id, title, defaultPrompt })));
});

// Determine if a user is in trial (helper)
function isInFreeTrial(user) {
  if (!user || !user.trialStart) return false;
  const start = new Date(user.trialStart);
  const diffMs = Date.now() - start.getTime();
  const days = diffMs / (24 * 60 * 60 * 1000);
  return days <= FREE_TRIAL_DAYS;
}

// Whether feature is premium — for demo mark some features premium
const PREMIUM_FEATURES = new Set([
  'image-gen','image-edit','text-to-speech','speech-to-text','summarize-audio','meeting-notes',
  'codegen','unit-tests','sql-gen','data-clean','excel-formula','music-lyrics','chord-prog'
]);

// Create endpoints for all features
for (const f of FEATURES) {
  app.post(`/api/ai/${f.id}`, async (req, res) => {
    try {
      const promptBody = (req.body && (req.body.prompt || req.body.input || req.body.message)) || '';
      const prompt = (promptBody && String(promptBody).trim()) ? promptBody : f.defaultPrompt || '';

      // Basic user check: client may pass uid in header or body
      const uid = req.header('x-user-uid') || req.body.uid || null;
      await db.read();

      if (uid) {
        db.data.users[uid] = db.data.users[uid] || { uid, createdAt: new Date().toISOString(), isPremium: false, trialStart: new Date().toISOString(), usageCount: 0 };
      }

      // Premium feature gating: if premium feature and not in trial & not premium => reject
      if (PREMIUM_FEATURES.has(f.id)) {
        const user = uid ? db.data.users[uid] : null;
        const allowed = (user && user.isPremium) || (user && isInFreeTrial(user));
        if (!allowed) {
          return res.status(403).json({ error: 'Feature locked. Upgrade to premium or start free trial.' });
        }
      }

      // Record usage
      if (uid) {
        db.data.users[uid].usageCount = (db.data.users[uid].usageCount || 0) + 1;
        db.data.audit = db.data.audit || [];
        db.data.audit.push({ uid, feature: f.id, at: new Date().toISOString() });
        await db.write();
      }

      // Build messages
      const messages = [
        { role: 'system', content: f.system || 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ];

      const result = await callAI({ messages, max_tokens: 600 });
      res.json({ result });
    } catch (err) {
      console.error(`feature ${f.id} error:`, err?.message || err);
      res.status(500).json({ error: err?.message || 'OpenAI error' });
    }
  });
}

// Generic chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const prompt = req.body.prompt || req.body.input || req.body.message;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });

    const uid = req.header('x-user-uid') || req.body.uid || null;
    await db.read();
    if (uid) {
      db.data.users[uid] = db.data.users[uid] || { uid, createdAt: new Date().toISOString(), isPremium: false, trialStart: new Date().toISOString(), usageCount: 0 };
      db.data.users[uid].usageCount++;
      db.data.audit = db.data.audit || [];
      db.data.audit.push({ uid, feature: 'chat', at: new Date().toISOString() });
      await db.write();
    }

    const messages = [{ role: 'system', content: 'You are ChatMe, a helpful assistant.' }, { role: 'user', content: prompt }];
    const result = await callAI({ messages, max_tokens: 800 });
    res.json({ result });
  } catch (err) {
    console.error('chat error', err);
    res.status(500).json({ error: err?.message || 'OpenAI error' });
  }
});

// Serve static client build
const clientDist = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));

// Start server
app.listen(PORT, () => {
  console.log(`ChatMe server listening on port ${PORT}`);
});
