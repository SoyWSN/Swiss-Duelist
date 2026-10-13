import { useEffect, useRef, useState } from 'react';
import type { Match, MatchOutcome, Player, Standing, Tournament } from '@swiss-duelist/engine';
import Standings from '../components/Standings';
import { IconAlert, IconClock, IconX } from '../components/icons';

interface Props {
  tournament: Tournament;
  standings: Standing[];
  clockOn: boolean;
  onRecordResult: (matchId: string, outcome: MatchOutcome) => void;
  onNextRound: () => void;
  onDropPlayer: (playerId: string) => void;
}

function RoundClock({ round, visible }: { round: number; visible: boolean }) {
  const [s, setS] = useState(50 * 60);
  useEffect(() => setS(50 * 60), [round]);
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setS((x) => (x > 0 ? x - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [visible]);
  if (!visible) return null;
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return <span className="chip chip-o chip-live"><IconClock size={14} /> {mm}:{ss}</span>;
}

function HoldButton({ onConfirm, label }: { onConfirm: () => void; label: string }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<number | null>(null);

  function start() {
    setHolding(true);
    timer.current = window.setTimeout(() => {
      setHolding(false);
      onConfirm();
    }, 1000);
  }
  function cancel() {
    setHolding(false);
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }

  return (
    <button
      className={`hold ${holding ? 'holding' : ''}`}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
    >
      <span className="fill" />
      <span>{label}</span>
    </button>
  );
}

function ResultModal({ match, p1, p2, onClose, onSave }: {
  match: Match;
  p1: Player;
  p2: Player | null;
  onClose: () => void;
  onSave: (o: MatchOutcome) => void;
}) {
  const [selected, setSelected] = useState<MatchOutcome | null>(match.outcome);

  return (
    <div className="mback" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="mhead">
          <div>
            <span className="k">Mesa {match.table} · Ronda {match.round}</span>
            <b>{p1.name} vs {p2?.name ?? '—'}</b>
          </div>
          <button className="xbtn" onClick={onClose}><IconX size={16} /></button>
        </div>

        <div className="vsbox">
          <div className="vp"><b>{p1.name}</b></div>
          <div className="vsm">VS</div>
          <div className="vp"><b>{p2?.name ?? '—'}</b></div>
        </div>

        <div className="mlab">Resultado de la partida</div>
        <div className="outs">
          <button className={`out ${selected === 'P1_WIN' ? 'sel' : ''}`} onClick={() => setSelected('P1_WIN')}>
            <b>Gana {p1.name}</b>
          </button>
          <button className={`out ${selected === 'P2_WIN' ? 'sel' : ''}`} onClick={() => setSelected('P2_WIN')}>
            <b>Gana {p2?.name}</b>
          </button>
          <button
            className={`out dl ${selected === 'DOUBLE_LOSS' ? 'sel' : ''}`}
            onClick={() => setSelected('DOUBLE_LOSS')}
            title="0 puntos para ambos · castiga el OMW de los dos"
          >
            <IconAlert size={16} />
            <b>Doble Loss</b>
          </button>
        </div>

        <div className="mfoot2">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-pri" onClick={() => selected && onSave(selected)} disabled={!selected}>
            Guardar resultado
          </button>
        </div>
      </div>
    </div>
  );
}

function NextRoundModal({ matches, nameOf, isLastRound, onCancel, onConfirm }: {
  matches: Match[];
  nameOf: (id: string | null) => string;
  isLastRound: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="mback" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="mhead">
          <div>
            <span className="k">Cierre de ronda</span>
            <b>Resultados de la ronda</b>
          </div>
          <button className="xbtn" onClick={onCancel}><IconX size={16} /></button>
        </div>
        <p className="muted" style={{ marginBottom: 12 }}>Verifica cada resultado antes de avanzar.</p>
        <div className="rlist">
          {matches.map((m) => {
            if (m.outcome === 'BYE') {
              return (
                <div className="rrow bye" key={m.id}>
                  <span className="rn">BYE</span>
                  <b>{nameOf(m.player1Id)}</b>
                  <span className="rr">+3 pts</span>
                  <span className="chip chip-info">BYE</span>
                </div>
              );
            }
            if (m.outcome === 'DOUBLE_LOSS') {
              return (
                <div className="rrow dl" key={m.id}>
                  <span className="rn">M{m.table}</span>
                  <b>Doble Loss</b>
                  <span className="rr">{nameOf(m.player1Id)} / {nameOf(m.player2Id)}</span>
                  <span className="chip chip-bad">DL</span>
                </div>
              );
            }
            const winner = m.outcome === 'P1_WIN' ? nameOf(m.player1Id) : nameOf(m.player2Id);
            return (
              <div className="rrow" key={m.id}>
                <span className="rn">M{m.table}</span>
                <b>{winner}</b>
                <span className="rr">gana</span>
                <span className="chip chip-o">✓</span>
              </div>
            );
          })}
        </div>
        <HoldButton
          onConfirm={onConfirm}
          label={isLastRound ? 'Mantén presionado para finalizar' : 'Mantén presionado para cerrar la ronda'}
        />
        <div className="mfoot2"><button className="btn btn-ghost" onClick={onCancel}>Cancelar</button></div>
      </div>
    </div>
  );
}

export default function TournamentView({ tournament, standings, clockOn, onRecordResult, onNextRound, onDropPlayer }: Props) {
  const [tab, setTab] = useState<'ronda' | 'clasi'>('ronda');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const nameOf = (id: string | null): string =>
    id ? tournament.players.find((p) => p.id === id)?.name ?? '—' : '—';
  const ptsOf = (id: string | null): number =>
    standings.find((s) => s.player.id === id)?.points ?? 0;

  const currentMatches = tournament.matches.filter((m) => m.round === tournament.currentRound);
  const reported = currentMatches.filter((m) => m.outcome !== null).length;
  const roundComplete = currentMatches.every((m) => m.outcome !== null);
  const isLastRound = tournament.currentRound >= tournament.totalRounds;

  const editingMatch = tournament.matches.find((m) => m.id === editingId) ?? null;
  const p1 = editingMatch ? tournament.players.find((p) => p.id === editingMatch.player1Id) ?? null : null;
  const p2 = editingMatch ? tournament.players.find((p) => p.id === editingMatch.player2Id) ?? null : null;

  return (
    <>
      <div className="tour-head">
        <div className="tt">
          {tournament.name}
          <small>ronda {tournament.currentRound} de {tournament.totalRounds}</small>
        </div>
        <RoundClock round={tournament.currentRound} visible={clockOn} />
        <span className="chip chip-ok">{reported}/{currentMatches.length} reportadas</span>
        <div className="sp2">
          <button className="btn btn-pri" onClick={() => setConfirming(true)} disabled={!roundComplete}>
            {isLastRound ? 'Finalizar torneo' : 'Siguiente ronda'}
          </button>
        </div>
      </div>

      <div className="subt">
        <button className={tab === 'ronda' ? 'on' : ''} onClick={() => setTab('ronda')}>Ronda actual</button>
        <button className={tab === 'clasi' ? 'on' : ''} onClick={() => setTab('clasi')}>Clasificación</button>
      </div>

      {tab === 'ronda' ? (
        <div className="mesas">
          {currentMatches.filter((m) => m.outcome !== 'BYE').map((m) => {
            const a = tournament.players.find((p) => p.id === m.player1Id);
            const b = tournament.players.find((p) => p.id === m.player2Id);
            return (
              <div className={`mesa ${m.outcome ? 'done' : ''}`} key={m.id}>
                <div className="mtop">
                  <span className="mn">MESA {m.table}</span>
                  {m.outcome === null ? (
                    <span className="chip chip-mut">PENDIENTE</span>
                  ) : m.outcome === 'DOUBLE_LOSS' ? (
                    <span className="chip chip-bad">DOBLE LOSS</span>
                  ) : (
                    <span className="chip chip-ok">✓ {nameOf(m.outcome === 'P1_WIN' ? m.player1Id : m.player2Id)}</span>
                  )}
                </div>
                <div className="mvs">
                  <div className="mp"><b>{a?.name}</b><small>{ptsOf(a?.id ?? null)} pts</small></div>
                  <div className="vsline">VS</div>
                  <div className="mp"><b>{b?.name}</b><small>{ptsOf(b?.id ?? null)} pts</small></div>
                </div>
                <div className="mfoot">
                  <span />
                  <button className="btn btn-sec" onClick={() => setEditingId(m.id)}>
                    {m.outcome ? 'Corregir' : 'Registrar'}
                  </button>
                </div>
              </div>
            );
          })}
          {currentMatches.filter((m) => m.outcome === 'BYE').map((m) => {
            const a = tournament.players.find((p) => p.id === m.player1Id);
            return (
              <div className="mesa bye" key={m.id}>
                <div className="mtop"><span className="mn">BYE</span><span className="chip chip-info">BYE</span></div>
                <div className="mvs"><div className="mp"><b>{a?.name}</b><small>3 pts</small></div></div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <Standings standings={standings} onDrop={onDropPlayer} />
          <div className="legend">
            <span><b>Orden (KDE v2.5):</b> Puntos → OMW% → OOMW%. El doble loss (DL) da 0 puntos y arrastra el OMW%.</span>
          </div>
        </>
      )}

      {editingMatch && p1 && (
        <ResultModal
          match={editingMatch}
          p1={p1}
          p2={p2}
          onClose={() => setEditingId(null)}
          onSave={(o) => { onRecordResult(editingMatch.id, o); setEditingId(null); }}
        />
      )}

      {confirming && (
        <NextRoundModal
          matches={currentMatches}
          nameOf={nameOf}
          isLastRound={isLastRound}
          onCancel={() => setConfirming(false)}
          onConfirm={() => { setConfirming(false); onNextRound(); }}
        />
      )}
    </>
  );
}
