import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Completion from './screens/Completion'
import Stream from './screens/Stream'
import "./styles/custom.scss"
import PDFSummary from './screens/PDFSummary'
import Chat from './screens/Chat'
import ChatFunction from './screens/ChatFunction'
import Chatbot from './screens/Chatbot/Chatbot'
import Nav from './screens/Nav'

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Nav />} />
          <Route path='/completion' element={<Completion />} />
          <Route path='/stream' element={<Stream />} />
          <Route path='/pdf-summary' element={<PDFSummary />} />
          <Route path='/chat' element={<Chat />} />
          <Route path='/chat-function' element={<ChatFunction />} />
          <Route path='/chatbot' element={<Chatbot />} />
        </Routes>
      </Router>
    </>
  )
}

export default App