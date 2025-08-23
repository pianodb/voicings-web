import { Header } from './Header'
import { Footer } from './Footer'
import '../App.css'

export function Contact() {
  return (
    <div className="app">
      <Header activeItem="Contact" />

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
              <a href="mailto:contact@pianodb.org" className="contact-link">contact@pianodb.org</a>
            </div>

            <div className="contact-card">
              <h4>🎮 Discord</h4>
              <p>For general inquiries, technical support, or collaboration opportunities:</p>
              <a href="https://discord.gg/9BvE4khkqY" className="contact-link">Join our Discord server</a>
            </div>

            <div className="contact-card">
              <h4>🐛 Bug Reports</h4>
              <p>Found a bug or have a feature request? Report it on our GitHub repository:</p>
              <a href="https://github.com/pianodb/voicings-web" className="contact-link" target="_blank" rel="noopener noreferrer">
                GitHub Issues
              </a>
            </div>

            {/* <div className="contact-card">
              <h4>📚 Research Collaboration</h4>
              <p>Interested in using our data for academic research or have datasets to contribute?</p>
              <a href="mailto:research@pianodb.com" className="contact-link">research@pianodb.com</a>
            </div> */}
          </div>

          <div className="contact-section">
            <h3>FAQ</h3>
            <div className="faq-item">
              <h4>How can I download the raw data?</h4>
              <p>
                We recommend accessing everything through
                huggingface:
                &nbsp;<a href="https://huggingface.co/datasets/conjuncts/voicings-rel" target="_blank" rel="noopener noreferrer">conjuncts/voicings-rel</a> 
                &nbsp;and <a href="https://huggingface.co/datasets/conjuncts/voicings" target="_blank" rel="noopener noreferrer">conjuncts/voicings</a>.
              </p>
            </div>

            <div className="faq-item">
              <h4>Can I contribute?</h4>
              <p>
                Yes! Please reach out to us via Discord. 
              </p>
            </div>

            <div className="faq-item">
              <h4>Is there an API available?</h4>
              <p>
                No. However, everything is openly accessible through huggingface or github.
              </p>
            </div>
          </div>

        </main>
      </div>
      <Footer />
    </div>
  )
}
