import { useEffect, useRef, useState } from 'react';
import { roundsForPlayerCount } from '@swiss-duelist/engine';
import { IconAlert, IconPlay, IconPlus, IconX } from '../components/icons';

/** Estado persistente del asistente (sobrevive al cambiar de pestaña). */
export interface Draft {
  step: number;
  name: string;
  players: string[];
}

/** Arte decorativo por paso del asistente. */
const ART: Record<number, string> = { 1: '/wiz-1.png', 2: '/wiz-2.png', 3: '/wiz-3.png' };

interface Props {
  draft: Draft;
  onDraftChange: (draft: Draft) => void;
  onStart: (name: string, players: string[]) => void;
  onBack: () => void;
}

export default function CreateTournament({ draft, onDraftChange, onStart, onBack }: Props) {
  const { step, name, players } = draft;
  const [input, setInput] = useState('');
  const [nameError, setNameError] = useState(false);
  const [dupError, setDupError] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  function update(patch: Partial<Draft>) {
    onDraftChange({ ...draft, ...patch });
  }

  // Al agregar/quitar, baja el scroll para ver siempre al último duelista.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [players.length]);

  function addPlayer() {
    const n = input.trim();
    if (!n) return;
    if (players.includes(n)) {
      setDupError(true);
      return;
    }
    setDupError(false);
    update({ players: [...players, n] });
    setInput('');
  }

  function goToStep(n: number) {
    if (n > step) {
      if (n >= 2 && !name.trim()) { setNameError(true); return; }
      if (n >= 3 && players.length < 2) return;
    }
    update({ step: n });
  }

  function removePlayer(n: string) {
    update({ players: players.filter((x) => x !== n) });
  }

  return (
    <>
      <img className={`bg-art${step === 1 ? ' bg-art-lg' : ''}`} key={`art-${step}`} src={ART[step]} alt="" />
      <div className="wiz">
        <div className="steps">
          <div className={`step ${step === 1 ? 'now' : step > 1 ? 'done' : ''}`} onClick={() => goToStep(1)}>
            <span className="sn">{step > 1 ? '✓' : '1'}</span>
            <div><b>Datos</b><small>Nombre</small></div>
          </div>
          <div className={`step ${step === 2 ? 'now' : step > 2 ? 'done' : ''}`} onClick={() => goToStep(2)}>
            <span className="sn">{step > 2 ? '✓' : '2'}</span>
            <div><b>Duelistas</b><small>Solo el nombre</small></div>
          </div>
          <div className={`step ${step === 3 ? 'now' : ''}`}>
            <span className="sn">3</span>
            <div><b>Resumen</b><small>Confirmar</small></div>
          </div>
        </div>

        <div className="wiz-main">
          <div className="step-fade" key={step}>
          {step === 1 && (
            <>
              <div className="field">
                <label>Nombre del torneo</label>
                <div className="input">
                  <input
                    value={name}
                    maxLength={40}
                    onChange={(e) => { update({ name: e.target.value }); setNameError(false); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') goToStep(2); }}
                    placeholder="Ej. Liga OTS Otoño 2026"
                    autoFocus
                  />
                </div>
                {nameError && !name.trim() && (
                  <p className="error"><IconAlert size={14} /> El torneo necesita un nombre.</p>
                )}
              </div>
              <div className="wfoot">
                <button className="btn btn-ghost" onClick={onBack}>Cancelar</button>
                <button className="btn btn-pri" onClick={() => goToStep(2)}>Continuar →</button>
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
                      maxLength={25}
                      onChange={(e) => { setInput(e.target.value); setDupError(false); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') addPlayer(); }}
                      placeholder="Nombre del duelista"
                    />
                  </div>
                  <button className="btn btn-sec" onClick={addPlayer}><IconPlus size={16} /> Agregar</button>
                </div>
                {dupError && (
                  <p className="error"><IconAlert size={14} /> Ya hay un participante con ese nombre.</p>
                )}
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
                <button className="btn btn-ghost" onClick={() => update({ step: 1 })}>← Volver</button>
                <button className="btn btn-pri" onClick={() => update({ step: 3 })} disabled={players.length < 2}>Continuar →</button>
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
              <button className="btn btn-pri big" onClick={() => onStart(name.trim(), players)}>
                <IconPlay size={16} /> Iniciar torneo
              </button>
              <div className="wfoot">
                <button className="btn btn-ghost" onClick={() => update({ step: 2 })}>← Volver</button>
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </>
  );
}
