import React, { useState } from 'react'
import './style/style.css'
import axios from 'axios'

const Home = () => {
  const [input, setInput] = useState()
  const [error, setError] = useState()
  const [result, setResult] = useState()
  const [jresult, setJResult] = useState()
  const [maxWords, setMaxWords] = useState(100)
  const [selectedFile, setSelectedFile] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setSelectedFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    if (!maxWords) {
      setError('Please enter a number of words.')
      setResult('')
      setJResult('')
      return
    }

    try {
      const formData = new FormData()
      formData.append('pdf', selectedFile)
      formData.append('maxWords', maxWords)

      const response = await axios({
        url: 'http://localhost:5001/api/pdf-summary',
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      console.log(response.data)
      if (response.data.error) {
        setError(response.data.error)
        return
      }
      setResult(response.data.summarizedText)
      setJResult(JSON.stringify(response.data, null, 2))
    } catch (error) {
      console.log(error)
      setResult('')
      setError('An error occured while submitting the form.')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className='container'>
      <div className='hero d-flex align-items-center justify-content-center text-center flex-column p-3'>
        <h1 className='display-4'>PDF Book Summarizer</h1>
        <p className='lead'>Summarize PDF Books for Efficient Reading!</p>
        <form className='w-100' onSubmit={handleSubmit}>
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
      {jresult && (<pre className='alert alert-success mt-3'><code>{jresult}</code></pre>)}
    </div>
  )
}

export default Home