import { useNavigate } from 'react-router-dom'
import '../App.css'

export function Contact() {
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
            <span className="nav-item disabled">Voicings</span>
            <span className="nav-item" onClick={() => navigate('/about')}>About</span>
            <span className="nav-item active">Contact</span>
          </nav>
        </div>
      </header>

      <div className="main-content">
        <main className="content contact-content">
          <h2>Contact Us</h2>
          
          <div className="contact-section">
            <h3>Get in Touch</h3>
            <p>
              We'd love to hear from you! Whether you have questions about the data, suggestions for improvements, 
              or want to collaborate on music research projects, feel free to reach out.
            </p>
          </div>

          <div className="contact-methods">
            <div className="contact-card">
              <h4>📧 Email</h4>
              <p>For general inquiries, technical support, or collaboration opportunities:</p>
              <a href="mailto:info@pianodb.com" className="contact-link">info@pianodb.com</a>
            </div>

            <div className="contact-card">
              <h4>🐛 Bug Reports</h4>
              <p>Found a bug or have a feature request? Report it on our GitHub repository:</p>
              <a href="https://github.com/pianodb/voicings-web" className="contact-link" target="_blank" rel="noopener noreferrer">
                GitHub Issues
              </a>
            </div>

            <div className="contact-card">
              <h4>📚 Research Collaboration</h4>
              <p>Interested in using our data for academic research or have datasets to contribute?</p>
              <a href="mailto:research@pianodb.com" className="contact-link">research@pianodb.com</a>
            </div>
          </div>

          <div className="contact-section">
            <h3>FAQ</h3>
            <div className="faq-item">
              <h4>How can I download the raw data?</h4>
              <p>
                Currently, the data is available through our web interface. For bulk data access or research purposes, 
                please contact us directly at research@pianodb.com.
              </p>
            </div>

            <div className="faq-item">
              <h4>Can I contribute my own performance data?</h4>
              <p>
                Yes! We're always interested in expanding our dataset with high-quality performance data. 
                Please reach out to discuss data formats and contribution guidelines.
              </p>
            </div>

            <div className="faq-item">
              <h4>Is there an API available?</h4>
              <p>
                We're currently developing a public API for programmatic access to the voicing data. 
                Contact us if you're interested in early access.
              </p>
            </div>

            <div className="faq-item">
              <h4>How often is the data updated?</h4>
              <p>
                We continuously analyze new performance data and update the database quarterly with 
                new voicings and improved statistical analysis.
              </p>
            </div>
          </div>

          <div className="contact-section">
            <h3>Acknowledgments</h3>
            <p>
              PianoDB Voicings is made possible by the generous contributions of musicians, researchers, 
              and institutions who have shared their performance data. Special thanks to:
            </p>
            <ul>
              <li>Contributors to the open-source music analysis community</li>
              <li>Academic institutions providing performance datasets</li>
              <li>Musicians who have shared their recordings for analysis</li>
              <li>The broader music informatics research community</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  )
}
