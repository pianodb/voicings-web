import { useNavigate } from 'react-router-dom'
import '../App.css'

export function About() {
  const navigate = useNavigate()

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
            <span className="nav-item" onClick={() => navigate('/legacy')}>Voicings</span>
            <span className="nav-item active">About</span>
            <span className="nav-item" onClick={() => navigate('/contact')}>Contact</span>
          </nav>
        </div>
      </header>

      <div className="main-content">
        <main className="content about-content">
          <h2>About PianoDB Voicings</h2>
          
          <div className="about-section">
            <h3>What is PianoDB?</h3>
            <p>
              PianoDB Voicings is a comprehensive database of piano chord voicings derived from real musical performances. 
              Our system analyzes over one million musical pieces to identify the most commonly used chord voicings and their 
              relative frequencies in actual musical contexts.
            </p>
          </div>

          <div className="about-section">
            <h3>How it Works</h3>
            <p>
              The database categorizes chord voicings by their pitch class sets and provides detailed analytics including:
            </p>
            <ul>
              <li><strong>Frequency:</strong> How often each voicing appears in the analyzed corpus</li>
              <li><strong>Duration:</strong> Total time each voicing is sustained across all performances</li>
              <li><strong>Digest:</strong> A unique identifier representing the specific pitches in the voicing</li>
              <li><strong>Statistical Analysis:</strong> Percentage breakdowns of usage patterns</li>
            </ul>
          </div>

          <div className="about-section">
            <h3>Features</h3>
            <div className="features-grid">
              <div className="feature-card">
                <h4>🎹 Chord Analysis</h4>
                <p>Browse chord types by their pitch class sets with visual representation on a virtual piano keyboard.</p>
              </div>
              <div className="feature-card">
                <h4>📊 Statistical Insights</h4>
                <p>Filter and analyze voicings by frequency, duration, and usage patterns in real musical contexts.</p>
              </div>
              <div className="feature-card">
                <h4>🎼 Musical notation</h4>
                <p>View chord voicings in standard musical notation to understand their harmonic structure.</p>
              </div>
              <div className="feature-card">
                <h4>🔍 Advanced Filtering</h4>
                <p>Search and filter by multiple criteria including pitch content, statistical thresholds, and digest patterns.</p>
              </div>
            </div>
          </div>

          <div className="about-section">
            <h3>Data Sources</h3>
            <p>
              Our analysis is based on multiple datasets of piano performances, including classical, jazz, and contemporary 
              music. We use the Aria-MIDI dataset (2025) by Bradshaw et al. 
            </p>
            <p>
              Just like the original Aria-MIDI dataset, our data is released under CC-BY-NC-SA-4.0
            </p>
            <p>
              We are committed to transparency and open science, and all datasets on <a href="https://huggingface.co/datasets/conjuncts/voicings">huggingface</a> are available for research and exploration.
            </p>
          </div>

          <div className="about-section">
            <h3>For Musicians</h3>
            <p>
              Whether you're a composer, pianist, or music theorist, PianoDB Voicings provides valuable insights into 
              how chords are actually used in practice. Use this data to:
            </p>
            <ul>
              <li>Discover common voicing patterns in different musical styles</li>
              <li>Analyze the statistical prevalence of specific harmonic structures</li>
              <li>Find alternative voicings for your compositions</li>
              <li>Study the relationship between chord frequency and musical context</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  )
}
