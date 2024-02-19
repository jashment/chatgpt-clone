import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './screens/Home'
import Stream from './screens/Stream'
import "./styles/custom.scss"
import PDFSummary from './screens/PDFSummary'
import Chat from './screens/Chat'
import ChatFunction from './screens/Chat'

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/stream' element={<Stream />} />
          <Route path='/pdf-summary' element={<PDFSummary />} />
          <Route path='/chat' element={<Chat />} />
          <Route path='/chat-function' element={<ChatFunction />} />
        </Routes>
      </Router>
    </>
  )
}

export default App