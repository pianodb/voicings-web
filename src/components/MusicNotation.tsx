import { pcidToPitchClasses, getPresentPitches, pcidToBinary } from '../utils/pitchClass'

interface MusicNotationProps {
  pcid: number
  showBinary?: boolean
}

export function MusicNotation({ pcid, showBinary = false }: MusicNotationProps) {
  const pitchClasses = pcidToPitchClasses(pcid)
  const presentPitches = getPresentPitches(pcid)
  const binary = pcidToBinary(pcid)

  return (
    <div className="music-notation">
      <div className="pitch-visualization">
        <div className="chord-display">
          <h4>Chord: {presentPitches.join(' ')}</h4>
        </div>
        
        <div className="pitch-circle">
          {pitchClasses.map((pc, index) => (
            <div
              key={index}
              className={`pitch-class ${pc.present ? 'present' : 'absent'}`}
              style={{
                transform: `rotate(${index * 30}deg) translate(60px) rotate(-${index * 30}deg)`
              }}
            >
              {pc.name.split('/')[0]}
            </div>
          ))}
        </div>

        {showBinary && (
          <div className="binary-display">
            <p>Binary: {binary} (PCID: {pcid})</p>
            <div className="binary-breakdown">
              {/* Show bits for notes 1-11 (Db through B), since C is always assumed */}
              {pitchClasses.slice(1).map((pc, index) => (
                <span
                  key={index}
                  className={`binary-bit ${pc.present ? 'bit-on' : 'bit-off'}`}
                  title={`${pc.name} (bit ${index})`}
                >
                  {binary[binary.length - 1 - index]}
                </span>
              ))}
            </div>
            <div className="bit-labels">
              {pitchClasses.slice(1).map((pc, index) => (
                <span key={index} className="bit-label" title={pc.name}>
                  {pc.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .music-notation {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .chord-display h4 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 1.2rem;
        }

        .pitch-visualization {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .pitch-circle {
          position: relative;
          width: 160px;
          height: 160px;
          margin: 20px auto;
        }

        .pitch-class {
          position: absolute;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.9rem;
          top: 50%;
          left: 50%;
          margin: -15px 0 0 -15px;
        }

        .pitch-class.present {
          background: #007bff;
          color: white;
          box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
        }

        .pitch-class.absent {
          background: #f8f9fa;
          color: #6c757d;
          border: 1px solid #dee2e6;
        }

        .binary-display {
          margin-top: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .binary-display p {
          margin: 0 0 10px 0;
          font-family: 'Courier New', monospace;
          color: #495057;
        }

        .binary-breakdown {
          display: flex;
          justify-content: center;
          gap: 2px;
        }

        .binary-bit {
          display: inline-block;
          width: 20px;
          height: 20px;
          line-height: 20px;
          text-align: center;
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          border-radius: 3px;
        }

        .bit-on {
          background: #28a745;
          color: white;
        }

        .bit-off {
          background: #6c757d;
          color: white;
        }

        .bit-labels {
          display: flex;
          justify-content: center;
          gap: 2px;
          margin-top: 5px;
        }

        .bit-label {
          display: inline-block;
          width: 20px;
          text-align: center;
          font-size: 0.7rem;
          color: #6c757d;
        }
      `}</style>
    </div>
  )
}
