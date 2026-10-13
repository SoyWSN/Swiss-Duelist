interface Props {
  clockOn: boolean;
  onToggleClock: (on: boolean) => void;
}

export default function Config({ clockOn, onToggleClock }: Props) {
  return (
    <>
      <img className="bg-art" src="/bitron.png" alt="" />
      <div className="layer">
      <div className="tour-head">
        <div className="tt">Configuración<small>preferencias de la app</small></div>
      </div>
      <div className="cfg-list">
        <div className="cfg-row">
          <div>
            <b>Mostrar reloj de ronda</b>
            <small>Reloj de 50 minutos visible durante el torneo</small>
          </div>
          <div className={`sw2 ${clockOn ? 'on' : ''}`} onClick={() => onToggleClock(!clockOn)} />
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
