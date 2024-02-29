const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const openAiApiRouter = require('./routes/routes')

const app = express()

app.use(express.json())

dotenv.config()
app.use(cors())

app.use('/api', openAiApiRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server Started at ${PORT}`))