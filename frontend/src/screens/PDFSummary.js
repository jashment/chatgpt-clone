import React, { useState } from 'react'
import './style/style.css'

const Home = () => {
  const [input, setInput] = useState()
  const [error, setError] = useState()
  const [result, setResult] = useState()
  const [prompt, setPrompt] = useState()
  const [jresult, setJResult] = useState()
  const [maxWords, setMaxWords] = useState(100)
  const [selectedFile, setSelectedFile] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = () => {

  }

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
      const response = await fetch('http://localhost:5001/api/chatgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS"
        },
        body: JSON.stringify({ text: input })
      })
      console.log(response)
      if (response.ok) {
        const data = await response.json()
        console.log(data)
        setPrompt(input)
        setResult(data.data.choices[0].text.replace(/.*:/, ""))
        setJResult(JSON.stringify(data.data, null, 2))
        setInput('')
        setError('')
      } else {
        throw new Error('An error occured.')
      }
    } catch (error) {
      console.log(error)
      setResult('')
      setError('An error occured while submitting the form.')
    }
  }


  return (
    <div className='container'>
      <div className='hero d-flex align-items-center justify-content-center text-center flex-column p-3'>
        <h1 className='display-4'>PDF Book Summarizer</h1>
        <p className='lead'>Summarize PDF Books for Efficient Reading!</p>
        <form className='w-100'>
          <input
            type='file'
            accept='.pdf'
            onChange={handleFileChange}
          ></input>
          <div className='form-group row'>
            <div className='col-sm-4 offset-sm-4 mt-3'>
              <input
                type='number'
                min='10'
                value={maxWords}
                onChange={(e) => setMaxWords(e.target.value)}
                className='form-control'
              ></input>
            </div>
            <button
              type='submit'
              disabled={!selectedFile || isLoading}
              className='btn btn-primary custom-button mt-1'
            >
              {isLoading ? 'Analysing PDF...' : `Summarize PDF in about ${maxWords} words.`}
            </button>
          </div>
        </form>
      </div>
      {error && <div className='alert alert-danger mt-3'>{error}</div>}
      {result && <div className='alert alert-success mt-3'>{result}</div>}
      {result && (<pre className='alert alert-success mt-3'><code>{jresult}</code></pre>)}
    </div>
  )
}

export default Home