import { useState } from 'react';
import type { TournamentSummary } from '../db/repo';
import ConfirmDialog from '../components/ConfirmDialog';
import { IconPlus, IconTrash } from '../components/icons';

interface Props {
  summaries: TournamentSummary[];
  onCreate: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function Home({ summaries, onCreate, onOpen, onDelete }: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const target = summaries.find((s) => s.id === deleteId) ?? null;

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
          <img className="empty-art" src="/uuy.png" alt="" />
          <h3>No hay torneos todavía</h3>
          <p>Crea tu primer torneo y empieza a emparejar.</p>
          <button className="btn btn-pri" onClick={onCreate}>
            <IconPlus size={16} /> Crear torneo
          </button>
        </div>
      ) : (
        <>
          <img className="bg-art" src="/fuwa.png" alt="" />
          <div className="layer">
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
              <div className="rfoot">
                <button className="link" style={{ marginTop: 0 }}>Abrir torneo →</button>
                <button
                  className="rdel"
                  title="Borrar torneo"
                  onClick={(e) => { e.stopPropagation(); setDeleteId(s.id); }}
                >
                  <IconTrash size={15} />
                </button>
              </div>
            </div>
          ))}
          </div>
          </div>
        </>
      )}

      {target && (
        <ConfirmDialog
          title="¿Borrar torneo?"
          message={`Se eliminará "${target.name}" de tu historial. Esta acción no se puede deshacer.`}
          confirmLabel="Sí, borrar"
          danger
          onConfirm={() => { onDelete(target.id); setDeleteId(null); }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
}
