import { useState } from 'react';
import type { Standing, Tournament } from '@swiss-duelist/engine';
import Standings from '../components/Standings';
import ConfirmDialog from '../components/ConfirmDialog';
import { IconSave, IconTrash, IconTrophy } from '../components/icons';

interface Props {
  tournament: Tournament;
  standings: Standing[];
  onSave: () => void;
  onDiscard: () => void;
}

export default function FinalView({ tournament, standings, onSave, onDiscard }: Props) {
  const [first, second, third] = standings.slice(0, 3);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  return (
    <>
      <div className="tour-head">
        <div className="tt">
          {tournament.name}
          <small>
            finalizada · {tournament.totalRounds} rondas · {tournament.players.length} duelistas ·{' '}
            {new Date(tournament.createdAt).toLocaleDateString()}
          </small>
        </div>
        <span className="chip chip-ok">Torneo finalizado</span>
        <div className="sp2">
          <button className="btn btn-ghost" onClick={() => setConfirmDiscard(true)}>
            <IconTrash size={16} /> Descartar
          </button>
          <button className="btn btn-pri" onClick={onSave}>
            <IconSave size={16} /> Guardar torneo
          </button>
        </div>
      </div>

      {first && second && third && (
        <div className="podium">
          <div className="pod pod2">
            <small>2º lugar</small>
            <b>{second.player.name}</b>
            <span>{second.points} pts · {second.wins}–{second.losses}</span>
          </div>
          <div className="pod pod1">
            <small><IconTrophy size={12} /> Campeón</small>
            <b>{first.player.name}</b>
            <span>{first.points} pts · {first.wins}–{first.losses}</span>
          </div>
          <div className="pod pod3">
            <small>3er lugar</small>
            <b>{third.player.name}</b>
            <span>{third.points} pts · {third.wins}–{third.losses}</span>
          </div>
        </div>
      )}

      <Standings standings={standings} final />

      {confirmDiscard && (
        <ConfirmDialog
          title="¿Descartar el torneo?"
          message="Se borrará este torneo y no aparecerá en tu historial. Esta acción no se puede deshacer."
          confirmLabel="Sí, descartar"
          danger
          onConfirm={onDiscard}
          onCancel={() => setConfirmDiscard(false)}
        />
      )}
    </>
  );
}
