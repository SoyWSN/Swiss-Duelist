import confetti from 'canvas-confetti';

/** Paleta festiva con acento naranja (el color de la victoria). */
const COLORS = ['#f97316', '#fb923c', '#fbbf24', '#34d399', '#38bdf8', '#f43f5e'];

/**
 * Efecto "Side Cannons" (cañones laterales): dispara confetti desde los lados
 * izquierdo (60°) y derecho (120°) de forma continua durante `duration` ms.
 * Basado en el componente Confetti de Magic UI (que usa canvas-confetti).
 */
export function fireSideCannons(duration = 3500): void {
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: COLORS,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: COLORS,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}
