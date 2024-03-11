import React, { useState } from 'react'
import './style/style.css'

const Similarity = () => {
  const [input, setInput] = useState()
  const [input2, setInput2] = useState()
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
      const response = await fetch('http://localhost:5001/api/similarity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS"
        },
        body: JSON.stringify({ text: input, text2: input2, })
      })
      console.log(response)
      if (response.ok) {
        const data = await response.json()
        console.log(data)
        setPrompt(input)
        setResult(1)
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
      <form className='form-horizontal' onSubmit={handleSubmit}>
        <div className='row form-group mt-2'>
          <div className='col-sm-5'>
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
          <div className='col-sm-5'>
            <div className='form-floating'>
              <textarea
                className='form-control custom-input'
                id='floatingInput'
                placeholder='Enter a prompt'
                value={input2}
                onChange={e => setInput2(e.target.value)}
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

export default Similarity