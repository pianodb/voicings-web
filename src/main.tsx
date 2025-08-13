import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { VoicingDetail } from './components/VoicingDetail.tsx'
import { VoicingDetailDigest } from './components/VoicingDetailDigest.tsx'
import { PitchClassDatabase } from './components/ChordBrowser.tsx'
import { VoicingsByPcid } from './components/VoicingBrowser.tsx'
import { About } from './components/About.tsx'
import { Contact } from './components/Contact.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PitchClassDatabase />} />
        <Route path="/pitch-classes" element={<PitchClassDatabase />} />
        <Route path="/voicings/:pcid" element={<VoicingsByPcid />} />
        <Route path="/voicing/:pcid/:digest" element={<VoicingDetailDigest />} />
        <Route path="/voicing/:dataset/:id" element={<VoicingDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
