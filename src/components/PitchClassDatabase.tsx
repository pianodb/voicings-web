import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPresentPitches, pcidToBinary } from '../utils/pitchClass'
import { MusicNotation } from './MusicNotation'
import csvData from '../assets/most_popular_cls_packed.csv?raw'

interface PitchClassData {
  frequency: number
  duration: number
  pcid: number
}

export function PitchClassDatabase() {
  const navigate = useNavigate()
  const [pitchClassData, setPitchClassData] = useState<PitchClassData[]>([])
  const [filteredData, setFilteredData] = useState<PitchClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPcid, setSelectedPcid] = useState<number | null>(null)
  const [filters, setFilters] = useState({
    minFrequency: '',
    maxFrequency: '',
    minDuration: '',
    maxDuration: '',
    pitchFilter: '',
    minPitches: '',
    maxPitches: ''
  })

  const itemsPerPage = 15

  useEffect(() => {
    const loadData = () => {
      setLoading(true)
      try {
        const lines = csvData.split('\n')
        const data: PitchClassData[] = lines.slice(1)
          .filter((line: string) => line.trim())
          .map((line: string) => {
            const values = line.split(',')
            return {
              frequency: parseInt(values[0]),
              duration: parseFloat(values[1]),
              pcid: parseInt(values[2])
            }
          })
        
        setPitchClassData(data)
        setFilteredData(data)
      } catch (error) {
        console.error('Error loading pitch class data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    let filtered = pitchClassData

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
    if (filters.pitchFilter) {
      filtered = filtered.filter(item => {
        const pitches = getPresentPitches(item.pcid)
        return pitches.some(pitch => 
          pitch.toLowerCase().includes(filters.pitchFilter.toLowerCase())
        )
      })
    }
    if (filters.minPitches) {
      filtered = filtered.filter(item => {
        const pitches = getPresentPitches(item.pcid)
        return pitches.length >= parseInt(filters.minPitches)
      })
    }
    if (filters.maxPitches) {
      filtered = filtered.filter(item => {
        const pitches = getPresentPitches(item.pcid)
        return pitches.length <= parseInt(filters.maxPitches)
      })
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [filters, pitchClassData])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handlePcidClick = (pcid: number) => {
    navigate(`/voicings/${pcid}`)
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
            <span className="nav-item active">Chords</span>
            <span className="nav-item disabled" onClick={() => navigate('/')}>Voicings</span>
            <span className="nav-item">Contact</span>
          </nav>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
        
          {selectedPcid && (
            <div className="visualization-panel">
              <h4>Pitch Class Visualization</h4>
              <MusicNotation pcid={selectedPcid} showBinary={false} />
            </div>
          )}
          
          <h3>Filters</h3>
          
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
            <label>Number of Pitches</label>
            <input 
              type="number" 
              placeholder="Min pitches" 
              value={filters.minPitches}
              onChange={(e) => handleFilterChange('minPitches', e.target.value)}
              className="filter-input"
            />
            <input 
              type="number" 
              placeholder="Max pitches" 
              value={filters.maxPitches}
              onChange={(e) => handleFilterChange('maxPitches', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Contains Pitch</label>
            <input 
              type="text" 
              placeholder="e.g., C, F#, Bb..." 
              value={filters.pitchFilter}
              onChange={(e) => handleFilterChange('pitchFilter', e.target.value)}
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
              pitchFilter: '',
              minPitches: '',
              maxPitches: ''
            })}
          >
            Clear filters
          </button>


        </aside>

        <main className="content">
          <h2>Pitch Class Database</h2>
          <p className="subtitle">
            Explore musical pitch class combinations and their frequencies in the dataset.
            Click on a PCID to see its voicings.
          </p>
          
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>PCID</th>
                      <th>Pitch Classes</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Frequency %</th>
                      <th>Duration %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((item) => {
                      const totalFrequency = pitchClassData.reduce((sum, d) => sum + d.frequency, 0)
                      const totalDuration = pitchClassData.reduce((sum, d) => sum + d.duration, 0)
                      const frequencyPercent = ((item.frequency / totalFrequency) * 100).toFixed(2)
                      const durationPercent = ((item.duration / totalDuration) * 100).toFixed(2)
                      const pitches = getPresentPitches(item.pcid)
                      
                      return (
                        <tr 
                          key={item.pcid}
                          onMouseEnter={() => setSelectedPcid(item.pcid)}
                          className="pitch-class-row"
                        >
                          <td 
                            className="pcid-link" 
                            onClick={() => handlePcidClick(item.pcid)}
                          >
                            {item.pcid}
                          </td>
                          <td className="pitch-list">{pitches.join(' ')}</td>
                          <td>{item.frequency.toLocaleString()}</td>
                          <td>{item.duration.toLocaleString()}</td>
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
