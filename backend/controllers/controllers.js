const {
  calculateTokens,
  completionConfig,
  completionEmitter,
  openApiError,
  runCompletion,
  splitTextIntoChunks,
  startCompletionStream,
  summarizeChunk,
  summarizeChunks
} = require('../utils')
const { PDFExtract } = require('pdf.js-extract')

const completionStream = async (req, res) => {
  try {
    const { text } = req.body
    startCompletionStream(text, completionConfig)

    const dataListener = (data) => {
      res.write(data)
    }

    const doneListener = () => {
      res.write('{"event": "done"}')
      res.end()
      completionEmitter.off('data', dataListener)
      completionEmitter.off('Done', doneListener)
    }

    completionEmitter.on('data', dataListener)
    completionEmitter.on('Done', doneListener)

  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data)
      res.status(error.response.status).json(error.response.data)
    } else {
      openApiError(res, error)
    }
  }
}

const chatCompletion = async (req, res) => {
  try {
    const { text } = req.body
    const completion = await runCompletion(text, completionConfig)
    res.json({ data: completion.data })
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data)
      res.status(error.response.status).json(error.response.data)
    } else {
      openApiError(res, error)
    }
  }
}

const summarizePdf = async (req, res) => {

  try {
    const { maxWords } = req.body
    const pdfFile = req.file

    const pdfExtract = new PDFExtract()

    const extractOptions = {
      firstPage: 1,
      lastPage: undefined,
      password: '',
      verbosity: -1,
      normalizeWhitespace: false,
      disableCombinedTextItems: false
    }
    const data = await pdfExtract.extract(pdfFile.path, extractOptions)

    const pdfText = data.pages.map((page) => page.content.map((item) => item.str).join(' ')).join(' ')

    if (pdfText.length === 0) return res.json({ error: 'Text could not be extracted.' })

    let summarizedText = pdfText
    const maxToken = 1000
    while(calculateTokens(summarizedText) > maxToken) {
      const newChunks = splitTextIntoChunks(summarizedText, maxToken)
      summarizedText = await summarizeChunks(newChunks)
    }
    summarizedText = await summarizeChunk(summarizedText, maxWords, completionConfig)
    res.json({ summarizedText })
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data)
      res.status(error.response.status).json(error.response.data)
    } else {
      openApiError(res, error)
    }
  }
}

module.exports = {
  completionStream,
  chatCompletion,
  summarizePdf
}