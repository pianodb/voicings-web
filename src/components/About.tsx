import { Header } from './Header'
import { Footer } from './Footer'
import '../App.css'

export function About() {
  return (
    <div className="app">
      <Header activeItem="About" />

      <div className="main-content">
        <main className="content about-content">
          <h2>About PianoDB Voicings</h2>
          
          <div className="about-section">
            <h3>What is PianoDB?</h3>
            <p>
              PianoDB Voicings is a database of over <b>14.7 million</b> piano chord voicings, derived from real musical performances. 
              We analyzed over one million musical pieces to identify the most commonly used chord voicings and their 
              relative frequencies in actual musical contexts.
            </p>
          </div>

          <div className="about-section">
            <h3>Features</h3>
            <div className="features-grid">
              <div className="feature-card">
                <h4>🎹 Chords</h4>
                <p>Explore all 2036 3+ note chords and their relative frequencies.</p>
              </div>
              <div className="feature-card">
                <h4>🔍 Advanced Search</h4>
                <p>Find chords through a virtual keyboard interface. Navigate chord inversions and roots.</p>
              </div>
              <div className="feature-card">
                <h4>📊 Statistical Insights</h4>
                <p>Filter and analyze voicings by frequency, duration, and usage patterns. Discover common and uncommon voicings for each chord.</p>
              </div>
              <div className="feature-card">
                <h4>🎼 Musical notation</h4>
                <p>View chord voicings in standard musical notation. Convenient links to Forte number and common name.</p>
              </div>
            </div>
          </div>

          <div className="about-section">
            <h3>Data Sources</h3>
            <p>
              Our analysis is based on <a href="https://arxiv.org/abs/2504.15071">Aria-MIDI (2025)</a>, a corpus of over one million MIDI files covering genres from classical, jazz, to contemporary music. However, there is a focus on classical piano. Rare chords (those found less than 10 times) are excluded.
            </p>
            <p>
              We release the data under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en">CC BY-NC-SA-4.0</a>.
            </p>
            <p>
              We recommend downloading the entire dataset through <a href="https://huggingface.co/datasets/conjuncts/voicings-rel" target="_blank" rel="noopener noreferrer">huggingface</a>.
            </p>
          </div>

          <div className="about-section">
            <h3>For Musicians</h3>
            <p>
              Whether you're a composer, pianist, or music theorist, PianoDB Voicings provides valuable insights into 
              how chords are actually used in practice. Use this data to:
            </p>
            <ul>
              <li>Discover common voicing patterns</li>
              <li>Analyze the statistical prevalence of specific harmonic structures</li>
              <li>Find alternative voicings for your compositions</li>
              <li>Offer music theory insights into chord progressions and their frequency</li>
            </ul>
          </div>

          
          <div className="about-section">
            <h3>Acknowledgments</h3>
            <p>
              We thank the following people for their hard work:
            </p>
            <ul>
              <li>Louis Bradshaw, Simon Colton for Aria-MIDI, without which this project would not be possible</li>
              <li>0xfe for <a href="https://github.com/0xfe/vexflow">vexflow</a>, the javascript music engraving library</li>
              <li>Wikipedia for data on <a href="https://en.wikipedia.org/wiki/List_of_set_classes" target="_blank" rel="noopener noreferrer">set classes</a></li>
              <li>All musicians who contributed recordings for analysis</li>
            </ul>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
