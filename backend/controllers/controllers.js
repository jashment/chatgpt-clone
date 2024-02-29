const {
  completionConfig,
  completionEmitter,
  startCompletionStream
} = require('../utils')

const completionStreamController = async (req, res) => {
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

module.exports = {
  completionStreamController
}