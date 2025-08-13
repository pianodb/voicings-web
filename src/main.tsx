import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { VoicingDetail } from './components/VoicingDetail.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/voicing/:dataset/:id" element={<VoicingDetail />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
