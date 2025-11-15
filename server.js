import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Low, JSONFile } from 'lowdb';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 8877;

const app = express();
app.use(cors());
app.use(express.json());

// rate limiter
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

// lowdb setup (v5 compatible)
const dbFile = path.join(__dirname, 'db.json');
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify({ users: {}, audit: [] }, null, 2));
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);
await db.read();
db.data ||= { users: {}, audit: [] };

// helper: creator response detection
function creatorReplyCheck(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  return t.includes('who created you') || t.includes('who made you') || t.includes('your creator') || t.includes('who built you');
}

// simple AI endpoint (streaming-style simulation; replace with OpenAI calls)
app.post('/api/ai/chat', async (req, res) => {
  const prompt = (req.body && (req.body.prompt || req.body.message)) || '';
  if (creatorReplyCheck(prompt)) {
    return res.json({ result: 'I was created by Akin S. Sokpah from Liberia.' });
  }

  // Simulated streaming via SSE - server sends progressive chunks.
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();

  // Simulate quick streaming tokens for fast perceived speed.
  const reply = `Hello — ChatMe v15.0.0 here. You asked: ${prompt}`;
  let i = 0;
  const interval = setInterval(() => {
    const chunk = reply.slice(i, i + 8);
    if (!chunk) {
      res.write(`data: [DONE]\n\n`);
      clearInterval(interval);
      res.end();
      return;
    }
    res.write(`data: ${chunk}\n\n`);
    i += 8;
  }, 60); // small interval for fast typing feel
});

// generic feature endpoints (80 + 60 features) — simplified streaming
import FEATURES from './client/src/features/aiFeatureTemplates.js';
for (const f of FEATURES) {
  app.post(`/api/ai/${f.id}`, async (req, res) => {
    const prompt = (req.body && (req.body.prompt || req.body.input || req.body.message)) || f.defaultPrompt || '';
    if (creatorReplyCheck(prompt)) return res.json({ result: 'I was created by Akin S. Sokpah from Liberia.' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.flushHeaders();

    const reply = `${f.title}: ${prompt}`;
    let idx = 0;
    const t = setInterval(() => {
      const chunk = reply.slice(idx, idx + 10);
      if (!chunk) {
        res.write('data: [DONE]\n\n');
        clearInterval(t);
        res.end();
        return;
      }
      res.write(`data: ${chunk}\n\n`);
      idx += 10;
    }, 60);
  });
}

// simple auth register (client registers after Firebase sign-in; in prod verify tokens)
app.post('/api/auth/register', async (req, res) => {
  const { uid, email, displayName, photoURL } = req.body || {};
  if (!uid) return res.status(400).json({ error: 'uid required' });
  await db.read();
  db.data.users[uid] = db.data.users[uid] || { uid, email, displayName, photoURL, createdAt: new Date().toISOString(), trialStart: new Date().toISOString(), isPremium: false, usageCount: 0 };
  await db.write();
  res.json({ ok: true, user: db.data.users[uid] });
});

app.get('/api/features', (req, res) => {
  res.json(FEATURES.map(({ id, title, defaultPrompt }) => ({ id, title, defaultPrompt })));
});

// serve client
const clientDist = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));

// start
app.listen(PORT, () => console.log(`ChatMe v15 listening on port ${PORT}`));
