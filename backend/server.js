// backend/server.js
// Single-file backend exposing 80 AI feature endpoints + generic chat
// Requires: node >= 18, install dependencies: npm install express cors dotenv openai body-parser
// Set environment variable: OPENAI_API_KEY

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY not set. Set it in .env or in Render env vars.');
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Helper to call OpenAI consistently (single place to change model/calls) ---
async function callAI({ messages, max_tokens = 600 }) {
  // Uses chat completion style call. If your SDK version differs, update here.
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens,
  });
  // Defensive access
  const content = response?.choices?.[0]?.message?.content;
  return content ?? '';
}

// --- Health endpoint ---
app.get('/', (req, res) => {
  res.send('ChatMe Backend (80 features) — healthy');
});

// --- Generic chat endpoint ---
app.post('/api/ai/chat', async (req, res) => {
  const prompt = req.body.prompt || req.body.message || '';
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });
  try {
    const result = await callAI({
      messages: [
        { role: 'system', content: 'You are ChatMe — a helpful, concise assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800
    });
    res.json({ result });
  } catch (err) {
    console.error('chat error', err);
    res.status(500).json({ error: err.message || 'OpenAI error' });
  }
});

// --- Define all 80 features with system instructions and default prompts ---
const FEATURES = [
  { id: 'chat', title: 'Conversational Chat', system: 'You are a friendly conversational assistant.', defaultPrompt: 'Hello, tell me about yourself.' },
  { id: 'summarize', title: 'Text Summarization', system: 'You are a concise summarizer. Output a short summary.', defaultPrompt: 'Summarize this text:' },
  { id: 'translate', title: 'Translate Text', system: 'You are a translation assistant. Detect language and translate as requested.', defaultPrompt: 'Translate the following to English:' },
  { id: 'paraphrase', title: 'Paraphrase', system: 'You are a paraphraser. Rewrite text preserving meaning.', defaultPrompt: 'Paraphrase this sentence:' },
  { id: 'grammar', title: 'Grammar Correction', system: 'You correct grammar and punctuation, returning corrected text.', defaultPrompt: 'Correct grammar for:' },
  { id: 'rewrite-tone', title: 'Rewrite Tone', system: 'You change the tone (formal/casual) as requested.', defaultPrompt: 'Rewrite this to sound more formal:' },
  { id: 'qa', title: 'Question Answering', system: 'You answer questions precisely and cite steps when needed.', defaultPrompt: 'Answer the question:' },
  { id: 'codegen', title: 'Code Generation', system: 'You write code snippets with explanations when asked.', defaultPrompt: 'Write code to:' },
  { id: 'explain-code', title: 'Explain Code', system: 'You explain code line-by-line simply.', defaultPrompt: 'Explain this code:' },
  { id: 'fix-bug', title: 'Find & Fix Bug', system: 'You identify and suggest fixes for bugs in code.', defaultPrompt: 'Find bugs and suggest fixes for the code:' },
  { id: 'unit-tests', title: 'Unit Test Generator', system: 'You produce unit tests for provided code and framework.', defaultPrompt: 'Generate unit tests for this function:' },
  { id: 'sql-gen', title: 'SQL Generator', system: 'You generate safe SQL queries per instructions.', defaultPrompt: 'Produce an SQL query to:' },
  { id: 'data-clean', title: 'Data Cleaning', system: 'You suggest steps to clean tabular data and sample code.', defaultPrompt: 'How to clean dataset with columns: ...' },
  { id: 'excel-formula', title: 'Excel Formula Helper', system: 'You write Excel formulas and explain them.', defaultPrompt: 'Create an Excel formula to:' },
  { id: 'image-gen', title: 'Image Generation', system: 'You craft image generation prompts for image models; output only a descriptive prompt.', defaultPrompt: 'Create a prompt to generate an image of:' },
  { id: 'image-edit', title: 'Image Edit (placeholder)', system: 'You provide step-by-step instructions for editing images.', defaultPrompt: 'How to edit an image to:' },
  { id: 'text-to-speech', title: 'Text to Speech', system: 'You produce a short SSML or instructions for TTS output.', defaultPrompt: 'Convert this text to SSML:' },
  { id: 'speech-to-text', title: 'Speech to Text', system: 'You transcribe spoken text and provide timestamps if requested.', defaultPrompt: 'Transcribe the following audio (describe audio content):' },
  { id: 'summarize-audio', title: 'Summarize Audio', system: 'You summarize meeting/audio transcripts accurately.', defaultPrompt: 'Summarize the transcript:' },
  { id: 'meeting-notes', title: 'Meeting Notes', system: 'You extract notes, decisions and action items from meeting text.', defaultPrompt: 'Create meeting notes from the following:' },
  { id: 'conversation-insights', title: 'Conversation Insights', system: 'You extract insights and sentiment from a conversation.', defaultPrompt: 'Extract insights from the conversation:' },
  { id: 'sentiment', title: 'Sentiment Analysis', system: 'You detect sentiment and confidence.', defaultPrompt: 'Analyze sentiment for:' },
  { id: 'entity-extraction', title: 'Entity Extraction', system: 'You extract named entities (people, orgs, places, dates).', defaultPrompt: 'Extract entities from:' },
  { id: 'keyword-extract', title: 'Keyword Extraction', system: 'You extract important keywords and short phrases.', defaultPrompt: 'Extract keywords from:' },
  { id: 'email-draft', title: 'Email Draft', system: 'You write professional email drafts tailored to the audience.', defaultPrompt: 'Write an email to a hiring manager applying for:' },
  { id: 'cover-letter', title: 'Cover Letter', system: 'You write concise, targeted cover letters.', defaultPrompt: 'Write a cover letter for the role:' },
  { id: 'resume-review', title: 'Resume Review', system: 'You critique a resume and suggest improvements.', defaultPrompt: 'Review this resume and give suggestions:' },
  { id: 'job-descriptions', title: 'Job Description', system: 'You create clear, inclusive job descriptions.', defaultPrompt: 'Create a job description for a:' },
  { id: 'idea-brainstorm', title: 'Idea Brainstorm', system: 'You produce many creative ideas and short explanations.', defaultPrompt: 'Brainstorm ideas for:' },
  { id: 'marketing-copy', title: 'Marketing Copy', system: 'You write persuasive marketing copy for ads and landing pages.', defaultPrompt: 'Write short ad copy for:' },
  { id: 'seo-optimizer', title: 'SEO Optimizer', system: 'You optimize content for SEO and give meta tags.', defaultPrompt: 'Optimize this content for SEO:' },
  { id: 'product-namer', title: 'Product Namer', system: 'You suggest catchy product names and short rationale.', defaultPrompt: 'Generate product names for:' },
  { id: 'ux-review', title: 'UX Review', system: 'You review UI/UX and list prioritized suggestions.', defaultPrompt: 'Review this UI/UX and suggest improvements:' },
  { id: 'a-b-test', title: 'A/B Test Ideas', system: 'You propose A/B test variants and metrics to track.', defaultPrompt: 'Suggest A/B test ideas for:' },
  { id: 'legal-summarize', title: 'Legal Summarizer', system: 'You summarize legal text in simple language (non-official).', defaultPrompt: 'Summarize this legal document:' },
  { id: 'privacy-review', title: 'Privacy Advice', system: 'You list privacy best-practices for an application.', defaultPrompt: 'Suggest privacy best practices for an app that:' },
  { id: 'cyber-ops', title: 'Cybersecurity Tips', system: 'You provide high-level security recommendations (non-invasive).', defaultPrompt: 'Security checklist for a web app:' },
  { id: 'design-system', title: 'Design Tokens', system: 'You output a starter design token set (colors, spacing).', defaultPrompt: 'Create a basic design token set for a product:' },
  { id: 'tone-analyzer', title: 'Tone Analyzer', system: 'You detect tone and suggest rephrasing for clearer tone.', defaultPrompt: 'Analyze tone for the text:' },
  { id: 'persona-gen', title: 'User Persona Generator', system: 'You generate user personas with attributes and needs.', defaultPrompt: 'Create a user persona for a product used by:' },
  { id: 'roadmap-gen', title: 'Product Roadmap', system: 'You create a concise product roadmap by quarters.', defaultPrompt: 'Generate a 6-month roadmap for:' },
  { id: 'feature-prioritize', title: 'Feature Prioritization', system: 'You score features using RICE or similar framework.', defaultPrompt: 'Prioritize these features using RICE:' },
  { id: 'bug-report', title: 'Bug Report Generator', system: 'You format bug reports with steps, expected and actual.', defaultPrompt: 'Create a bug report for the issue:' },
  { id: 'changelog', title: 'Changelog Writer', system: 'You write release notes highlighting changes and impacts.', defaultPrompt: 'Write release notes for these changes:' },
  { id: 'scheduler', title: 'Meeting Scheduler', system: 'You suggest meeting times given participants/timezones.', defaultPrompt: 'Suggest meeting times for participants in:' },
  { id: 'summary-action', title: 'Action Items', system: 'You extract action items and owners from text.', defaultPrompt: 'Extract action items from the meeting transcript:' },
  { id: 'visualize-data', title: 'Data Visualization Plan', system: 'You suggest chart types and axes for a dataset.', defaultPrompt: 'Suggest visualizations for dataset with columns:' },
  { id: 'regex-gen', title: 'Regex Generator', system: 'You produce regex patterns and explain them.', defaultPrompt: 'Create a regex to match:' },
  { id: 'explain-ml', title: 'Explain ML Concepts', system: 'You explain machine learning concepts simply.', defaultPrompt: 'Explain the concept of:' },
  { id: 'prompt-engineer', title: 'Prompt Engineering', system: 'You improve user prompts for clarity and performance.', defaultPrompt: 'Improve this prompt:' },
  { id: 'persona-chat', title: 'Role-play Chat', system: 'You role-play as the persona described by the user.', defaultPrompt: 'Act as a friendly travel agent who:' },
  { id: 'story-gen', title: 'Story Generator', system: 'You write creative short stories tailored to audience.', defaultPrompt: 'Write a short story about:' },
  { id: 'poetry', title: 'Poetry Generator', system: 'You write poems in requested style and meter.', defaultPrompt: 'Write a short poem about:' },
  { id: 'lesson-plan', title: 'Lesson Plan', system: 'You generate lesson plans with objectives and activities.', defaultPrompt: 'Create a lesson plan for teaching:' },
  { id: 'flashcards', title: 'Flashcards Creator', system: 'You generate question-answer flashcards for study.', defaultPrompt: 'Create flashcards for the topic:' },
  { id: 'math-solver', title: 'Math Solver', system: 'You solve math step-by-step showing reasoning.', defaultPrompt: 'Solve this math problem step-by-step:' },
  { id: 'chem-helper', title: 'Chemistry Helper', system: 'You explain chemistry concepts and reactions safely.', defaultPrompt: 'Explain the reaction:' },
  { id: 'medical-info', title: 'Medical Info (disclaimer)', system: 'You provide general medical info and always include a disclaimer advising professional consultation.', defaultPrompt: 'Explain symptoms and possible causes for:' },
  { id: 'fitness-plan', title: 'Fitness Plan', system: 'You produce safe, progressive fitness plans for adults.', defaultPrompt: 'Create a 4-week fitness plan for someone who:' },
  { id: 'meal-plan', title: 'Meal Planner', system: 'You generate balanced meal plans and shopping lists.', defaultPrompt: 'Create a 7-day meal plan for:' },
  { id: 'budgeting', title: 'Budget Planner', system: 'You produce a simple monthly budget template.', defaultPrompt: 'Create a monthly budget for income and expenses:' },
  { id: 'tax-tips', title: 'Tax Tips', system: 'You provide general tax-filing tips (non-legal).', defaultPrompt: 'General tax tips for a freelancer in:' },
  { id: 'trivia', title: 'Trivia Generator', system: 'You create trivia questions and answers by topics.', defaultPrompt: 'Create 5 trivia questions about world capitals' },
  { id: 'quiz-maker', title: 'Quiz Maker', system: 'You generate quizzes with multiple-choice questions and answers.', defaultPrompt: 'Create a 10-question multiple-choice quiz on:' },
  { id: 'game-idea', title: 'Game Idea', system: 'You suggest game ideas with short mechanics and target audience.', defaultPrompt: 'Suggest indie game concepts for mobile devices:' },
  { id: 'music-lyrics', title: 'Music Lyrics', system: 'You write song lyrics in requested style and structure.', defaultPrompt: 'Write a chorus for a pop song about:' },
  { id: 'chord-prog', title: 'Chord Progression', system: 'You suggest musical chord progressions and mood.', defaultPrompt: 'Suggest a chord progression for a melancholic song in C major' },
  { id: 'photo-caption', title: 'Photo Caption', system: 'You craft catchy captions for photos for social media.', defaultPrompt: 'Write a caption for a photo of:' },
  { id: 'resume-tailor', title: 'Resume Tailor', system: 'You tailor resumes for a specific job posting.', defaultPrompt: 'Tailor this resume for the job posting:' },
  { id: 'interview-prep', title: 'Interview Prep', system: 'You produce mock interview questions and model answers.', defaultPrompt: 'Generate common interview questions for a software engineer role' },
  { id: 'cold-email', title: 'Cold Email', system: 'You write concise cold outreach emails with CTA.', defaultPrompt: 'Write a cold email to a potential client about:' },
  { id: 'sales-pitch', title: 'Sales Pitch', system: 'You craft persuasive sales pitches focusing on value.', defaultPrompt: 'Create a short sales pitch for:' },
  { id: 'invest-summary', title: 'Investment Summary', system: 'You summarize investment memos into key bullets.', defaultPrompt: 'Summarize this investment memo into key points:' },
  { id: 'risk-assess', title: 'Risk Assessment', system: 'You identify potential risks and mitigation steps.', defaultPrompt: 'Assess risks for the project:' },
  { id: 'compliance-check', title: 'Compliance Check', system: 'You give a basic compliance checklist (non-legal).', defaultPrompt: 'Compliance checklist for a SaaS handling user data:' },
  { id: 'translation-multiple', title: 'Multi-language Translator', system: 'You translate text into multiple target languages provided by the user.', defaultPrompt: 'Translate this into Spanish, French, and German:' },
  { id: 'voice-persona', title: 'Voice Persona', system: 'You generate voice persona descriptions for TTS or voice actors.', defaultPrompt: 'Create a voice persona for a calm, trustworthy narrator' }
];

// --- Create endpoints dynamically for each feature ---
for (const f of FEATURES) {
  app.post(`/api/ai/${f.id}`, async (req, res) => {
    const promptBody = (req.body && (req.body.prompt || req.body.input || req.body.message)) || '';
    const promptToUse = promptBody.trim() ? promptBody : (f.defaultPrompt || '');
    if (!promptToUse) {
      return res.status(400).json({ error: 'prompt is required in the body when feature has no defaultPrompt' });
    }

    try {
      const messages = [
        { role: 'system', content: f.system || 'You are an assistant.' },
        { role: 'user', content: promptToUse }
      ];
      const output = await callAI({ messages, max_tokens: 600 });
      res.json({ result: output });
    } catch (err) {
      console.error(`feature ${f.id} error`, err);
      res.status(500).json({ error: err.message || 'OpenAI error' });
    }
  });
}

// --- Optional: endpoint returning the list of features for frontend discovery ---
app.get('/api/features', (req, res) => {
  res.json(FEATURES.map(({ id, title, defaultPrompt, system }) => ({ id, title, defaultPrompt, system })));
});

// --- Start server ---
const PORT = process.env.PORT || 8877;
app.listen(PORT, () => {
  console.log(`ChatMe backend (80 features) listening on port ${PORT}`);
});
