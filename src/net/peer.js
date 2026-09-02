import Peer from 'peerjs';

// Browser-to-browser play over WebRTC. There is no game server: the host runs
// the rules and the guest sends intents, so this deploys as a static site.
//
// The broker only keeps a room registered while the hosting tab holds its
// socket open, and browsers throttle background tabs hard enough to drop it.
// Everything below exists to keep that registration alive and to retry when a
// guest arrives a moment too early.

const ROOM_PREFIX = 'ai-architect-duel-';
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no look-alike characters
const JOIN_ATTEMPTS = 4;
const JOIN_RETRY_MS = 1600;

export const makeRoomCode = () =>
  Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

function explain(err) {
  switch (err?.type) {
    case 'peer-unavailable':
      return 'No duel found with that code. Check the letters, and make sure the host still has their tab open and awake.';
    case 'unavailable-id':
      return 'That room code is already taken. Try hosting again.';
    case 'browser-incompatible':
      return 'This browser cannot do peer-to-peer play. Try Chrome, Edge or Firefox.';
    case 'network':
    case 'server-error':
    case 'socket-error':
    case 'socket-closed':
      return 'Lost contact with the matchmaking service. Check your connection and try again.';
    case 'webrtc':
      return 'The direct connection failed. Some school and office networks block peer-to-peer traffic.';
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

// A dropped broker socket does not close existing data channels, but it does
// unregister the id so nobody new can find the room. Reconnect whenever the
// browser gives us a chance.
function keepAlive(peer, emit) {
  const revive = () => {
    if (peer.destroyed || !peer.disconnected) return;
    emit({ type: 'RECONNECTING' });
    try {
      peer.reconnect();
    } catch {
      /* peer is already gone */
    }
  };

  peer.on('disconnected', revive);

  const onVisible = () => document.visibilityState === 'visible' && revive();
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('online', revive);
  window.addEventListener('focus', onVisible);

  return () => {
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('online', revive);
    window.removeEventListener('focus', onVisible);
  };
}

export function hostRoom(emit) {
  const code = makeRoomCode();
  const peer = new Peer(ROOM_PREFIX + code, { debug: 0 });
  let conn = null;

  const stopKeepAlive = keepAlive(peer, emit);

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
      stopKeepAlive();
      conn?.close();
      peer.destroy();
    }
  };
}

export function joinRoom(code, emit) {
  const target = ROOM_PREFIX + code.trim().toUpperCase();
  const peer = new Peer({ debug: 0 });
  const stopKeepAlive = keepAlive(peer, emit);

  let conn = null;
  let attempt = 0;
  let retryTimer = null;
  let settled = false;

  const attach = (c) => {
    conn = c;
    c.on('open', () => {
      settled = true;
      clearTimeout(retryTimer);
      emit({ type: 'CONNECTED' });
    });
    c.on('data', (data) => emit({ type: 'DATA', data }));
    c.on('close', () => emit({ type: 'DISCONNECTED' }));
    c.on('error', (err) => emit({ type: 'ERROR', message: explain(err) }));
  };

  // The host may be mid-reconnect when we arrive, so a miss is worth retrying
  // before we tell the player the room does not exist.
  const tryConnect = () => {
    if (settled || peer.destroyed) return;
    attempt += 1;
    emit({ type: 'JOINING', attempt, of: JOIN_ATTEMPTS });
    attach(peer.connect(target, { reliable: true }));

    retryTimer = setTimeout(() => {
      if (settled) return;
      if (attempt < JOIN_ATTEMPTS) {
        tryConnect();
      } else {
        emit({ type: 'ERROR', message: explain({ type: 'peer-unavailable' }) });
      }
    }, JOIN_RETRY_MS);
  };

  peer.on('open', tryConnect);
  peer.on('error', (err) => {
    if (err?.type === 'peer-unavailable') {
      if (attempt < JOIN_ATTEMPTS) return; // the retry timer handles it
      emit({ type: 'ERROR', message: explain(err) });
      return;
    }
    emit({ type: 'ERROR', message: explain(err) });
  });

  return {
    code,
    send: (msg) => conn?.open && conn.send(msg),
    close: () => {
      settled = true;
      clearTimeout(retryTimer);
      stopKeepAlive();
      conn?.close();
      peer.destroy();
    }
  };
}
