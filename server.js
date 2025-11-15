// server.js — Express backend that serves built React app and exposes 80 feature endpoints
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai';

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY not set. Set it in Render env vars or .env locally.');
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper to call OpenAI (update here if SDK differs)
async function callAI({ messages, max_tokens = 600 }) {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens
  });
  const content = response?.choices?.[0]?.message?.content;
  return content ?? '';
}

// Health
app.get('/_health', (req, res) => res.json({ ok: true }));

// Generic chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  const prompt = req.body.prompt || req.body.message || '';
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });
  try {
    const result = await callAI({
      messages: [
        { role: 'system', content: 'You are ChatMe — an honest, concise AI assistant.' },
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

// 80 features list (id, system prompt, defaultPrompt)
const FEATURES = [
  { id: 'chat', system: 'You are a friendly conversational assistant.', defaultPrompt: 'Hello, tell me about yourself.' },
  { id: 'summarize', system: 'You are a concise summarizer. Output a short summary.', defaultPrompt: 'Summarize this text:' },
  { id: 'translate', system: 'You are a translation assistant.', defaultPrompt: 'Translate the following to English:' },
  { id: 'paraphrase', system: 'You are a paraphraser. Rewrite text preserving meaning.', defaultPrompt: 'Paraphrase this sentence:' },
  { id: 'grammar', system: 'You correct grammar and punctuation, returning corrected text.', defaultPrompt: 'Correct grammar for:' },
  { id: 'rewrite-tone', system: 'You change the tone (formal/casual) as requested.', defaultPrompt: 'Rewrite this to sound more formal:' },
  { id: 'qa', system: 'You answer questions precisely and cite steps when needed.', defaultPrompt: 'Answer the question:' },
  { id: 'codegen', system: 'You write code snippets with explanations when asked.', defaultPrompt: 'Write code to:' },
  { id: 'explain-code', system: 'You explain code line-by-line simply.', defaultPrompt: 'Explain this code:' },
  { id: 'fix-bug', system: 'You identify and suggest fixes for bugs in code.', defaultPrompt: 'Find bugs and suggest fixes for the code:' },
  { id: 'unit-tests', system: 'You produce unit tests for provided code and framework.', defaultPrompt: 'Generate unit tests for this function:' },
  { id: 'sql-gen', system: 'You generate safe SQL queries per instructions.', defaultPrompt: 'Produce an SQL query to:' },
  { id: 'data-clean', system: 'You suggest steps to clean tabular data and sample code.', defaultPrompt: 'How to clean dataset with columns: ...' },
  { id: 'excel-formula', system: 'You write Excel formulas and explain them.', defaultPrompt: 'Create an Excel formula to:' },
  { id: 'image-gen', system: 'You craft image generation prompts for image models; output only a descriptive prompt.', defaultPrompt: 'Create a prompt to generate an image of:' },
  { id: 'image-edit', system: 'You provide step-by-step instructions for editing images.', defaultPrompt: 'How to edit an image to:' },
  { id: 'text-to-speech', system: 'You produce a short SSML or instructions for TTS output.', defaultPrompt: 'Convert this text to SSML:' },
  { id: 'speech-to-text', system: 'You transcribe spoken text and provide timestamps if requested.', defaultPrompt: 'Transcribe the following audio (describe audio content):' },
  { id: 'summarize-audio', system: 'You summarize meeting/audio transcripts accurately.', defaultPrompt: 'Summarize the transcript:' },
  { id: 'meeting-notes', system: 'You extract notes, decisions and action items from meeting text.', defaultPrompt: 'Create meeting notes from the following:' },
  { id: 'conversation-insights', system: 'You extract insights and sentiment from a conversation.', defaultPrompt: 'Extract insights from the conversation:' },
  { id: 'sentiment', system: 'You detect sentiment and confidence.', defaultPrompt: 'Analyze sentiment for:' },
  { id: 'entity-extraction', system: 'You extract named entities (people, orgs, places, dates).', defaultPrompt: 'Extract entities from:' },
  { id: 'keyword-extract', system: 'You extract important keywords and short phrases.', defaultPrompt: 'Extract keywords from:' },
  { id: 'email-draft', system: 'You write professional email drafts tailored to the audience.', defaultPrompt: 'Write an email to a hiring manager applying for:' },
  { id: 'cover-letter', system: 'You write concise, targeted cover letters.', defaultPrompt: 'Write a cover letter for the role:' },
  { id: 'resume-review', system: 'You critique a resume and suggest improvements.', defaultPrompt: 'Review this resume and give suggestions:' },
  { id: 'job-descriptions', system: 'You create clear, inclusive job descriptions.', defaultPrompt: 'Create a job description for a:' },
  { id: 'idea-brainstorm', system: 'You produce many creative ideas and short explanations.', defaultPrompt: 'Brainstorm ideas for:' },
  { id: 'marketing-copy', system: 'You write persuasive marketing copy for ads and landing pages.', defaultPrompt: 'Write short ad copy for:' },
  { id: 'seo-optimizer', system: 'You optimize content for SEO and give meta tags.', defaultPrompt: 'Optimize this content for SEO:' },
  { id: 'product-namer', system: 'You suggest catchy product names and short rationale.', defaultPrompt: 'Generate product names for:' },
  { id: 'ux-review', system: 'You review UI/UX and list prioritized suggestions.', defaultPrompt: 'Review this UI/UX and suggest improvements:' },
  { id: 'a-b-test', system: 'You propose A/B test variants and metrics to track.', defaultPrompt: 'Suggest A/B test ideas for:' },
  { id: 'legal-summarize', system: 'You summarize legal text in simple language (non-official).', defaultPrompt: 'Summarize this legal document:' },
  { id: 'privacy-review', system: 'You list privacy best-practices for an application.', defaultPrompt: 'Suggest privacy best practices for an app that:' },
  { id: 'cyber-ops', system: 'You provide high-level security recommendations (non-invasive).', defaultPrompt: 'Security checklist for a web app:' },
  { id: 'design-system', system: 'You output a starter design token set (colors, spacing).', defaultPrompt: 'Create a basic design token set for a product:' },
  { id: 'tone-analyzer', system: 'You detect tone and suggest rephrasing for clearer tone.', defaultPrompt: 'Analyze tone for the text:' },
  { id: 'persona-gen', system: 'You generate user personas with attributes and needs.', defaultPrompt: 'Create a user persona for a product used by:' },
  { id: 'roadmap-gen', system: 'You create a concise product roadmap by quarters.', defaultPrompt: 'Generate a 6-month roadmap for:' },
  { id: 'feature-prioritize', system: 'You score features using RICE or similar framework.', defaultPrompt: 'Prioritize these features using RICE:' },
  { id: 'bug-report', system: 'You format bug reports with steps, expected and actual.', defaultPrompt: 'Create a bug report for the issue:' },
  { id: 'changelog', system: 'You write release notes highlighting changes and impacts.', defaultPrompt: 'Write release notes for these changes:' },
  { id: 'scheduler', system: 'You suggest meeting times given participants/timezones.', defaultPrompt: 'Suggest meeting times for participants in:' },
  { id: 'summary-action', system: 'You extract action items and owners from text.', defaultPrompt: 'Extract action items from the meeting transcript:' },
  { id: 'visualize-data', system: 'You suggest chart types and axes for a dataset.', defaultPrompt: 'Suggest visualizations for dataset with columns:' },
  { id: 'regex-gen', system: 'You produce regex patterns and explain them.', defaultPrompt: 'Create a regex to match:' },
  { id: 'explain-ml', system: 'You explain machine learning concepts simply.', defaultPrompt: 'Explain the concept of:' },
  { id: 'prompt-engineer', system: 'You improve user prompts for clarity and performance.', defaultPrompt: 'Improve this prompt:' },
  { id: 'persona-chat', system: 'You role-play as the persona described by the user.', defaultPrompt: 'Act as a friendly travel agent who:' },
  { id: 'story-gen', system: 'You write creative short stories tailored to audience.', defaultPrompt: 'Write a short story about:' },
  { id: 'poetry', system: 'You write poems in requested style and meter.', defaultPrompt: 'Write a short poem about:' },
  { id: 'lesson-plan', system: 'You generate lesson plans with objectives and activities.', defaultPrompt: 'Create a lesson plan for teaching:' },
  { id: 'flashcards', system: 'You generate question-answer flashcards for study.', defaultPrompt: 'Create flashcards for the topic:' },
  { id: 'math-solver', system: 'You solve math step-by-step showing reasoning.', defaultPrompt: 'Solve this math problem step-by-step:' },
  { id: 'chem-helper', system: 'You explain chemistry concepts and reactions safely.', defaultPrompt: 'Explain the reaction:' },
  { id: 'medical-info', system: 'You provide general medical info and always include a disclaimer advising professional consultation.', defaultPrompt: 'Explain symptoms and possible causes for:' },
  { id: 'fitness-plan', system: 'You produce safe, progressive fitness plans for adults.', defaultPrompt: 'Create a 4-week fitness plan for someone who:' },
  { id: 'meal-plan', system: 'You generate balanced meal plans and shopping lists.', defaultPrompt: 'Create a 7-day meal plan for:' },
  { id: 'budgeting', system: 'You produce a simple monthly budget template.', defaultPrompt: 'Create a monthly budget for income and expenses:' },
  { id: 'tax-tips', system: 'You provide general tax-filing tips (non-legal).', defaultPrompt: 'General tax tips for a freelancer in:' },
  { id: 'trivia', system: 'You create trivia questions and answers by topics.', defaultPrompt: 'Create 5 trivia questions about world capitals' },
  { id: 'quiz-maker', system: 'You generate quizzes with multiple-choice questions and answers.', defaultPrompt: 'Create a 10-question multiple-choice quiz on:' },
  { id: 'game-idea', system: 'You suggest game ideas with short mechanics and target audience.', defaultPrompt: 'Suggest indie game concepts for mobile devices:' },
  { id: 'music-lyrics', system: 'You write song lyrics in requested style and structure.', defaultPrompt: 'Write a chorus for a pop song about:' },
  { id: 'chord-prog', system: 'You suggest musical chord progressions and mood.', defaultPrompt: 'Suggest a chord progression for a melancholic song in C major' },
  { id: 'photo-caption', system: 'You craft catchy captions for photos for social media.', defaultPrompt: 'Write a caption for a photo of:' },
  { id: 'resume-tailor', system: 'You tailor resumes for a specific job posting.', defaultPrompt: 'Tailor this resume for the job posting:' },
  { id: 'interview-prep', system: 'You produce mock interview questions and model answers.', defaultPrompt: 'Generate common interview questions for a software engineer role' },
  { id: 'cold-email', system: 'You write concise cold outreach emails with CTA.', defaultPrompt: 'Write a cold email to a potential client about:' },
  { id: 'sales-pitch', system: 'You craft persuasive sales pitches focusing on value.', defaultPrompt: 'Create a short sales pitch for:' },
  { id: 'invest-summary', system: 'You summarize investment memos into key bullets.', defaultPrompt: 'Summarize this investment memo into key points:' },
  { id: 'risk-assess', system: 'You identify potential risks and mitigation steps.', defaultPrompt: 'Assess risks for the project:' },
  { id: 'compliance-check', system: 'You give a basic compliance checklist (non-legal).', defaultPrompt: 'Compliance checklist for a SaaS handling user data:' },
  { id: 'translation-multiple', system: 'You translate text into multiple target languages provided by the user.', defaultPrompt: 'Translate this into Spanish, French, and German:' },
  { id: 'voice-persona', system: 'You generate voice persona descriptions for TTS or voice actors.', defaultPrompt: 'Create a voice persona for a calm, trustworthy narrator' }
];

// Dynamically create POST endpoints for each feature
for (const f of FEATURES) {
  app.post(`/api/ai/${f.id}`, async (req, res) => {
    const promptBody = (req.body && (req.body.prompt || req.body.input || req.body.message)) || '';
    const promptToUse = promptBody.trim() ? promptBody : (f.defaultPrompt || '');
    if (!promptToUse) return res.status(400).json({ error: 'prompt is required' });

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

// Optional listing endpoint for the frontend
app.get('/api/features', (req, res) => {
  res.json(FEATURES.map(({ id, defaultPrompt, system }) => ({ id, defaultPrompt, system })));
});

// Serve client/dist (built frontend)
const __dirname = path.resolve();
const clientDist = path.join(__dirname, 'client', 'dist');

// Serve static files
app.use(express.static(clientDist));

// For any other route, serve index.html (SPA)
app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));

// Start server
const PORT = process.env.PORT || 8877;
app.listen(PORT, () => {
  console.log(`ChatMe (single-service) listening on port ${PORT}`);
});
