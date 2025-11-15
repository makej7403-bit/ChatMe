import express from 'express'
import OpenAI from 'openai'

const router = express.Router()

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY not set. Please set it in .env or Render env vars.')
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Generic chat endpoint
router.post('/chat', async (req, res) => {
  const { prompt } = req.body
  try {
    const chat = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are ChatMe, a helpful AI assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800
    })
    res.json({ result: chat.choices[0].message.content })
  } catch (err) {
    console.error('chat error', err)
    res.status(500).json({ error: err.message || 'OpenAI error' })
  }
})

// Specific /summarize example
router.post('/summarize', async (req, res) => {
  const { prompt } = req.body
  try {
    const r = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a concise summarizer.' },
        { role: 'user', content: `Summarize the following text in 4 sentences: ${prompt}` }
      ],
      max_tokens: 300
    })
    res.json({ result: r.choices[0].message.content })
  } catch (err) {
    console.error('summarize error', err)
    res.status(500).json({ error: err.message || 'OpenAI error' })
  }
})

// Bulk mapping for the rest of features
const mapping = [
  'translate','paraphrase','grammar','rewrite-tone','qa','codegen','explain-code','fix-bug','unit-tests','sql-gen','data-clean','excel-formula','image-gen','image-edit','text-to-speech','speech-to-text','summarize-audio','meeting-notes','conversation-insights','sentiment','entity-extraction','keyword-extract','email-draft','cover-letter','resume-review','job-descriptions','idea-brainstorm','marketing-copy','seo-optimizer','product-namer','ux-review','a-b-test','legal-summarize','privacy-review','cyber-ops','design-system','tone-analyzer','persona-gen','roadmap-gen','feature-prioritize','bug-report','changelog','scheduler','summary-action','visualize-data','regex-gen','explain-ml','prompt-engineer','persona-chat','story-gen','poetry','lesson-plan','flashcards','math-solver','chem-helper','medical-info','fitness-plan','meal-plan','budgeting','tax-tips','trivia','quiz-maker','game-idea','music-lyrics','chord-prog','photo-caption','resume-tailor','interview-prep','cold-email','sales-pitch','invest-summary','risk-assess','compliance-check','translation-multiple','voice-persona'
]

mapping.forEach((id) => {
  router.post(`/${id}`, async (req, res) => {
    const prompt = req.body.prompt || ''
    try {
      const r = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are performing the feature: ${id}` },
          { role: 'user', content: prompt }
        ],
        max_tokens: 600
      })
      res.json({ result: r.choices[0].message.content })
    } catch (err) {
      console.error('feature', id, err)
      res.status(500).json({ error: err.message || 'OpenAI error' })
    }
  })
})

export default router
