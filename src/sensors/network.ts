export interface NetworkInfo {
  effectiveType: string;
  type: string;
  downlink: number;
  downlinkMax: number;
  rtt: number;
  saveData: boolean;
}

export type NetworkCallback = (info: NetworkInfo) => void;

type NetworkConnection = NetworkInfo & EventTarget;

export function startNetwork(onUpdate: NetworkCallback): () => void {
  const conn = (navigator as Navigator & { connection?: NetworkConnection }).connection;

  if (!conn) {
    onUpdate({ effectiveType: 'N/A', type: 'unknown', downlink: 0, downlinkMax: 0, rtt: 0, saveData: false });
    return () => {};
  }

  const read = (): void => onUpdate({
    effectiveType: conn.effectiveType,
    type: conn.type ?? 'unknown',
    downlink: conn.downlink,
    downlinkMax: conn.downlinkMax ?? 0,
    rtt: conn.rtt,
    saveData: conn.saveData,
  });

  conn.addEventListener('change', read);
  const intervalId = setInterval(read, 2000);
  read();

  return () => {
    conn.removeEventListener('change', read);
    clearInterval(intervalId);
  };
}
