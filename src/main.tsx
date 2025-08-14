import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { VoicingDetail } from './components/VoicingDetail.tsx'
import { PitchClassDatabase } from './components/ChordBrowser.tsx'
import { VoicingsByPcid } from './components/VoicingBrowser.tsx'
import { Search } from './components/Search.tsx'
import { About } from './components/About.tsx'
import { Contact } from './components/Contact.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PitchClassDatabase />} />
        <Route path="/chords" element={<PitchClassDatabase />} />
        <Route path="/voicings/:pcid" element={<VoicingsByPcid />} />
        <Route path="/voicings/:pcid/:digest" element={<VoicingDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
