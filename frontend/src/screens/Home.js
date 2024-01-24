import React, { useState } from 'react'

const Home = () => {
  const [input, setInput] = useState()
  const [error, setError] = useState()
  const [result, setResult] = useState()
  const [prompt, setPrompt] = useState()
  const [jresult, setJResult] = useState()

  const handleSubmit = async (e) => {

  }


  return (
    <div className='container'>
      <form className='form-horizontal' onSubmit={handleSubmit}>

      </form>
      {error && <div className='alert alert-danger mt-3'>{error}</div>}
      {prompt && <div className='alert alert-secondary mt-3'>{prompt}</div>}
      {result && <div className='alert alert-success mt-3'>{result}</div>}
      {result && (<pre className='alert alert-success mt-3'><code>{jresult}</code></pre>)}
    </div>
  )
}

export default Home