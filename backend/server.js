import express from 'express'
import dotenv from 'dotenv'
import { Configuration, OpenAIApi } from 'openai'

const app = express()

app.use(express.json())

dotenv.config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

const runCompletion = async (prompt) => {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: prompt,
    max_tokens: 50
  })
  return response
}