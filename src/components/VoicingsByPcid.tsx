import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPresentPitches } from '../utils/pitchClass'
import { MusicNotation } from './MusicNotation'
import axios from 'axios'

interface VoicingData {
  voicing_id: number
  frequency: number
  duration: number
  digest: string
}

export function VoicingsByPcid() {
  const { pcid } = useParams<{ pcid: string }>()
  const navigate = useNavigate()
  const [voicingData, setVoicingData] = useState<VoicingData[]>([])
  const [filteredData, setFilteredData] = useState<VoicingData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    minFrequency: '',
    maxFrequency: '',
    minDuration: '',
    maxDuration: '',
    digestFilter: ''
  })

  const itemsPerPage = 15
  const pcidNumber = pcid ? parseInt(pcid) : 0
  const pitches = getPresentPitches(pcidNumber)

  useEffect(() => {
    const fetchData = async () => {
      if (!pcid) return

      setLoading(true)
      try {
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

    if (filters.minFrequency) {
      filtered = filtered.filter(item => item.frequency >= parseInt(filters.minFrequency))
    }
    if (filters.maxFrequency) {
      filtered = filtered.filter(item => item.frequency <= parseInt(filters.maxFrequency))
    }
    if (filters.minDuration) {
      filtered = filtered.filter(item => item.duration >= parseFloat(filters.minDuration))
    }
    if (filters.maxDuration) {
      filtered = filtered.filter(item => item.duration <= parseFloat(filters.maxDuration))
    }
    if (filters.digestFilter) {
      filtered = filtered.filter(item => 
        item.digest.toLowerCase().includes(filters.digestFilter.toLowerCase())
      )
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [filters, voicingData])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
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
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">🎵</div>
            <h1>PianoDB Voicings</h1>
          </div>
          <nav className="nav">
            <span className="nav-item" onClick={() => navigate('/pitch-classes')}>Chords</span>
            <span className="nav-item active">Voicings</span>
            <span className="nav-item">Contact</span>
          </nav>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <div className="pcid-info">
            <h3>PCID {pcid}</h3>
            <div className="pitch-info">
              <p><strong>Pitches:</strong> {pitches.join(' ')}</p>
              <p><strong>Binary:</strong> {pcidNumber.toString(2).padStart(12, '0')}</p>
            </div>
            <MusicNotation pcid={pcidNumber} showBinary={false} />
          </div>
          
          <div className="filter-section">
            <h4>Filters</h4>
            
            <div className="filter-group">
              <label>Frequency Range</label>
              <input 
                type="number" 
                placeholder="Min frequency" 
                value={filters.minFrequency}
                onChange={(e) => handleFilterChange('minFrequency', e.target.value)}
                className="filter-input"
              />
              <input 
                type="number" 
                placeholder="Max frequency" 
                value={filters.maxFrequency}
                onChange={(e) => handleFilterChange('maxFrequency', e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Duration Range</label>
              <input 
                type="number" 
                placeholder="Min duration" 
                value={filters.minDuration}
                onChange={(e) => handleFilterChange('minDuration', e.target.value)}
                className="filter-input"
              />
              <input 
                type="number" 
                placeholder="Max duration" 
                value={filters.maxDuration}
                onChange={(e) => handleFilterChange('maxDuration', e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Digest</label>
              <input 
                type="text" 
                placeholder="Search digest..." 
                value={filters.digestFilter}
                onChange={(e) => handleFilterChange('digestFilter', e.target.value)}
                className="filter-input"
              />
            </div>

            <button 
              className="apply-filters-btn"
              onClick={() => setFilters({
                minFrequency: '',
                maxFrequency: '',
                minDuration: '',
                maxDuration: '',
                digestFilter: ''
              })}
            >
              Clear filters
            </button>
          </div>
        </aside>

        <main className="content">
          <button onClick={() => navigate('/pitch-classes')} className="back-link">
            ← Back to Pitch Classes
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
                      <th>Voicing ID</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Digest</th>
                      <th>Frequency %</th>
                      <th>Duration %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((item) => {
                      const totalFrequency = voicingData.reduce((sum, d) => sum + d.frequency, 0)
                      const totalDuration = voicingData.reduce((sum, d) => sum + d.duration, 0)
                      const frequencyPercent = ((item.frequency / totalFrequency) * 100).toFixed(2)
                      const durationPercent = ((item.duration / totalDuration) * 100).toFixed(2)
                      
                      return (
                        <tr key={item.voicing_id}>
                          <td 
                            className="voicing-id" 
                            onClick={() => navigate(`/voicing/${pcid}/${item.voicing_id}`)}
                          >
                            {item.voicing_id}
                          </td>
                          <td>{item.frequency.toLocaleString()}</td>
                          <td>{item.duration.toLocaleString()}</td>
                          <td className="digest">{item.digest}</td>
                          <td>{frequencyPercent}%</td>
                          <td>{durationPercent}%</td>
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
                  Page {currentPage} of {totalPages} ({filteredData.length} entries)
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
    </div>
  )
}
