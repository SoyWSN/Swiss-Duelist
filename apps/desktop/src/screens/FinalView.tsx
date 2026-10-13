import type { Standing, Tournament } from '@swiss-duelist/engine';
import Standings from '../components/Standings';

interface Props {
  tournament: Tournament;
  standings: Standing[];
  onSave: () => void;
}

export default function FinalView({ tournament, standings, onSave }: Props) {
  const [first, second, third] = standings.slice(0, 3);

  return (
    <>
      <div className="tour-head">
        <div className="tt">
          {tournament.name}
          <small>finalizada · {tournament.totalRounds} rondas · {tournament.players.length} duelistas</small>
        </div>
        <span className="chip chip-ok">Torneo finalizado</span>
        <div className="sp2">
          <button className="btn btn-pri" onClick={onSave}>💾 Guardar torneo</button>
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
            <small>🏆 Campeón</small>
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
    </>
  );
}
