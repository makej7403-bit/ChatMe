import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from 'body-parser'
import aiRoutes from './routes/ai.js'

dotenv.config()
const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: '10mb' }))

app.use('/api/ai', aiRoutes)

const PORT = process.env.PORT || 8877
app.listen(PORT, () => console.log(`ChatMe backend listening on ${PORT}`))
