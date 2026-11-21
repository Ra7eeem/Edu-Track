import confetti from "canvas-confetti"

export function triggerCelebration() {
  const end = Date.now() + 2.5 * 1000
  const colors = ["#10b981", "#f59e0b", "#6366f1", "#ec4899", "#E3B84F", "#12503B"]

  ;(function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors,
    })
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors,
    })
    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()
}
