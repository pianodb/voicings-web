import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { VoicingNotation } from './VoicingNotation'
import { getNotesFromDigest } from '../utils/pitchClass'

interface VoicingData {
  voicing_id: number
  frequency: number
  duration: number
  digest: string
}

export function VoicingDetail() {
  const { dataset, id } = useParams<{ dataset: string; id: string }>()
  const navigate = useNavigate()
  const [voicing, setVoicing] = useState<VoicingData | null>(null)
  const [allVoicings, setAllVoicings] = useState<VoicingData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!dataset || !id) return

      setLoading(true)
      try {
        const response = await axios.get(`/api/${dataset}.csv`)
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
        const foundVoicing = data.find(v => v.voicing_id === parseInt(id))
        setVoicing(foundVoicing || null)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dataset, id])

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
          <p>Could not find voicing with ID {id} in dataset {dataset}</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Back to Database
          </button>
        </div>
      </div>
    )
  }

  const totalFrequency = allVoicings.reduce((sum, v) => sum + v.frequency, 0)
  const totalDuration = allVoicings.reduce((sum, v) => sum + v.duration, 0)
  const frequencyPercent = ((voicing.frequency / totalFrequency) * 100).toFixed(3)
  const durationPercent = ((voicing.duration / totalDuration) * 100).toFixed(3)

  // Analyze the voicing from digest
  const noteInfo = getNotesFromDigest(voicing.digest)

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">🎵</div>
            <h1>PianoDB Voicings</h1>
          </div>
          <nav className="nav">
            <span className="nav-item" onClick={() => navigate('/')}>Chords</span>
            <span className="nav-item active">Voicings</span>            
            <span className="nav-item" onClick={() => navigate('/about')}>About</span>
            <span className="nav-item" onClick={() => navigate('/contact')}>Contact</span>
          </nav>
        </div>
      </header>

      <div className="main-content">
        <div className="detail-container">
          <div className="detail-header">
            <button onClick={() => navigate('/')} className="back-link">
              ← Back to database
            </button>
            <h1>Voicing: {voicing.voicing_id}</h1>
          </div>

          <div className="detail-sidebar">
            <nav className="detail-nav">
              <div className="nav-item active">Overview</div>
            </nav>
          </div>

          <div className="detail-content">
            <h2>Overview</h2>
            
            <div className="overview-grid">
              <div className="overview-section">
                <div className="overview-row">
                  <span className="label">ID</span>
                  <span className="value">{voicing.voicing_id}</span>
                  <span className="label">Frequency</span>
                  <span className="value">{voicing.frequency.toLocaleString()}</span>
                </div>

                <div className="overview-row">
                  <span className="label">Dataset</span>
                  <span className="value">Dataset {dataset}</span>
                  <span className="label">Duration</span>
                  <span className="value">{voicing.duration.toLocaleString()}</span>
                </div>

                <div className="overview-row">
                  <span className="label">Digest</span>
                  <span className="value digest-value">{voicing.digest}</span>
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

              <div className="sequences-section">
                <div className="sequence-row">
                  <span className="sequence-label">Voicing Sequence</span>
                  <span className="sequence-value">{voicing.digest}</span>
                </div>

                <div className="sequence-row">
                  <span className="sequence-label">Full Context</span>
                  <span className="sequence-value">
                    Dataset {dataset} - Voicing {voicing.voicing_id} - Frequency: {voicing.frequency.toLocaleString()} - Duration: {voicing.duration.toLocaleString()}
                  </span>
                </div>

                <div className="stats-row">
                  <span className="stats-label">Statistics</span>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">Rank by frequency</span>
                      <span className="stat-value">
                        {allVoicings
                          .sort((a, b) => b.frequency - a.frequency)
                          .findIndex(v => v.voicing_id === voicing.voicing_id) + 1}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Rank by duration</span>
                      <span className="stat-value">
                        {allVoicings
                          .sort((a, b) => b.duration - a.duration)
                          .findIndex(v => v.voicing_id === voicing.voicing_id) + 1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="musical-analysis">
              <h2>Musical Analysis</h2>
              
              <div className="analysis-grid">
                <div className="notation-section">
                  <h3>Sheet Music</h3>
                  <VoicingNotation 
                    notes={noteInfo.notes} 
                  />
                </div>

                <div className="voicing-info">
                  <h3>Voicing Details</h3>
                  <div className="voicing-stats">
                    <div className="stat-row">
                      <span className="stat-label">Note Count:</span>
                      <span className="stat-value">{noteInfo.notes.length}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Span:</span>
                      <span className="stat-value">{noteInfo.span}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Lowest Note:</span>
                      <span className="stat-value">{noteInfo.noteNames[0]}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Highest Note:</span>
                      <span className="stat-value">{noteInfo.noteNames[noteInfo.noteNames.length - 1]}</span>
                    </div>
                  </div>

                  <div className="note-list">
                    <h4>Notes in Voicing:</h4>
                    <div className="notes-grid">
                      {noteInfo.noteNames.map((noteName, index) => (
                        <span key={index} className="note-badge">
                          {noteName}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pitch-classes">
                    <h4>Pitch Classes:</h4>
                    <div className="pitch-classes-grid">
                      {noteInfo.pitchClasses.map((pc, index) => (
                        <span key={index} className="pitch-class-badge">
                          {pc}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
