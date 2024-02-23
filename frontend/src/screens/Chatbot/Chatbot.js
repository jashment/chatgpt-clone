import React, { useState, useEffect } from 'react'
import '../style/style.css'
import axios from 'axios'

const Chatbot = () => {
  const [input, setInput] = useState()
  const [error, setError] = useState()
  const [result, setResult] = useState()
  const [prompt, setPrompt] = useState()
  const [jresult, setJResult] = useState()
  const [selectedOption, setSelectedOption] = useState()
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are an assistant' }
  ])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() !== '') {
      try {
        const updatedMessages = [...messages, { role: 'user', content: input }]
        setMessages(updatedMessages)
        const response = await axios({
          method: 'POST',
          url: 'http://localhost:5001/api/chatbot',
          data: {
            messages: updatedMessages
          }
        })
        const serverResponse = response.data
        const updatedMessages2 = [...updatedMessages, { role: 'assistant', content: serverResponse.data.choices[0].message.content }]
        setMessages(updatedMessages2)
        console.log(updatedMessages2)
        setInput('')
        setJResult(JSON.stringify(updatedMessages2, null, 2))
      } catch (error) {
        console.error('An error occurred', error)
        setError('An error occurred.')
      }
    }
  }

  useEffect(() => {
    const chatContainer = document.getElementById('chatContainer')
    const scrollOptions = {
      top: chatContainer.scrollHeight,
      behavior: 'smooth'
    }
    chatContainer.scrollTo(scrollOptions)
  }, [messages])

  return (
    <div>
      <div className='d-flex flex-column chat-page'>
        <div id='personalities' className='text-center'>
          <h3>{selectedOption ? 'You are chatting with:' : 'Please Select a Character'}</h3>
          <div></div>
        </div>
        <div id='chatContainer' className='flex-fill overflow-auto'>
          {messages.map((message, index) => {
            return message.role !== 'system' && (
              <div key={index} className={`${message.role === 'user' ? 'alert alert-info' : 'alert alert-success'}`}>
                {message.content}
              </div>
            )
          })}
          {error && <div className='alert alert-danger mt-3'>{error}</div>}
          {prompt && <div className='alert alert-secondary mt-3'>{prompt}</div>}
          {result && <div className='alert alert-success mt-3'>{result}</div>}
        </div>
        <form className='form-horizontal mb-3 container-fluid' onSubmit={handleSubmit}>
        <div className='row form-group mt-2'>
          <div className='col-sm-11'>
            <div className='form-floating'>
              <input
                className='form-control custom-input'
                id='floatingInput'
                placeholder='Enter a prompt'
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <label htmlFor='floatingInput'>Input</label>
            </div>
          </div>
          <div className='col-sm-1'>
            <button type='submit' className='btn btn-primary custom-button'>Submit</button>
          </div>
        </div>
      </form>
      </div>
      {jresult && (<pre className='alert alert-success mt-3'><code>{jresult}</code></pre>)}
    </div>
  )
}

export default Chatbot