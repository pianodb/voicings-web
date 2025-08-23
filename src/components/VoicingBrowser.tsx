import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getPresentPitches, getNotesFromDigest, calculateInversions } from '../utils/pitchClass'
import { playVoicing } from '../utils/audioSynthesis'
import { MusicNotation } from './MusicNotation'
import { Header } from './Header'
import { Footer } from './Footer'
import { BrowserFilter, type FilterState } from './BrowserFilter'
import axios from 'axios'
import { VoicingNotation } from './VoicingNotation'
import { getApiUrl } from '../config/api'

interface VoicingData {
  frequency: number
  duration: number
  digest: string
}

export function VoicingsByPcid() {
  const { pcid } = useParams<{ pcid: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [voicingData, setVoicingData] = useState<VoicingData[]>([])
  const [filteredData, setFilteredData] = useState<VoicingData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [isEditingPage, setIsEditingPage] = useState(false)
  const [editPageValue, setEditPageValue] = useState('')
  const [playingDigest, setPlayingDigest] = useState<string | null>(null)
  const [synthLoading, setSynthLoading] = useState(false)
  const [rank, setRank] = useState<number | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    minFrequencyShare: '',
    maxFrequencyShare: '',
    minDurationShare: '',
    maxDurationShare: '',
    pitchFilter: '',
    minPitches: '',
    maxPitches: '',
    nameFilter: '' // Will be used for digest filter
  })

  const itemsPerPage = 15
  const pcidNumber = pcid ? parseInt(pcid) : 0
  const pitches = getPresentPitches(pcidNumber)

  // Extract rank from query string and clean up URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const rankParam = searchParams.get('rank')
    
    if (rankParam) {
      setRank(parseInt(rankParam))
      // Clean up the URL by removing query string
      navigate(`/voicings/${pcid}`, { replace: true })
    }
  }, [location.search, pcid, navigate])

  useEffect(() => {
    const fetchData = async () => {
      if (!pcid) return

      setLoading(true)
      try {
        const response = await axios.get(getApiUrl(`${pcid}.csv`))
        const lines = response.data.split('\n')
        
        const data: VoicingData[] = lines.slice(1)
          .filter((line: string) => line.trim())
          .map((line: string) => {
            const values = line.split(',')
            return {
              // voicing_id: parseInt(values[0]),
              frequency: parseInt(values[0]),
              duration: parseFloat(values[1]),
              digest: values[2]
            }
          })
        
        setVoicingData(data)
        setFilteredData(data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [pcid])

  useEffect(() => {
    let filtered = voicingData

    // Calculate total frequency and duration for percentage calculations
    const totalFrequency = voicingData.reduce((sum, d) => sum + d.frequency, 0)
    const totalDuration = voicingData.reduce((sum, d) => sum + d.duration, 0)

    if (filters.minFrequencyShare) {
      filtered = filtered.filter(item => {
        const frequencyPercent = (item.frequency / totalFrequency) * 100
        return frequencyPercent >= parseFloat(filters.minFrequencyShare)
      })
    }
    if (filters.maxFrequencyShare) {
      filtered = filtered.filter(item => {
        const frequencyPercent = (item.frequency / totalFrequency) * 100
        return frequencyPercent <= parseFloat(filters.maxFrequencyShare)
      })
    }
    if (filters.minDurationShare) {
      filtered = filtered.filter(item => {
        const durationPercent = (item.duration / totalDuration) * 100
        return durationPercent >= parseFloat(filters.minDurationShare)
      })
    }
    if (filters.maxDurationShare) {
      filtered = filtered.filter(item => {
        const durationPercent = (item.duration / totalDuration) * 100
        return durationPercent <= parseFloat(filters.maxDurationShare)
      })
    }
    if (filters.nameFilter) {
      filtered = filtered.filter(item => 
        item.digest.toLowerCase().includes(filters.nameFilter.toLowerCase())
      )
    }
    if (filters.minPitches) {
      filtered = filtered.filter(item => {
        try {
          const parseDigest = getNotesFromDigest(item.digest)
          return parseDigest.notes.length >= parseInt(filters.minPitches)
        } catch (error) {
          return false
        }
      })
    }
    if (filters.maxPitches) {
      filtered = filtered.filter(item => {
        try {
          const parseDigest = getNotesFromDigest(item.digest)
          return parseDigest.notes.length <= parseInt(filters.maxPitches)
        } catch (error) {
          return false
        }
      })
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [filters, voicingData])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilters({
      minFrequencyShare: '',
      maxFrequencyShare: '',
      minDurationShare: '',
      maxDurationShare: '',
      pitchFilter: '',
      minPitches: '',
      maxPitches: '',
      nameFilter: ''
    })
  }

  const handlePlayVoicing = async (digest: string) => {
    if (playingDigest === digest || synthLoading) return // Already playing this voicing or loading
    
    try {
      setSynthLoading(true)
      setPlayingDigest(digest)
      const parseDigest = getNotesFromDigest(digest)
      // Convert notes to MIDI (add 48 to shift to a reasonable octave range)
      const midiNotes = parseDigest.notes.map(note => note + 48)
      await playVoicing(midiNotes, 2.0)
    } catch (error) {
      console.error('Error playing voicing:', error)
    } finally {
      setSynthLoading(false)
      setTimeout(() => setPlayingDigest(null), 2000)
    }
  }

  const handlePageClick = () => {
    setIsEditingPage(true)
    setEditPageValue(currentPage.toString())
  }

  const handlePageSubmit = () => {
    const pageNumber = parseInt(editPageValue)
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
    setIsEditingPage(false)
    setEditPageValue('')
  }

  const handlePageKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePageSubmit()
    } else if (e.key === 'Escape') {
      setIsEditingPage(false)
      setEditPageValue('')
    }
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading voicings for PCID {pcid}...</div>
      </div>
    )
  }

  return (
    <div className="app">
      <Header activeItem="Voicings" />

      <div className="main-content">
        <aside className="sidebar">
          <div className="pcid-info">
            <h3>PCID {pcid}</h3>
            <div className="pitch-info">
              <p><strong>Pitches:</strong> {pitches.join(' ')}</p>
              <p><strong>Binary:</strong> {pcidNumber.toString(2).padStart(12, '0')}</p>
              {rank && <p><strong>Popularity Rank:</strong> #{rank}</p>}
            </div>
            <MusicNotation pcid={pcidNumber}/>
            
            <div className="inversions-section">
              <h4>Inversions</h4>
              {/* <div className="inversions-grid"> */}
              <ul>
                {calculateInversions(pcidNumber).map((inversion) => (
                  <li
                    className={`inversion-link ${inversion.pcid === pcidNumber ? 'most-popular' : ''}`}
                    onClick={() => navigate(`/voicings/${inversion.pcid}`)}
                    title={`${inversion.rootNote} inversion (PCID ${inversion.pcid})${inversion.pcid === pcidNumber ? ' - Current' : ''}`}
                  >
                    {inversion.rootNote} ({inversion.pcid}){inversion.pcid === pcidNumber ? ' ★' : ''}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <BrowserFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            nameFilterLabel="Digest Filter"
            nameFilterPlaceholder="Search digest..."
          />
        </aside>

        <main className="content">
          <button onClick={() => {
            navigate(`/chords?pcid=${pcid}`)
          }} className="back-link">
            ← Back to Chords
          </button>
          <h2>Voicings for PCID {pcid}</h2>
          <p className="subtitle">
            Showing all voicings that use the pitch classes: <strong>{pitches.join(' ')}</strong>
          </p>
          
          {voicingData.length === 0 ? (
            <div className="no-data">
              <h3>No voicings found</h3>
              <p>No voicing data available for PCID {pcid}</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Digest</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Notes</th>
                      <th>Frequency %</th>
                      <th>Duration %</th>
                      <th>Play</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((item) => {
                      const totalFrequency = voicingData.reduce((sum, d) => sum + d.frequency, 0)
                      const totalDuration = voicingData.reduce((sum, d) => sum + d.duration, 0)
                      const frequencyPercent = ((item.frequency / totalFrequency) * 100).toFixed(2)
                      const durationPercent = ((item.duration / totalDuration) * 100).toFixed(2)
                      
                      let parseDigest = null
                      try {
                        parseDigest = getNotesFromDigest(item.digest)
                      } catch (error) {
                        console.error('Error analyzing voicing:', error)
                      }
                      
                      return (
                        <tr key={item.digest}>
                          <td 
                            className="voicing-id" 
                            onClick={() => navigate(`/voicings/${pcid}/${encodeURIComponent(item.digest)}`)}
                            title="Click to view detailed analysis"
                          >
                            {item.digest}
                          </td>
                          <td>{item.frequency.toLocaleString()}</td>
                          <td>{item.duration.toLocaleString()}</td>
                          <td>
                            <VoicingNotation 
                            notes={parseDigest?.notes.map(n => n + 48)} 
                            />
                          </td>
                          <td>{frequencyPercent}%</td>
                          <td>{durationPercent}%</td>
                          <td className="play-cell">
                            <button
                              className="mini-play-button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePlayVoicing(item.digest)
                              }}
                              disabled={playingDigest === item.digest || synthLoading}
                              title="Play this voicing"
                            >
                              {synthLoading && playingDigest === item.digest ? '⏳' : 
                               playingDigest === item.digest ? '♪' : '▶'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Prev
                </button>
                
                <span className="pagination-info">
                  Page {isEditingPage ? (
                    <input
                      type="number"
                      value={editPageValue}
                      onChange={(e) => setEditPageValue(e.target.value)}
                      onKeyDown={handlePageKeyPress}
                      onBlur={handlePageSubmit}
                      autoFocus
                      className="page-edit-input"
                      min="1"
                      max={totalPages}
                    />
                  ) : (
                    <span className="page-number" onClick={handlePageClick}>
                      {currentPage}
                    </span>
                  )} of {totalPages} ({filteredData.length} entries)
                </span>
                
                <button 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}
