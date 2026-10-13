import type { TournamentSummary } from '../db/repo';
import { IconPlus, IconTrophy } from '../components/icons';

interface Props {
  summaries: TournamentSummary[];
  onCreate: () => void;
  onOpen: (id: string) => void;
}

export default function TournamentsList({ summaries, onCreate, onOpen }: Props) {
  return (
    <>
      <div className="home-head">
        <h2>Torneos</h2>
        <button className="btn btn-pri" onClick={onCreate}>
          <IconPlus size={16} /> Nuevo torneo
        </button>
      </div>

      {summaries.length === 0 ? (
        <div className="empty">
          <IconTrophy className="empty-icon" size={44} />
          <h3>No hay torneos</h3>
          <p>Crea tu primer torneo para empezar.</p>
          <button className="btn btn-pri" onClick={onCreate}>
            <IconPlus size={16} /> Crear torneo
          </button>
        </div>
      ) : (
        <div className="recent-grid">
          {summaries.map((s) => {
            const running = s.status !== 'finished';
            return (
              <div className="card rcard" key={s.id} onClick={() => onOpen(s.id)}>
                <div className="rhead">
                  <div>
                    <b>{s.name}</b>
                    <small>
                      {new Date(s.createdAt).toLocaleDateString()} · {s.playerCount} duelistas
                      {running ? ` · Ronda ${s.currentRound} de ${s.totalRounds}` : ` · ${s.totalRounds} rondas`}
                    </small>
                  </div>
                  <span className={`chip ${running ? 'chip-o chip-live' : 'chip-ok'}`}>
                    {running ? 'EN CURSO' : 'FINALIZADO'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
