import { useState, useEffect } from 'react'
import { getPresentPitches, PITCH_CLASSES, packNotes, packPitchClass } from '../utils/pitchClass'
import { MusicNotation } from './MusicNotation'
import { Piano } from './Piano'
import { Header } from './Header'
import csvData from '../assets/most_popular_cls_packed.csv?raw'
import { VoicingNotation } from './VoicingNotation'

interface PitchClassData {
  frequency: number
  duration: number
  pcid: number
  frequencyRank: number
}

export function Search() {
  const [pitchClassData, setPitchClassData] = useState<PitchClassData[]>([])
  const [selectedNotes, setSelectedNotes] = useState<Set<number>>(new Set())
  const [searchResults, setSearchResults] = useState<PitchClassData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      setLoading(true)
      try {
        const lines = csvData.split('\n')
        const data: PitchClassData[] = lines.slice(1)
          .filter((line: string) => line.trim())
          .map((line: string, index: number) => {
            const values = line.split(',')
            return {
              frequency: parseInt(values[0]),
              duration: parseFloat(values[1]),
              pcid: parseInt(values[2]),
              frequencyRank: index + 1  // First entry is rank 1
            }
          })
        
        setPitchClassData(data)
      } catch (error) {
        console.error('Error loading pitch class data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleNotePress = (midiNote: number) => {
    const newSelected = new Set(selectedNotes)
    
    if (newSelected.has(midiNote)) {
      newSelected.delete(midiNote)
    } else {
      newSelected.add(midiNote)
    }
    setSelectedNotes(newSelected)
  }

  const calculatePcidFromMidiNotes = (midiNotes: Set<number>): number => {
    // Convert MIDI notes to pitch classes, then calculate PCID
    // Need to subtract lowest note (bass)
    const pitchClasses = new Set<number>()
    const bass = Math.min(...Array.from(midiNotes))
    midiNotes.forEach(midiNote => {
      const pitchClass = (midiNote - bass) % 12
      pitchClasses.add(pitchClass)
    })
    
    let pcid = packPitchClass(pitchClasses)
    return pcid
  }

  const getMidiNoteDisplay = (midiNote: number): string => {
    const pitchClass = midiNote % 12
    const octave = Math.floor(midiNote / 12)
    return `${PITCH_CLASSES[pitchClass].name}${octave}`
  }

  const findMatches = (userPcid: number) => {
    if (selectedNotes.size === 0) {
      setSearchResults([])
      return
    }

    const exactMatches: PitchClassData[] = []
    const supersetMatches: PitchClassData[] = []

    pitchClassData.forEach(item => {
      if (item.pcid === userPcid) {
        exactMatches.push(item)
      } else {
        // Check if item.pcid is a superset of userPcid
        // This means all bits set in userPcid are also set in item.pcid
        if ((userPcid & item.pcid) === userPcid && userPcid !== 0) {
          supersetMatches.push(item)
        }
      }
    })

    // Sort by frequency (most popular first)
    supersetMatches.sort((a, b) => b.frequency - a.frequency)
    
    // Combine exact matches first, then up to 10 superset matches
    const results = [...exactMatches, ...supersetMatches.slice(0, 10)]
    setSearchResults(results)
  }

  useEffect(() => {
    if (selectedNotes.size > 0) {
      const pcid = calculatePcidFromMidiNotes(selectedNotes)
      findMatches(pcid)
    } else {
      setSearchResults([])
    }
  }, [selectedNotes, pitchClassData])

  const clearSelection = () => {
    setSelectedNotes(new Set())
    setSearchResults([])
  }

  const handlePcidClick = (pcid: number) => {
    // navigate(`/voicings/${pcid}`)
    window.open(`/voicings/${pcid}`, '_blank')
  }

  const userPcid = calculatePcidFromMidiNotes(selectedNotes)

  const getPitchClassSummary = (): string[] => {
    // Get unique pitch classes from selected MIDI notes
    const pitchClasses = new Set<number>()
    selectedNotes.forEach(midiNote => {
      const pitchClass = midiNote % 12
      pitchClasses.add(pitchClass)
    })
    return Array.from(pitchClasses).sort().map(pc => PITCH_CLASSES[pc].name)
  }

  const getVoicingSummary = (): string => {
    if (selectedNotes.size === 0) return 'None'
    const sortedNotes = Array.from(selectedNotes).sort((a, b) => a - b)
    return sortedNotes.map(note => getMidiNoteDisplay(note)).join(' ')
  }

  const calculateDigest = (): string | null => {
    if (selectedNotes.size === 0) return null
    
    // Convert MIDI notes to the format expected by packNotes
    // PackNotes expects notes starting from 0 (so we need to subtract the lowest note)
    const sortedNotes = Array.from(selectedNotes).sort((a, b) => a - b)
    const lowestNote = sortedNotes[0]
    const normalizedNotes = sortedNotes.map(note => note - lowestNote)
    
    try {
      return packNotes(normalizedNotes)
    } catch (error) {
      console.error('Error calculating digest:', error)
      return null
    }
  }

  const getUserVoicingEntry = () => {
    if (selectedNotes.size === 0) return null
    
    const digest = calculateDigest()
    if (!digest) return null
    
    const userPcid = calculatePcidFromMidiNotes(selectedNotes)
    const sortedNotes = Array.from(selectedNotes).sort((a, b) => a - b)
    
    return {
      pcid: userPcid,
      digest: digest,
      notes: sortedNotes,
      isUserInput: true
    }
  }

  if (loading) {
    return (
      <div className="app">
        <Header activeItem="Search" />
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="app">
      <Header activeItem="Search" />

      <div className="main-content">
        <main className="content search-content">
          <h2>Voicing Search</h2>
          <p className="subtitle">
            Click on the piano keys below to select notes and find matching voicings in the database.
          </p>

          <Piano
            octaves={2}
            startOctave={4}
            selectedNotes={selectedNotes}
            onNotePress={handleNotePress}
            showLabels={false}
          />

          <div className="selection-info">
            <div className="selected-notes">
              <h3>Selected Voicing: {getVoicingSummary()}</h3>
              {selectedNotes.size > 0 && (
                <div className="voicing-details">
                  <p>Pitch Classes: {getPitchClassSummary().join(' ')}</p>
                  <p>PCID: {userPcid}</p>
                  <button className="clear-btn" onClick={clearSelection}>
                    Clear Selection
                  </button>
                </div>
              )}
            </div>
            
            {selectedNotes.size > 0 && (
              <div className="notation-preview">
                <VoicingNotation notes={Array.from(selectedNotes)} showTitle={false} />
              </div>
            )}
          </div>

          

          {searchResults.length > 0 && (
            <div className="search-results">
              <h3>Search Results ({searchResults.length})</h3>

              {selectedNotes.size > 0 && (
                // <div className="user-voicing">
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Your Notes</th>
                        <th>Notation</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const userEntry = getUserVoicingEntry()
                        if (!userEntry) return null
                        
                        const sortedNotes = Array.from(selectedNotes).sort((a, b) => a - b)
                        const noteNames = sortedNotes.map(note => getMidiNoteDisplay(note))
                        
                        return (
                          <tr className="user-voicing-row">
                            <td className="match-type exact">Exact Voicing</td>
                            <td className="note-list">{noteNames.join(' ')}</td>
                            <td>
                              <VoicingNotation 
                                notes={userEntry.notes}
                                showTitle={false}
                              />
                            </td>
                            <td>
                              <button 
                                className="view-voicing-btn"
                                onClick={() => window.open(
                                  `/voicings/${userEntry.pcid}/${encodeURIComponent(userEntry.digest)}`,
                                  '_blank'
                                )}
                              >
                                View Detail
                              </button>
                            </td>
                          </tr>
                        )
                      })()}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Match Type</th>
                      <th>PCID</th>
                      <th>Pitch Classes</th>
                      <th>Notes</th>
                      <th>Frequency</th>
                      <th>Freq. Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((item) => {
                      const pitches = getPresentPitches(item.pcid)
                      const isExactMatch = item.pcid === userPcid
                      
                      return (
                        <tr key={item.pcid} className="pitch-class-row">
                          <td className={`match-type ${isExactMatch ? 'exact' : 'superset'}`}>
                            {isExactMatch ? 'Exact' : 'Superset'}
                          </td>
                          <td 
                            className="pcid-link" 
                            onClick={() => handlePcidClick(item.pcid)}
                          >
                            {item.pcid}
                          </td>
                          <td className="pitch-list">{pitches.join(' ')}</td>
                          <td>
                            <MusicNotation 
                              pcid={item.pcid}
                              showTitle={false}
                            />
                          </td>
                          <td>{item.frequency.toLocaleString()}</td>
                          <td>#{item.frequencyRank}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedNotes.size > 0 && searchResults.length === 0 && (
            <div className="no-results">
              <h3>No matches found</h3>
              <p>Try selecting different notes or fewer notes to find matches.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
