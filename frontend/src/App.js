import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Completion from './screens/Completion'
import Stream from './screens/Stream'
import "./styles/custom.scss"
import PDFSummary from './screens/PDFSummary'
import Chat from './screens/Chat'
import ChatFunction from './screens/ChatFunction'
import Chatbot from './screens/Chatbot/Chatbot'
import Nav from './screens/Nav'
import Similarity from './screens/Similarity'

const App = () => {
  return (
    <div className='App'>
      <Router>
        <Nav />
        <Routes>
          <Route path='/completion' element={<Completion />} />
          <Route path='/stream' element={<Stream />} />
          <Route path='/pdf-summary' element={<PDFSummary />} />
          <Route path='/chat' element={<Chat />} />
          <Route path='/chat-function' element={<ChatFunction />} />
          <Route path='/chatbot' element={<Chatbot />} />
          <Route path='/similarity' element={<Similarity />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App