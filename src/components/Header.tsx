import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  activeItem?: 'Chords' | 'Voicings' | 'Search' | 'About' | 'Contact' | 'Voicing Detail'
  customVoicingsClick?: () => void
}

export function Header({ activeItem, customVoicingsClick }: HeaderProps) {
  const navigate = useNavigate()

  const handleVoicingsClick = () => {
    if (customVoicingsClick) {
      customVoicingsClick()
    } else {
      navigate('/')
    }
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">🎵</div>
          <h1>PianoDB Voicings</h1>
        </div>
        <nav className="nav">
          <span 
            className={`nav-item ${activeItem === 'Chords' ? 'active' : ''}`}
            onClick={() => navigate('/chords')}
          >
            Chords
          </span>
            <span 
            className={`nav-item ${activeItem === 'Voicings' || activeItem === 'Voicing Detail' ? 'active' : 'disabled'} ${activeItem === 'Voicing Detail' ? 'disabled' : ''}`}
            onClick={handleVoicingsClick}
            title="Click on a PCID from the Chords section"
            >
            {activeItem === 'Voicing Detail' ? 'Voicing Detail' : 'Voicings'}
            </span>
          <span 
            className={`nav-item ${activeItem === 'Search' ? 'active' : ''}`}
            onClick={() => navigate('/search')}
          >
            Search
          </span>
          <span 
            className={`nav-item ${activeItem === 'About' ? 'active' : ''}`}
            onClick={() => navigate('/about')}
          >
            About
          </span>
          <span 
            className={`nav-item ${activeItem === 'Contact' ? 'active' : ''}`}
            onClick={() => navigate('/contact')}
          >
            Contact
          </span>
        </nav>
      </div>
    </header>
  )
}
