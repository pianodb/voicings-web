import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getPresentPitches } from '../utils/pitchClass'
import { MusicNotation } from './MusicNotation'
import { Header } from './Header'
import { Footer } from './Footer'
import { BrowserFilter, type FilterState } from './BrowserFilter'
import csvData from '../assets/most_popular_cls_packed.csv?raw'
import type { PitchClassData } from '../utils/types'
import { loadPitchClassCsv } from '../utils/loadCsv'


export function PitchClassDatabase() {
  const navigate = useNavigate()
  const location = useLocation()
  const [pitchClassData, setPitchClassData] = useState<PitchClassData[]>([])
  const [filteredData, setFilteredData] = useState<PitchClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [_selectedPcid, setSelectedPcid] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isEditingPage, setIsEditingPage] = useState(false)
  const [editPageValue, setEditPageValue] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    minFrequencyShare: '',
    maxFrequencyShare: '',
    minDurationShare: '',
    maxDurationShare: '',
    pitchFilter: '',
    minPitches: '',
    maxPitches: '',
    nameFilter: '' // Will be used for PCID filter
  })

  const itemsPerPage = 10

  useEffect(() => {
    const loadData = () => {
      setLoading(true)
      try {
        const data = loadPitchClassCsv(csvData)
        
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
    if (filters.nameFilter) {
      const nameFilterValue = filters.nameFilter.trim()
      if (nameFilterValue) {
        filtered = filtered.filter(item => 
          item.pcid.toString().includes(nameFilterValue)
        )
      }
    }

    setFilteredData(filtered)

    // Once csv data is available, calculate correct page
    const searchParams = new URLSearchParams(location.search)
    const pcidParam = searchParams.get('pcid')
    
    if (filtered.length > 0 && pcidParam) {
      const pcidFrom = parseInt(pcidParam)
      // Find the index of the pcid in the filtered data
      const index = filtered.findIndex(item => item.pcid === pcidFrom)
      const pageNumber = index !== -1 ? Math.floor(index / itemsPerPage) + 1 : 1
      if (pageNumber >= 1) {
        setCurrentPage(pageNumber)
      }
      // Clean up the URL by removing query string
      // navigate('/chords', { replace: true })
    } else {
      setCurrentPage(1)
    }
  }, [filters, pitchClassData, location.search, navigate])


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

  const handlePcidClick = (pcid: number, rank?: number) => {
    navigate(`/voicings/${pcid}${rank ? `?rank=${rank}` : ''}`)
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
          <BrowserFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            nameFilterLabel="PCID Filter"
            nameFilterPlaceholder="e.g., 144"
          />
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
                            onClick={() => handlePcidClick(item.pcid, item.rank)}
                          >
                            {item.pcid}
                          </td>
                          <td className="pitch-list">{pitches.join(' ')}</td>
                          <td>{item.frequency.toLocaleString()}</td>
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
