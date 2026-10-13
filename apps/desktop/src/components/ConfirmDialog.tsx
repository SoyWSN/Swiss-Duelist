import { IconX } from './icons';

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel }: Props) {
  return (
    <div className="mback" onClick={onCancel}>
      <div className="modal" style={{ width: 'min(430px, 100%)' }} onClick={(e) => e.stopPropagation()}>
        <div className="mhead">
          <div><b>{title}</b></div>
          <button className="xbtn" onClick={onCancel}><IconX size={16} /></button>
        </div>
        <p className="muted" style={{ marginBottom: 18 }}>{message}</p>
        <div className="mfoot2">
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button className={`btn ${danger ? 'btn-dl' : 'btn-pri'}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
