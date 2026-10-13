import type { TournamentSummary } from '../db/repo';

interface Props {
  summaries: TournamentSummary[];
  onCreate: () => void;
  onOpen: (id: string) => void;
}

export default function Home({ summaries, onCreate, onOpen }: Props) {
  return (
    <>
      <div className="hero">
        <h2>
          Organiza tu torneo,
          <br />
          de la lista de duelistas <em>al podio</em>.
        </h2>
        <p>
          Emparejamientos suizos automáticos, desempates oficiales KDE v2.5 con doble loss, y una
          clasificación que se mantiene sola. Sin cuentas, sin web.
        </p>
        <button className="btn btn-pri big" onClick={onCreate}>
          ➕ Crear torneo
        </button>
      </div>

      <div className="recents">
        <h3>Torneos recientes</h3>
        {summaries.length === 0 ? (
          <p className="muted">Aún no hay torneos. Crea el primero para empezar.</p>
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
      </div>
    </>
  );
}
