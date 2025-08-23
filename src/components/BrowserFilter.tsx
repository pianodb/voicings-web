export interface FilterState {
  minFrequencyShare: string
  maxFrequencyShare: string
  minDurationShare: string
  maxDurationShare: string
  pitchFilter: string
  minPitches: string
  maxPitches: string
  nameFilter: string // Generic name for PCID or digest filter
}

interface UnifiedFiltersProps {
  filters: FilterState
  onFilterChange: (key: keyof FilterState, value: string) => void
  onClearFilters: () => void
  nameFilterLabel: string // "PCID Filter" or "Digest Filter"
  nameFilterPlaceholder: string // "e.g., 144" or "Search digest..."
}

export function BrowserFilter({
  filters,
  onFilterChange,
  onClearFilters,
  nameFilterLabel,
  nameFilterPlaceholder
}: UnifiedFiltersProps) {
  return (
    <div className="filter-section">
      <h3>Filters</h3>
      
      <div className="filter-group">
        <label>Frequency Share (%)</label>
        <div className="filter-input-row">
          <input 
            type="number" 
            placeholder="Min frequency %" 
            value={filters.minFrequencyShare}
            onChange={(e) => onFilterChange('minFrequencyShare', e.target.value)}
            className="filter-input"
            step="0.01"
            min="0"
            max="100"
          />
          <input 
            type="number" 
            placeholder="Max frequency %" 
            value={filters.maxFrequencyShare}
            onChange={(e) => onFilterChange('maxFrequencyShare', e.target.value)}
            className="filter-input"
            step="0.01"
            min="0"
            max="100"
          />
        </div>
      </div>

      <div className="filter-group">
        <label>Duration Share (%)</label>
        <div className="filter-input-row">
          <input 
            type="number" 
            placeholder="Min duration %" 
            value={filters.minDurationShare}
            onChange={(e) => onFilterChange('minDurationShare', e.target.value)}
            className="filter-input"
            step="0.01"
            min="0"
            max="100"
          />
          <input 
            type="number" 
            placeholder="Max duration %" 
            value={filters.maxDurationShare}
            onChange={(e) => onFilterChange('maxDurationShare', e.target.value)}
            className="filter-input"
            step="0.01"
            min="0"
            max="100"
          />
        </div>
      </div>

      <div className="filter-group">
        <label>Number of Pitches</label>
        <div className="filter-input-row">
          <input 
            type="number" 
            placeholder="Min pitches" 
            value={filters.minPitches}
            onChange={(e) => onFilterChange('minPitches', e.target.value)}
            className="filter-input"
            min="1"
            max="20"
          />
          <input 
            type="number" 
            placeholder="Max pitches" 
            value={filters.maxPitches}
            onChange={(e) => onFilterChange('maxPitches', e.target.value)}
            className="filter-input"
            min="1"
            max="20"
          />
        </div>
      </div>

      <div className="filter-group">
        <label>Contains Pitches</label>
        <input 
          type="text" 
          placeholder="e.g., C, F#, Bb" 
          value={filters.pitchFilter}
          onChange={(e) => onFilterChange('pitchFilter', e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <label>{nameFilterLabel}</label>
        <input 
          type="text" 
          placeholder={nameFilterPlaceholder}
          value={filters.nameFilter}
          onChange={(e) => onFilterChange('nameFilter', e.target.value)}
          className="filter-input"
        />
      </div>

      <button 
        className="apply-filters-btn"
        onClick={onClearFilters}
      >
        Clear filters
      </button>
    </div>
  )
}
