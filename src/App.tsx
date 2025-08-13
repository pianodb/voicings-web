import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './App.css'

interface VoicingData {
  voicing_id: number
  frequency: number
  duration: number
  digest: string
}

function App() {
  const navigate = useNavigate()
  const [voicingData, setVoicingData] = useState<VoicingData[]>([])
  const [filteredData, setFilteredData] = useState<VoicingData[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDataset, setSelectedDataset] = useState('34')
  const [filters, setFilters] = useState({
    minFrequencyShare: '',
    maxFrequencyShare: '',
    minDurationShare: '',
    maxDurationShare: '',
    digestFilter: ''
  })

  const itemsPerPage = 10

  const fetchData = async (datasetId: string) => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/${datasetId}.csv`)
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

  useEffect(() => {
    fetchData(selectedDataset)
  }, [selectedDataset])

  useEffect(() => {
    let filtered = voicingData

    // Calculate total values for percentage calculations
    const totalFrequency = voicingData.reduce((sum, d) => sum + d.frequency, 0)
    const totalDuration = voicingData.reduce((sum, d) => sum + d.duration, 0)

    if (filters.minFrequencyShare) {
      filtered = filtered.filter(item => {
        const frequencyShare = (item.frequency / totalFrequency) * 100
        return frequencyShare >= parseFloat(filters.minFrequencyShare)
      })
    }
    if (filters.maxFrequencyShare) {
      filtered = filtered.filter(item => {
        const frequencyShare = (item.frequency / totalFrequency) * 100
        return frequencyShare <= parseFloat(filters.maxFrequencyShare)
      })
    }
    if (filters.minDurationShare) {
      filtered = filtered.filter(item => {
        const durationShare = (item.duration / totalDuration) * 100
        return durationShare >= parseFloat(filters.minDurationShare)
      })
    }
    if (filters.maxDurationShare) {
      filtered = filtered.filter(item => {
        const durationShare = (item.duration / totalDuration) * 100
        return durationShare <= parseFloat(filters.maxDurationShare)
      })
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
        <aside className="sidebar">
          <h3>Filters</h3>
          
          <div className="filter-group">
            <label>Dataset</label>
            <select 
              value={selectedDataset} 
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="filter-input"
            >
              <option value="34">Dataset 34</option>
              <option value="35">Dataset 35</option>
              <option value="36">Dataset 36</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Voicing ID</label>
            <input 
              type="text" 
              placeholder="Enter voicing ID..." 
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Frequency Share Range (%)</label>
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
            <label>Duration Share Range (%)</label>
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
              minFrequencyShare: '',
              maxFrequencyShare: '',
              minDurationShare: '',
              maxDurationShare: '',
              digestFilter: ''
            })}
          >
            Clear filters
          </button>
        </aside>

        <main className="content">
          <h2>Database</h2>
          
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Voicing ID</th>
                      {/* <th>Frequency</th> */}
                      {/* <th>Duration</th> */}
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
                          <td className="voicing-id" onClick={() => navigate(`/voicing/${selectedDataset}/${item.voicing_id}`)}>
                            {item.voicing_id}
                          </td>
                          {/* <td>{item.frequency.toLocaleString()}</td> */}
                          {/* <td>{item.duration.toLocaleString()}</td> */}
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

export default App
