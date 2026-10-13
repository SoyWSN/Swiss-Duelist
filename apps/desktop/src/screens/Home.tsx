import type { TournamentSummary } from '../db/repo';
import { IconPlus, IconTrophy } from '../components/icons';

interface Props {
  summaries: TournamentSummary[];
  onCreate: () => void;
  onOpen: (id: string) => void;
}

export default function Home({ summaries, onCreate, onOpen }: Props) {
  return (
    <>
      <div className="home-head">
        <h2>Tus torneos</h2>
        <button className="btn btn-pri" onClick={onCreate}>
          <IconPlus size={16} /> Nuevo torneo
        </button>
      </div>

      {summaries.length === 0 ? (
        <div className="empty">
          <IconTrophy className="empty-icon" size={44} />
          <h3>No hay torneos todavía</h3>
          <p>Crea tu primer torneo y empieza a emparejar.</p>
          <button className="btn btn-pri" onClick={onCreate}>
            <IconPlus size={16} /> Crear torneo
          </button>
        </div>
      ) : (
        <div className="recent-grid">
          {summaries.map((s) => (
            <div className="card rcard" key={s.id} onClick={() => onOpen(s.id)}>
              <div className="rhead">
                <div>
                  <b>{s.name}</b>
                  <small>
                    {new Date(s.createdAt).toLocaleDateString()} · {s.playerCount} duelistas ·{' '}
                    {s.totalRounds} rondas
                  </small>
                </div>
                <span className={`chip ${s.status === 'finished' ? 'chip-ok' : 'chip-o'}`}>
                  {s.status === 'finished' ? 'Finalizado' : 'En curso'}
                </span>
              </div>
              <button className="link">Abrir torneo →</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
