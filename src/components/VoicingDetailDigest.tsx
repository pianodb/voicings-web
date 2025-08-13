import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { analyzeVoicing, getNotesFromDigest } from '../utils/pitchClass'

interface VoicingData {
  voicing_id: number
  frequency: number
  duration: number
  digest: string
}

export function VoicingDetailDigest() {
  const { pcid, digest } = useParams<{ pcid: string; digest: string }>()
  const navigate = useNavigate()
  const [voicing, setVoicing] = useState<VoicingData | null>(null)
  const [allVoicings, setAllVoicings] = useState<VoicingData[]>([])
  const [loading, setLoading] = useState(true)
  const [voicingAnalysis, setVoicingAnalysis] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!pcid || !digest) return

      setLoading(true)
      try {
        const decodedDigest = decodeURIComponent(digest)
        const response = await axios.get(`/api/${pcid}.csv`)
        const lines = response.data.split('\n')
        
        const data: VoicingData[] = lines.slice(1)
          .filter((line: string) => line.trim())
          .map((line: string) => {
            const values = line.split(',')
            return {
              voicing_id: parseInt(values[0]),
              frequency: parseInt(values[1]),
              duration: parseFloat(values[2]),
              digest: values[3]
            }
          })
        
        setAllVoicings(data)
        const foundVoicing = data.find(v => v.digest === decodedDigest)
        setVoicing(foundVoicing || null)

        // Analyze the voicing
        if (foundVoicing) {
          try {
            const analysis = analyzeVoicing(decodedDigest)
            const noteInfo = getNotesFromDigest(decodedDigest)
            setVoicingAnalysis({ ...analysis, ...noteInfo })
          } catch (error) {
            console.error('Error analyzing voicing:', error)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [pcid, digest])

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (!voicing) {
    return (
      <div className="app">
        <div className="error-message">
          <h2>Voicing not found</h2>
          <p>Could not find voicing with digest {digest} in PCID {pcid}</p>
          <button onClick={() => navigate(`/voicings/${pcid}`)} className="back-btn">
            Back to Voicings
          </button>
        </div>
      </div>
    )
  }

  const totalFrequency = allVoicings.reduce((sum, v) => sum + v.frequency, 0)
  const totalDuration = allVoicings.reduce((sum, v) => sum + v.duration, 0)
  const frequencyPercent = ((voicing.frequency / totalFrequency) * 100).toFixed(3)
  const durationPercent = ((voicing.duration / totalDuration) * 100).toFixed(3)

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">🎵</div>
            <h1>PianoDB Voicings</h1>
          </div>
          <nav className="nav">
            <span className="nav-item" onClick={() => navigate('/pitch-classes')}>Chords</span>
            <span className="nav-item active">Voicing Detail</span>
            <span className="nav-item" onClick={() => navigate('/about')}>About</span>
            <span className="nav-item" onClick={() => navigate('/contact')}>Contact</span>
          </nav>
        </div>
      </header>

      <div className="main-content">
        <div className="detail-container">
          <div className="detail-header">
            <button onClick={() => navigate(`/voicings/${pcid}`)} className="back-link">
              ← Back to voicings
            </button>
            <h1>Voicing: {voicing.digest}</h1>
          </div>

          <div className="detail-sidebar">
            <nav className="detail-nav">
              <div className="nav-item active">Overview</div>
              <div className="nav-item">Note Analysis</div>
            </nav>
          </div>

          <div className="detail-content">
            <h2>Overview</h2>
            
            <div className="overview-grid">
              <div className="overview-section">
                <div className="overview-row">
                  <span className="label">Digest</span>
                  <span className="value digest-value">{voicing.digest}</span>
                  <span className="label">Frequency</span>
                  <span className="value">{voicing.frequency.toLocaleString()}</span>
                </div>

                <div className="overview-row">
                  <span className="label">PCID</span>
                  <span className="value">{pcid}</span>
                  <span className="label">Duration</span>
                  <span className="value">{voicing.duration.toLocaleString()}</span>
                </div>

                <div className="overview-row">
                  <span className="label">Voicing ID</span>
                  <span className="value">{voicing.voicing_id}</span>
                  <span className="label">Frequency Share</span>
                  <span className="value">{frequencyPercent}%</span>
                </div>

                <div className="overview-row">
                  <span className="label"></span>
                  <span className="value"></span>
                  <span className="label">Duration Share</span>
                  <span className="value">{durationPercent}%</span>
                </div>
              </div>

              {/* {voicingAnalysis && (
                <div className="analysis-section">
                  <h3>Note Analysis</h3>
                  
                  <div className="note-info-grid">
                    <div className="info-item">
                      <span className="info-label">Notes</span>
                      <span className="info-value note-sequence">{voicingAnalysis.noteNames.join(' ')}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="info-label">Note Count</span>
                      <span className="info-value">{voicingAnalysis.noteCount}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="info-label">Span</span>
                      <span className="info-value">{voicingAnalysis.span}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="info-label">Pitch Classes</span>
                      <span className="info-value">{voicingAnalysis.pitchClasses.join(' ')}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="info-label">Lowest Note</span>
                      <span className="info-value">{voicingAnalysis.noteNames[0]}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="info-label">Highest Note</span>
                      <span className="info-value">{voicingAnalysis.noteNames[voicingAnalysis.noteNames.length - 1]}</span>
                    </div>
                  </div>

                  <div className="intervals-section">
                    <h4>Intervals</h4>
                    <div className="intervals-grid">
                      {voicingAnalysis.intervalNames.map((intervalName: string, index: number) => (
                        <div key={index} className="interval-item">
                          <span className="interval-name">{intervalName}</span>
                          <span className="interval-semitones">({voicingAnalysis.intervals[index]} st)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="notation-section">
                    <h4>Musical Information</h4>
                    <div className="voicing-notation">
                      <div className="notation-info">
                        <p><strong>Voicing:</strong> {voicingAnalysis.noteNames.join(' - ')}</p>
                        <p><strong>MIDI Notes:</strong> {voicingAnalysis.notes.join(', ')}</p>
                        <p><strong>Note Intervals:</strong> {voicingAnalysis.intervalNames.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
