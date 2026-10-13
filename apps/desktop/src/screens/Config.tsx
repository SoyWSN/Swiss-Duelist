interface Props {
  clockOn: boolean;
  onToggleClock: (on: boolean) => void;
  confettiOn: boolean;
  onToggleConfetti: (on: boolean) => void;
  roundMinutes: number;
  onRoundMinutesChange: (minutes: number) => void;
}

export default function Config({ clockOn, onToggleClock, confettiOn, onToggleConfetti, roundMinutes, onRoundMinutesChange }: Props) {
  return (
    <>
      <img className="bg-art" src="/bitron.png" alt="" />
      <div className="layer">
        <div className="tour-head">
          <div className="tt">Ajustes<small>preferencias de la app</small></div>
        </div>
        <div className="cfg-list">
          <div className="cfg-row">
            <div>
              <b>Mostrar reloj de ronda</b>
              <small>Reloj visible durante el torneo</small>
            </div>
            <div className={`sw2 ${clockOn ? 'on' : ''}`} onClick={() => onToggleClock(!clockOn)} />
          </div>
          <div className="cfg-row">
            <div>
              <b>Duración de la ronda</b>
              <small>Tiempo por ronda en minutos</small>
            </div>
            <input
              className="num-input"
              type="number"
              min={1}
              max={180}
              value={roundMinutes}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (Number.isFinite(v)) onRoundMinutesChange(Math.max(1, Math.min(180, v)));
              }}
            />
          </div>
          <div className="cfg-row">
            <div>
              <b>Confetti al terminar</b>
              <small>Cañones laterales al mostrar el podio</small>
            </div>
            <div className={`sw2 ${confettiOn ? 'on' : ''}`} onClick={() => onToggleConfetti(!confettiOn)} />
          </div>
          <div className="cfg-row">
            <div>
              <b>Política de desempates</b>
              <small>Puntos → OMW% → OOMW% · piso de 33% por rival</small>
            </div>
            <span className="chip chip-o">KDE v2.5</span>
          </div>
          <div className="cfg-row">
            <div>
              <b>Rondas por cantidad de jugadores</b>
              <small>4–8 → 3 · 9–16 → 4 · 17–32 → 5 · 33–64 → 6 · 65–128 → 7</small>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
