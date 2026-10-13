import { useEffect, useRef, useState } from 'react';
import { roundsForPlayerCount } from '@swiss-duelist/engine';
import { IconPlay, IconPlus, IconX } from '../components/icons';

interface Props {
  onStart: (name: string, players: string[]) => void;
  onBack: () => void;
}

export default function CreateTournament({ onStart, onBack }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [players, setPlayers] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLUListElement>(null);

  // Al agregar/quitar, baja el scroll para ver siempre al último duelista.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [players.length]);

  function addPlayer() {
    const n = input.trim();
    if (n && !players.includes(n)) {
      setPlayers([...players, n]);
      setInput('');
    }
  }

  function removePlayer(n: string) {
    setPlayers(players.filter((x) => x !== n));
  }

  return (
    <div className="wiz">
      <div className="steps">
        <div className={`step ${step === 1 ? 'now' : step > 1 ? 'done' : ''}`} onClick={() => setStep(1)}>
          <span className="sn">{step > 1 ? '✓' : '1'}</span>
          <div><b>Datos</b><small>Nombre</small></div>
        </div>
        <div className={`step ${step === 2 ? 'now' : step > 2 ? 'done' : ''}`} onClick={() => setStep(2)}>
          <span className="sn">{step > 2 ? '✓' : '2'}</span>
          <div><b>Duelistas</b><small>Solo el nombre</small></div>
        </div>
        <div className={`step ${step === 3 ? 'now' : ''}`}>
          <span className="sn">3</span>
          <div><b>Revisión</b><small>Confirmar</small></div>
        </div>
      </div>

      <div>
        <div className="step-fade" key={step}>
        {step === 1 && (
          <>
            <div className="field">
              <label>Nombre del torneo</label>
              <div className="input">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Liga OTS Otoño 2026"
                  autoFocus
                />
              </div>
            </div>
            <div className="wfoot">
              <button className="btn btn-ghost" onClick={onBack}>Cancelar</button>
              <button className="btn btn-pri" onClick={() => setStep(2)} disabled={!name.trim()}>
                Continuar →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="field">
              <label>Agregar duelista</label>
              <div className="addrow">
                <div className="input" style={{ flex: 1 }}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addPlayer(); }}
                    placeholder="Nombre del duelista"
                  />
                </div>
                <button className="btn btn-sec" onClick={addPlayer}><IconPlus size={16} /> Agregar</button>
              </div>
              {players.length > 0 ? (
                <ul className="dlist" ref={listRef}>
                  {players.map((n) => (
                    <li className="dl-row" key={n}>
                      <b>{n}</b>
                      <button className="dx" onClick={() => removePlayer(n)}><IconX size={16} /></button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Agrega al menos 2 duelistas.</p>
              )}
              <div className="muted" style={{ marginTop: 8 }}>
                <b style={{ color: '#fff' }}>{players.length}</b> duelistas ·{' '}
                {roundsForPlayerCount(players.length)} rondas (automático)
              </div>
            </div>
            <div className="wfoot">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Volver</button>
              <button className="btn btn-pri" onClick={() => setStep(3)} disabled={players.length < 2}>
                Continuar →
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="wsum">
              <div className="card">
                <div className="row"><span>Nombre</span><b>{name}</b></div>
                <div className="row"><span>Duelistas</span><b>{players.length}</b></div>
                <div className="row"><span>Rondas suizas</span><b>{roundsForPlayerCount(players.length)}</b></div>
                <div className="row"><span>Política</span><b>KDE v2.5</b></div>
              </div>
            </div>
            <div className="field">
              <label>Duelistas ({players.length})</label>
              <ul className="dlist">
                {players.map((n) => (
                  <li className="dl-row" key={n}><b>{n}</b></li>
                ))}
              </ul>
            </div>
            <div className="legend" style={{ marginTop: 0, marginBottom: 16 }}>
              <span>Al iniciar se cierra el registro y se empareja la Ronda 1. <b>No podrán sumarse nuevos duelistas.</b></span>
            </div>
            <button className="btn btn-pri big" style={{ width: '100%' }} onClick={() => onStart(name.trim(), players)}>
              <IconPlay size={16} /> Iniciar torneo
            </button>
            <div className="wfoot">
              <button className="btn btn-ghost" onClick={() => setStep(2)}>← Volver</button>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
