import type { ReactNode } from 'react';

const ROOM_CLASS: Record<string, string> = {
  entry: 'room-entry',
  auth: 'room-auth',
  lobby: 'room-lobby',
  archive: 'room-archive',
  open: 'room-open',
  evidence: 'room-evidence',
  forensics: 'room-forensics',
  interrogate: 'room-interrogate',
  deduction: 'room-deduction',
  reconstruction: 'room-reconstruction',
  closed: 'room-closed',
};

export default function RoomAtmosphere({ room, children }: { room: keyof typeof ROOM_CLASS; children: ReactNode }) {
  return <div className={`room-shell ${ROOM_CLASS[room] ?? ''}`}>{children}</div>;
}
