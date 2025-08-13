import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { VoicingDetail } from './components/VoicingDetail.tsx'
import { PitchClassDatabase } from './components/PitchClassDatabase.tsx'
import { VoicingsByPcid } from './components/VoicingsByPcid.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PitchClassDatabase />} />
        <Route path="/pitch-classes" element={<PitchClassDatabase />} />
        <Route path="/voicings/:pcid" element={<VoicingsByPcid />} />
        <Route path="/voicing/:dataset/:id" element={<VoicingDetail />} />
        <Route path="/legacy" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
