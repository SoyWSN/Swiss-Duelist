import type { Standing } from '@swiss-duelist/engine';
import { IconX } from './icons';

interface Props {
  standings: Standing[];
  /** Si se pasa, muestra el botón de retirar en cada fila activa. */
  onDrop?: (playerId: string) => void;
  /** Marca el podio (top 3) con colores. */
  final?: boolean;
}

export default function Standings({ standings, onDrop, final }: Props) {
  const showDrop = Boolean(onDrop);
  return (
    <div className="card" style={{ padding: '6px 14px' }}>
      <table className="tbl">
        <thead>
          <tr>
            <th>#</th>
            <th>Duelista</th>
            <th className="num">Pts</th>
            <th className="num">Récord</th>
            <th className="num">PMW%</th>
            <th className="num">OMW%</th>
            <th className="num">OOMW%</th>
            {showDrop && <th></th>}
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => {
            const podium = final && s.rank <= 3;
            return (
              <tr
                key={s.player.id}
                className={podium ? `r${s.rank}` : s.player.dropped ? 'mut' : ''}
              >
                <td>
                  <span className={`rank ${podium ? `r${s.rank}` : 'rn'}`}>{s.rank}</span>
                </td>
                <td>
                  <b>{s.player.name}</b>{' '}
                  {s.doubleLosses > 0 && <span className="chip chip-bad">DL ×{s.doubleLosses}</span>}{' '}
                  {s.player.dropped && <span className="chip chip-mut">Retirado</span>}
                </td>
                <td className="num"><b>{s.points}</b></td>
                <td className="num rec">{s.wins}–{s.losses}</td>
                <td className="num">{(s.matchWinPct * 100).toFixed(1)}</td>
                <td className="num">{(s.omw * 100).toFixed(1)}</td>
                <td className="num">{(s.oomw * 100).toFixed(1)}</td>
                {showDrop && (
                  <td>
                    {!s.player.dropped ? (
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '5px 8px' }}
                        title="Marcar como retirado (drop)"
                        onClick={() => onDrop!(s.player.id)}
                      >
                        <IconX size={14} />
                      </button>
                    ) : null}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
