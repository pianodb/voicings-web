import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPresentPitches } from '../utils/pitchClass'
import { MusicNotation } from './MusicNotation'
import { Header } from './Header'
import { Footer } from './Footer'
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
  const [_selectedPcid, setSelectedPcid] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isEditingPage, setIsEditingPage] = useState(false)
  const [editPageValue, setEditPageValue] = useState('')
  const [filters, setFilters] = useState({
    minFrequencyShare: '',
    maxFrequencyShare: '',
    minDurationShare: '',
    maxDurationShare: '',
    pitchFilter: '',
    minPitches: '',
    maxPitches: ''
  })

  const itemsPerPage = 10

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

    // Calculate total frequency and duration for percentage calculations
    const totalFrequency = pitchClassData.reduce((sum, d) => sum + d.frequency, 0)
    const totalDuration = pitchClassData.reduce((sum, d) => sum + d.duration, 0)

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
    if (filters.pitchFilter) {
      const filterPitches = filters.pitchFilter
        .split(',')
        .map(p => p.trim().toLowerCase())
        .filter(p => p.length > 0)
      
      if (filterPitches.length > 0) {
        filtered = filtered.filter(item => {
          const pitches = getPresentPitches(item.pcid).map(p => p.toLowerCase())
          return filterPitches.every(filterPitch => 
            pitches.some(pitch => pitch.includes(filterPitch))
          )
        })
      }
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

  return (
    <div className="app">
      <Header activeItem="Chords" />

      <div className="main-content">
        <aside className="sidebar">

          <h3>Filters</h3>
          
          <div className="filter-group">
            <label>Frequency Share (%)</label>
            <input 
              type="number" 
              placeholder="Min frequency %" 
              value={filters.minFrequencyShare}
              onChange={(e) => handleFilterChange('minFrequencyShare', e.target.value)}
              className="filter-input"
              step="0.01"
              min="0"
              max="100"
            />
            <input 
              type="number" 
              placeholder="Max frequency %" 
              value={filters.maxFrequencyShare}
              onChange={(e) => handleFilterChange('maxFrequencyShare', e.target.value)}
              className="filter-input"
              step="0.01"
              min="0"
              max="100"
            />
          </div>

          <div className="filter-group">
            <label>Duration Share (%)</label>
            <input 
              type="number" 
              placeholder="Min duration %" 
              value={filters.minDurationShare}
              onChange={(e) => handleFilterChange('minDurationShare', e.target.value)}
              className="filter-input"
              step="0.01"
              min="0"
              max="100"
            />
            <input 
              type="number" 
              placeholder="Max duration %" 
              value={filters.maxDurationShare}
              onChange={(e) => handleFilterChange('maxDurationShare', e.target.value)}
              className="filter-input"
              step="0.01"
              min="0"
              max="100"
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
            <label>Contains Pitches</label>
            <input 
              type="text" 
              placeholder="e.g., C, F#, Bb" 
              value={filters.pitchFilter}
              onChange={(e) => handleFilterChange('pitchFilter', e.target.value)}
              className="filter-input"
            />
          </div>

          <button 
            className="apply-filters-btn"
            onClick={() => setFilters({
              minFrequencyShare: '',
              maxFrequencyShare: '',
              minDurationShare: '',
              maxDurationShare: '',
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
            Explore musical pitch class combinations and their frequencies in the database.
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
                      {/* <th>Duration</th> */}
                      <th>Notes</th>
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
                          {/* <td>{item.duration.toLocaleString()}</td> */}
                          <td>
                            <MusicNotation 
                              pcid={item.pcid}
                              showTitle={false}
                            />
                          </td>
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
