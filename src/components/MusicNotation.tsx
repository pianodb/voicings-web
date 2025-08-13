import { useEffect, useRef } from 'react'
import { pcidToPitchClasses, getPresentPitches, unpackPitchClass } from '../utils/pitchClass'

interface MusicNotationProps {
  pcid: number
  showTitle?: boolean
}

export function MusicNotation({ pcid, showTitle }: MusicNotationProps) {
  const svgRef = useRef<HTMLDivElement>(null)
  const pitchClasses = pcidToPitchClasses(pcid)
  const presentPitches = getPresentPitches(pcid)

  useEffect(() => {
    const renderNotation = async () => {
      if (!svgRef.current) return

      try {
        // Dynamic import for VexFlow
        const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } = await import('vexflow')
        
        // Clear previous content
        svgRef.current.innerHTML = ''

        const pitchNumbers = unpackPitchClass(pcid)
        if (pitchNumbers.length === 0) {
          svgRef.current.innerHTML = '<div class="no-notes">No notes to display</div>'
          return
        }

        // Create renderer
        const width = 150
        const height = 100
        const renderer = new Renderer(svgRef.current, Renderer.Backends.SVG)
        renderer.resize(width, height)
        const context = renderer.getContext()

        // Create stave
        const stave = new Stave(0, 0, width - 20)
        stave.addClef('treble')
        stave.setContext(context).draw()

        // Convert pitch classes to VexFlow note names
        const noteKeys = pitchNumbers.map(pitchClass => {
          const noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
          const noteName = noteNames[pitchClass]
        //   const octave = pitchClass === 0 ? '4' : pitchClass < 4 ? '5' : '4' // Spread notes across octaves for better visualization
          const octave = 4;
          return `${noteName}/${octave}`
        })

        // Heuristic: if A or G is present, then use F# instead of Gb
        if (noteKeys.includes('Gb/4')) {
            if (noteKeys.includes('A/4') || noteKeys.includes('G/4')) {
              const index = noteKeys.indexOf('Gb/4')
              noteKeys[index] = 'F#/4'
            }
        }

        if (noteKeys.length === 1) {
          // Single note
          const note = new StaveNote({
            clef: 'treble',
            keys: noteKeys,
            duration: 'w'
          })

          // Add accidentals for flat notes
          if (noteKeys[0].includes('b')) {
            note.addModifier(new Accidental('b'), 0)
          } else if (noteKeys[0].includes('#')) {
            note.addModifier(new Accidental('#'), 0)
          }

          const voice = new Voice({ num_beats: 4, beat_value: 4 })
          voice.addTickable(note)

          new Formatter().joinVoices([voice]).format([voice], width - 40)
          voice.draw(context, stave)
        } else {
          // Chord
          const chord = new StaveNote({
            clef: 'treble',
            keys: noteKeys,
            duration: 'w'
          })

          // Add accidentals for flat notes
          noteKeys.forEach((key, index) => {
            if (key.includes('b')) {
              chord.addModifier(new Accidental('b'), index)
            } else if (key.includes('#')) {
              chord.addModifier(new Accidental('#'), index)
            }
          })

          const voice = new Voice({ num_beats: 4, beat_value: 4 })
          voice.addTickable(chord)

          new Formatter().joinVoices([voice]).format([voice], width - 40)
          voice.draw(context, stave)
        }
      } catch (error) {
        console.error('Error rendering music notation:', error)
        // Fallback to simple visualization
        if (svgRef.current) {
          svgRef.current.innerHTML = `
            <div class="fallback-notation">
              <h4>Chord: ${presentPitches.join(' ')}</h4>
              <div class="pitch-circle">
                ${pitchClasses.map((pc, index) => `
                  <div class="pitch-class ${pc.present ? 'present' : 'absent'}" 
                       style="transform: rotate(${index * 30}deg) translate(50px) rotate(-${index * 30}deg)">
                    ${pc.name.split('/')[0]}
                  </div>
                `).join('')}
              </div>
            </div>
          `
        }
      }
    }

    renderNotation()
  }, [pcid, presentPitches, pitchClasses])

  return (
    <div className="music-notation">
      {showTitle && (
        <div className="chord-info">
          <h4>{presentPitches.join(' ')}</h4>
        </div>
      )}
      <div ref={svgRef} className="notation-container" />

      <style>{`
        .music-notation {
          background: white;
          border-radius: 8px;
          padding: 2px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .chord-info h4 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 1rem;
          font-weight: 600;
        }

        .notation-container {
          margin: 2px 0;
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fallback-notation {
          text-align: center;
        }

        .fallback-notation .pitch-circle {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 10px auto;
        }

        .fallback-notation .pitch-class {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.8rem;
          top: 50%;
          left: 50%;
          margin: -12px 0 0 -12px;
        }

        .fallback-notation .pitch-class.present {
          background: #007bff;
          color: white;
          box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);
        }

        .fallback-notation .pitch-class.absent {
          background: #f8f9fa;
          color: #6c757d;
          border: 1px solid #dee2e6;
        }

        .no-notes {
          color: #6c757d;
          font-style: italic;
          padding: 20px;
        }
      `}</style>
    </div>
  )
}
