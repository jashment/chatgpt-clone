import React, { useState } from 'react'
import './style/style.css'

const Stream = () => {
  const [input, setInput] = useState()
  const [error, setError] = useState()
  const [result, setResult] = useState()
  const [prompt, setPrompt] = useState()
  const [jresult, setJResult] = useState()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input) {
      setError('Please enter a value.')
      setPrompt('')
      setResult('')
      setJResult('')
      return
    }

    try {
      const controller = new AbortController()
      const signal = controller.signal

      const response = await fetch('http://localhost:5001/api/chatgpt-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS"
        },
        body: JSON.stringify({ text: input }),
        signal: signal
      })

      if (response.ok) {
        const reader = response.body.getReader()
        let resultData = ''
        let jResultData = []
        setPrompt(input)
        setResult(resultData)
        setInput('')
        setError('')

        let readerDone = false
        while (!readerDone) {
          const { value, done } = await reader.read()

          if (done) {
            console.log(resultData)
            readerDone = true
          } else {
            // const allChunks = []
            let chunk = new TextDecoder('utf-8').decode(value)
            chunk = chunk
              .replaceAll('{"event": "done"}', '')
              .replaceAll('data: [DONE]', '')
              .replaceAll('data: ', '')
              .replaceAll(/\r|\n/g, '')
              .replaceAll('}{', '},{')

            chunk = `[${chunk}]`
            chunk = JSON.parse(chunk)

            let text = ''
            for (let i = 0; i < chunk.length; i++) {
              const choices = chunk[i].choices

              if (choices && choices.length > 0) {
                text += choices[0].text
              }
            }
            resultData += text
            setResult((prevRes) => prevRes + text)

            jResultData.push(chunk)
            setJResult(JSON.stringify(jResultData, null, 2))
          }
        }

      } else {
        throw new Error('An error occured.')
      }
    } catch (error) {
      setResult('')
      setError('An error occured while submitting the form.')
    }
  }


  return (
    <div className='container'>
      <form className='form-horizontal' onSubmit={handleSubmit}>
        <div className='row form-group mt-2'>
          <div className='col-sm-10'>
            <div className='form-floating'>
              <textarea
                className='form-control custom-input'
                id='floatingInput'
                placeholder='Enter a prompt'
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <label htmlFor='floatingInput'>Input</label>
            </div>
          </div>
          <div className='col-sm-2'>
            <button type='submit' className='btn btn-primary custom-button'>Submit</button>
          </div>
        </div>
      </form>
      {error && <div className='alert alert-danger mt-3'>{error}</div>}
      {prompt && <div className='alert alert-secondary mt-3'>{prompt}</div>}
      {result && <div className='alert alert-success mt-3'>{result}</div>}
      {result && (<pre className='alert alert-success mt-3'><code>{jresult}</code></pre>)}
    </div>
  )
}

export default Stream