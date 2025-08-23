import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getNotesFromDigest, type NoteInfo } from '../utils/pitchClass'
import { playVoicing, playArpeggio } from '../utils/audioSynthesis'
import { VoicingNotation } from './VoicingNotation'
import { Header } from './Header'
import { getApiUrl } from '../config/api'

interface VoicingData {
  frequency: number
  duration: number
  digest: string
}


export function VoicingDetail() {
  const { pcid, digest } = useParams<{ pcid: string; digest: string }>()
  const navigate = useNavigate()
  const [voicing, setVoicing] = useState<VoicingData | null>(null)
  const [allVoicings, setAllVoicings] = useState<VoicingData[]>([])
  const [loading, setLoading] = useState(true)
  const [voicingAnalysis, setVoicingAnalysis] = useState<NoteInfo | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [synthLoading, setSynthLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!pcid || !digest) return

      setLoading(true)
      try {
        const decodedDigest = decodeURIComponent(digest)
        const response = await axios.get(getApiUrl(`${pcid}.csv`))
        const lines = response.data.split('\n')
        
        const data: VoicingData[] = lines.slice(1)
          .filter((line: string) => line.trim())
          .map((line: string) => {
            const values = line.split(',')
            return {
              frequency: parseInt(values[0]),
              duration: parseFloat(values[1]),
              digest: values[2]
            }
          })
        
        setAllVoicings(data)
        const foundVoicing = data.find(v => v.digest === decodedDigest)
        setVoicing(foundVoicing || null)

        // Analyze the voicing
        if (foundVoicing) {
          try {
            const noteInfo = getNotesFromDigest(decodedDigest)
            setVoicingAnalysis({ ...noteInfo })
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

  // Handle chord synthesis
  const handlePlayChord = async () => {
    if (!voicingAnalysis || isPlaying || synthLoading) return
    
    try {
      setSynthLoading(true)
      setIsPlaying(true)
      // Convert notes to MIDI (add 48 to shift to a reasonable octave range)
      const midiNotes = voicingAnalysis.notes.map(note => note + 48)
      await playVoicing(midiNotes, 2.5)
    } catch (error) {
      console.error('Error playing chord:', error)
    } finally {
      setSynthLoading(false)
      setTimeout(() => setIsPlaying(false), 2500)
    }
  }

  const handlePlayArpeggio = async () => {
    if (!voicingAnalysis || isPlaying || synthLoading) return
    
    try {
      setSynthLoading(true)
      setIsPlaying(true)
      // Convert notes to MIDI (add 48 to shift to a reasonable octave range)
      const midiNotes = voicingAnalysis.notes.map(note => note + 48)
      // Calculate total duration: note delay * number of notes + last note duration
      const totalDuration = (0.25 * midiNotes.length + 1.2) * 1000
      
      await playArpeggio(midiNotes, 0.25)
      setSynthLoading(false)
      setTimeout(() => setIsPlaying(false), totalDuration)
    } catch (error) {
      console.error('Error playing arpeggio:', error)
      setSynthLoading(false)
      setIsPlaying(false)
    }
  }

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

  // Calculate rank for frequency and duration
  const frequencyRank = allVoicings
    .sort((a, b) => b.frequency - a.frequency)
    .findIndex(v => v.digest === voicing.digest) + 1;

  const durationRank = allVoicings
    .sort((a, b) => b.duration - a.duration)
    .findIndex(v => v.digest === voicing.digest) + 1;

  // Get pitch class set
  const pitchClassSet = voicingAnalysis?.pitchClasses;

  return (
    <div className="app">
      <Header 
        activeItem="Voicing Detail" 
        customVoicingsClick={() => navigate(`/voicings/${pcid}`)}
      />

      <div className="main-content">
        <div className="detail-container">
          <div className="detail-header">
            <button onClick={() => navigate(`/voicings/${pcid}`)} className="back-link">
              ← Back to Voicings for {pcid}
            </button>
            <h1>Voicing: {voicing.digest}</h1>
          </div>

          <div className="detail-sidebar">
            <nav className="detail-nav">
              <div className="nav-item active">Overview</div>
              <div className="nav-item disabled">Note Analysis</div>
            </nav>
          </div>

          <div className="detail-content">
            <h2>Overview</h2>


            <div className="overview-grid">
              <div className="overview-section">
                <div className='overview-row'>
                  <span className="label">Notes</span>
                  <span className="value">
                    <VoicingNotation 
                      notes={voicingAnalysis?.notes.map(n => n + 48)} 
                    />
                  </span>
                </div>
                <div className="overview-row">
                  <span className="label">Digest</span>
                  <span className="value digest-value">{voicing.digest}</span>
                  <span className="label">PCID</span>
                  <span className="value">{pcid}</span>
                </div>

                <div className="overview-row">
                  <span className="label">Frequency</span>
                  <span className="value">{voicing.frequency.toLocaleString()}</span>
                  <span className="label">Duration</span>
                  <span className="value">{voicing.duration.toLocaleString()}</span>
                </div>

                <div className="overview-row">
                  <span className="label">Frequency Share</span>
                  <span className="value">{frequencyPercent}%</span>
                  <span className="label">Duration Share</span>
                  <span className="value">{durationPercent}%</span>
                </div>


                <div className="overview-row">
                  <span className="label">Frequency Rank</span>
                  <span className="value">#{frequencyRank}</span>
                  <span className="label">Duration Rank</span>
                  <span className="value">#{durationRank}</span>
                </div>

                <div className="overview-row">
                  <span className="label">Pitch Class Set</span>
                  <span className="value">{`{${pitchClassSet?.join(', ')}}`}</span>
                </div>
              </div>

              <div className="audio-controls">
                <h3>Audio Synthesis</h3>
                <div className="audio-buttons">
                  <button 
                    onClick={handlePlayChord}
                    disabled={isPlaying || synthLoading || !voicingAnalysis}
                    className="play-button chord-button"
                  >
                    {synthLoading ? '⏳ Loading...' : isPlaying ? '♪ Playing...' : '▶ Play Chord'}
                  </button>
                  <button 
                    onClick={handlePlayArpeggio}
                    disabled={isPlaying || synthLoading || !voicingAnalysis}
                    className="play-button arpeggio-button"
                  >
                    {synthLoading ? '⏳ Loading...' : isPlaying ? '♪ Playing...' : '🎵 Play Arpeggio'}
                  </button>
                </div>
                {voicingAnalysis && (
                  <div className="note-info">
                    <strong>Notes:</strong> {voicingAnalysis.noteNames.join(' - ')}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
