// Audio synthesis utilities for playing chord voicings

/**
 * Convert MIDI note number to frequency in Hz
 */
export function midiToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12)
}

/**
 * Create a piano-like oscillator with harmonics for a given frequency
 */
function createPianoOscillator(audioContext: AudioContext, frequency: number, gainNode: GainNode): OscillatorNode[] {
  const oscillators: OscillatorNode[] = []
  
  // Create a low-pass filter for more realistic piano timbre
  const filter = audioContext.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(4000, audioContext.currentTime) // Cut off high frequencies
  filter.Q.setValueAtTime(1, audioContext.currentTime)
  filter.connect(gainNode)
  
  // Piano harmonics with relative amplitudes (simplified)
  const harmonics = [
    { multiplier: 1, amplitude: 1.0 },      // Fundamental
    { multiplier: 2, amplitude: 0.3 },      // 2nd harmonic
    { multiplier: 3, amplitude: 0.15 },     // 3rd harmonic
    { multiplier: 4, amplitude: 0.08 },     // 4th harmonic
    { multiplier: 5, amplitude: 0.05 },     // 5th harmonic
    { multiplier: 6, amplitude: 0.03 },     // 6th harmonic
  ]
  
  harmonics.forEach(({ multiplier, amplitude }) => {
    const harmonicFreq = frequency * multiplier
    
    // Skip harmonics above human hearing range
    if (harmonicFreq > 20000) return
    
    const oscillator = audioContext.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(harmonicFreq, audioContext.currentTime)
    
    // Create individual gain for each harmonic
    const harmonicGain = audioContext.createGain()
    harmonicGain.gain.setValueAtTime(amplitude, audioContext.currentTime)
    
    oscillator.connect(harmonicGain)
    harmonicGain.connect(filter) // Connect to filter instead of direct to gainNode
    
    oscillators.push(oscillator)
  })
  
  return oscillators
}

/**
 * Synthesize and play a chord voicing
 */
export class ChordSynthesizer {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private currentOscillators: OscillatorNode[] = []
  private initializationPromise: Promise<void> | null = null
  private isInitialized: boolean = false

  constructor() {
    // Don't initialize immediately - wait for user gesture
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Ensure audio context is resumed (required by many browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
      
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
      this.masterGain.gain.setValueAtTime(0.15, this.audioContext.currentTime) // Slightly higher volume for piano
      
      // Small delay to ensure everything is properly initialized
      await new Promise(resolve => setTimeout(resolve, 50))
      
      this.isInitialized = true
    } catch (error) {
      console.error('Web Audio API is not supported in this browser:', error)
      throw error
    }
  }

  /**
   * Ensure the synthesizer is fully initialized before use
   */
  private async ensureInitialized(): Promise<void> {
    // If already initialized, we're good to go
    if (this.isInitialized && this.audioContext && this.masterGain) {
      // Double-check audio context state
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      return
    }

    // If initialization is already in progress, wait for it
    if (this.initializationPromise) {
      await this.initializationPromise
      return
    }

    // Start initialization
    this.initializationPromise = this.initializeAudioContext()
    await this.initializationPromise
    
    if (!this.audioContext || !this.masterGain) {
      throw new Error('Audio context failed to initialize')
    }
  }

  /**
   * Public method to check if synthesizer is ready (for UI feedback)
   */
  isReady(): boolean {
    return this.isInitialized && this.audioContext !== null && this.masterGain !== null
  }

  /**
   * Play a chord voicing given an array of MIDI note numbers
   */
  async playChord(midiNotes: number[], duration: number = 2.5): Promise<void> {
    // Ensure synthesizer is fully initialized
    await this.ensureInitialized()

    // Stop any currently playing notes
    this.stopChord()

    const currentTime = this.audioContext!.currentTime
    
    // Create oscillators for each note
    this.currentOscillators = []
    
    midiNotes.forEach((midiNote) => {
      const frequency = midiToFrequency(midiNote)
      
      // Create note-specific gain for piano envelope
      const noteGain = this.audioContext!.createGain()
      noteGain.connect(this.masterGain!)
      
      // Piano-like envelope: sharp attack, quick decay, sustain, release
      const attackTime = 0.01
      const decayTime = 0.3
      const sustainLevel = 0.3
      const releaseTime = 1.5
      
      noteGain.gain.setValueAtTime(0, currentTime)
      noteGain.gain.linearRampToValueAtTime(1, currentTime + attackTime) // Sharp attack
      noteGain.gain.exponentialRampToValueAtTime(sustainLevel, currentTime + attackTime + decayTime) // Decay
      noteGain.gain.setValueAtTime(sustainLevel, currentTime + duration - releaseTime) // Sustain
      noteGain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration) // Release
      
      // Create piano oscillators with harmonics
      const oscillators = createPianoOscillator(this.audioContext!, frequency, noteGain)
      
      // Start all oscillators for this note
      oscillators.forEach(osc => {
        osc.start(currentTime)
        osc.stop(currentTime + duration)
        this.currentOscillators.push(osc)
      })
    })

    // Clean up oscillators after they finish
    setTimeout(() => {
      this.currentOscillators = []
    }, duration * 1000)
  }

  /**
   * Stop currently playing chord
   */
  stopChord(): void {
    if (this.currentOscillators.length > 0) {
      const currentTime = this.audioContext?.currentTime || 0
      this.currentOscillators.forEach(osc => {
        try {
          osc.stop(currentTime)
        } catch (error) {
          // Oscillator might already be stopped
        }
      })
      this.currentOscillators = []
    }
  }

  /**
   * Play an arpeggio of the chord with piano-like timing
   */
  async playArpeggio(midiNotes: number[], noteDelay: number = 0.25): Promise<void> {
    // Ensure synthesizer is fully initialized
    await this.ensureInitialized()

    this.stopChord()

    // Play each note with slight overlap for more natural sound
    for (let i = 0; i < midiNotes.length; i++) {
      setTimeout(() => {
        this.playNote(midiNotes[i], 1.2) // Longer duration with overlap
      }, i * noteDelay * 1000)
    }
  }

  /**
   * Play a single note with piano-like characteristics
   */
  private async playNote(midiNote: number, duration: number = 0.8): Promise<void> {
    // Ensure synthesizer is initialized (should already be from parent call, but just in case)
    if (!this.audioContext || !this.masterGain) return

    const currentTime = this.audioContext.currentTime
    const noteGain = this.audioContext.createGain()
    noteGain.connect(this.masterGain)

    // Piano-like envelope for single note
    const attackTime = 0.01
    const decayTime = 0.1
    const sustainLevel = 0.4
    const releaseTime = duration * 0.6
    
    noteGain.gain.setValueAtTime(0, currentTime)
    noteGain.gain.linearRampToValueAtTime(0.8, currentTime + attackTime)
    noteGain.gain.exponentialRampToValueAtTime(sustainLevel, currentTime + attackTime + decayTime)
    noteGain.gain.setValueAtTime(sustainLevel, currentTime + duration - releaseTime)
    noteGain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration)

    const frequency = midiToFrequency(midiNote)
    const oscillators = createPianoOscillator(this.audioContext, frequency, noteGain)
    
    oscillators.forEach(osc => {
      osc.start(currentTime)
      osc.stop(currentTime + duration)
    })
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopChord()
    if (this.audioContext) {
      this.audioContext.close()
    }
  }
}

// Global synthesizer instance
let globalSynthesizer: ChordSynthesizer | null = null

/**
 * Get or create the global synthesizer instance
 */
export function getSynthesizer(): ChordSynthesizer {
  if (!globalSynthesizer) {
    globalSynthesizer = new ChordSynthesizer()
  }
  return globalSynthesizer
}

/**
 * Check if the synthesizer is ready to play audio
 */
export function isSynthesizerReady(): boolean {
  if (!globalSynthesizer) {
    return false
  }
  return globalSynthesizer.isReady()
}

/**
 * Convenience function to play a chord voicing
 */
export async function playVoicing(midiNotes: number[], duration?: number): Promise<void> {
  const synthesizer = getSynthesizer()
  return synthesizer.playChord(midiNotes, duration)
}

/**
 * Convenience function to play an arpeggio
 */
export async function playArpeggio(midiNotes: number[], noteDelay?: number): Promise<void> {
  const synthesizer = getSynthesizer()
  return synthesizer.playArpeggio(midiNotes, noteDelay)
}
