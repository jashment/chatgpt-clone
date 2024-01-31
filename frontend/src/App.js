import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './screens/Home'
import Stream from './screens/Stream'
import "./styles/custom.scss"

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/stream' element={<Stream />} />
        </Routes>
      </Router>
    </>
  )
}

export default App