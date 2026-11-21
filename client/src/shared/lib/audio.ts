"use client"

/**
 * Audio Notification Player (WhatsApp-style notification tone)
 * Features:
 * 1. Dual-engine: HTML5 Audio with Web Audio API synthesis fallback.
 * 2. Autoplay unlock: Resumes audio context on first user click/touch.
 */

let audioUnlocked = false

export function unlockAudio() {
  if (audioUnlocked || typeof window === "undefined") return
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (AudioCtx) {
      const ctx = new AudioCtx()
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {})
      }
    }
    audioUnlocked = true
  } catch {}
}

if (typeof window !== "undefined") {
  window.addEventListener("click", unlockAudio, { once: true, passive: true })
  window.addEventListener("touchstart", unlockAudio, { once: true, passive: true })
}

export function playWhatsAppSound() {
  if (typeof window === "undefined") return

  // 1. Try HTML5 Audio element first
  try {
    const audio = new Audio("/sounds/notification.wav")
    audio.volume = 0.8
    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback to Web Audio synthesis if HTML5 audio was blocked
        synthesizeWhatsAppChime()
      })
      return
    }
  } catch {
    // Fallback to synthesizer
    synthesizeWhatsAppChime()
  }
}

/**
 * Pure Web Audio API synthesized WhatsApp two-tone chime (880Hz -> 1318.5Hz).
 */
function synthesizeWhatsAppChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime

    // Tone 1: 880 Hz (A5)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = "sine"
    osc1.frequency.setValueAtTime(880, now)
    gain1.gain.setValueAtTime(0.35, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.12)

    // Tone 2: 1318.5 Hz (E6)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = "sine"
    osc2.frequency.setValueAtTime(1318.5, now + 0.08)
    gain2.gain.setValueAtTime(0.001, now)
    gain2.gain.setValueAtTime(0.5, now + 0.08)
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.38)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.08)
    osc2.stop(now + 0.38)
  } catch (err) {
    console.warn("Could not synthesize notification chime:", err)
  }
}
