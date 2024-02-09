import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './screens/Home'
import Stream from './screens/Stream'
import "./styles/custom.scss"
import PDFSummary from './screens/PDFSummary'

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/stream' element={<Stream />} />
          <Route path='/pdf-summary' element={<PDFSummary />} />
        </Routes>
      </Router>
    </>
  )
}

export default App