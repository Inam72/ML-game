import Peer from 'peerjs';

// Browser-to-browser play over WebRTC. There is no game server: the host runs
// the rules and the guest sends intents, so this deploys as a static site.

const ROOM_PREFIX = 'ai-architect-duel-';
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no look-alike characters

export const makeRoomCode = () =>
  Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

function explain(err) {
  switch (err?.type) {
    case 'peer-unavailable':
      return 'No duel found with that code. Check the letters and make sure your friend is still waiting.';
    case 'unavailable-id':
      return 'That room code is already taken. Try hosting again.';
    case 'browser-incompatible':
      return 'This browser cannot do peer-to-peer play. Try Chrome, Edge or Firefox.';
    case 'network':
    case 'server-error':
    case 'socket-error':
    case 'socket-closed':
      return 'Lost contact with the matchmaking service. Check your connection and try again.';
    default:
      return 'Connection failed. Some school and office networks block peer-to-peer play.';
  }
}

function wire(conn, emit) {
  conn.on('open', () => emit({ type: 'CONNECTED' }));
  conn.on('data', (data) => emit({ type: 'DATA', data }));
  conn.on('close', () => emit({ type: 'DISCONNECTED' }));
  conn.on('error', (err) => emit({ type: 'ERROR', message: explain(err) }));
}

export function hostRoom(emit) {
  const code = makeRoomCode();
  const peer = new Peer(ROOM_PREFIX + code, { debug: 0 });
  let conn = null;

  peer.on('open', () => emit({ type: 'ROOM_OPEN', code }));
  peer.on('error', (err) => emit({ type: 'ERROR', message: explain(err) }));
  peer.on('connection', (incoming) => {
    if (conn?.open) {
      incoming.close(); // duels are strictly one-on-one
      return;
    }
    conn = incoming;
    wire(conn, emit);
  });

  return {
    code,
    send: (msg) => conn?.open && conn.send(msg),
    close: () => {
      conn?.close();
      peer.destroy();
    }
  };
}

export function joinRoom(code, emit) {
  const peer = new Peer({ debug: 0 });
  let conn = null;

  peer.on('open', () => {
    conn = peer.connect(ROOM_PREFIX + code.trim().toUpperCase(), { reliable: true });
    wire(conn, emit);
  });
  peer.on('error', (err) => emit({ type: 'ERROR', message: explain(err) }));

  return {
    code,
    send: (msg) => conn?.open && conn.send(msg),
    close: () => {
      conn?.close();
      peer.destroy();
    }
  };
}
