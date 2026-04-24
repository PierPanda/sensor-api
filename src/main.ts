import { startAudio } from './sensors/audio';
import { startLight } from './sensors/camera';
import { startNetwork } from './sensors/network';
import type { NetworkInfo } from './sensors/network';
import { initVuMeter, updateVuMeter } from 'components/vumetre';
import { TABS, TAB_COLORS, TYPE_LABELS, type Tab, NETWORK_LABELS, GAUGE_C } from './constant';
import './style.css';

function setGauge(id: string, normalized: number): void {
  const el = document.getElementById(id) as SVGCircleElement | null;
  if (el) el.style.strokeDashoffset = String(GAUGE_C * (1 - Math.max(0, Math.min(1, normalized))));
}

function createSparkline(canvas: HTMLCanvasElement, color: string): (value: number) => void {
  const data: number[] = [];
  const MAX = 60;

  function draw(): void {
    const { width, height } = canvas;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, width, height);
    if (data.length < 2) return;

    const max = Math.max(...data, 0.01);
    const min = Math.min(...data);
    const range = max - min || 1;

    const steps = data.length - 1;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / steps) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = color + '22';
    ctx.fill();
  }

  return (value: number): void => {
    data.push(value);
    if (data.length > MAX) data.shift();
    draw();
  };
}

function formatDownlink(mbps: number): string {
  if (mbps === 0) return '—';
  if (mbps < 1) return `${Math.round(mbps * 1000)} kbps`;
  if (mbps < 10) return `${mbps.toFixed(2)} Mbps`;
  return `${mbps.toFixed(1)} Mbps`;
}

let maxDownlink = 0.1;

function updateNetworkUI(info: NetworkInfo): void {
  const badge = document.getElementById('net-type')!;
  badge.textContent = NETWORK_LABELS[info.effectiveType] ?? info.effectiveType;
  badge.dataset.type = info.effectiveType;

  const typeRow = document.getElementById('row-conn-type')!;
  const typeLabel = TYPE_LABELS[info.type];
  if (typeLabel && info.type !== 'unknown') {
    typeRow.style.display = 'flex';
    document.getElementById('val-conn-type')!.textContent = typeLabel;
  } else {
    typeRow.style.display = 'none';
  }

  if (info.downlink > maxDownlink) maxDownlink = info.downlink;

console.log('Downlink:', info.downlink, 'Mbps, max observed:', maxDownlink, 'Mbps');

  (document.getElementById('bar-downlink') as HTMLElement).style.width =
    `${(info.downlink / maxDownlink) * 100}%`;
  document.getElementById('val-downlink')!.textContent = formatDownlink(info.downlink);
  document.getElementById('val-max-downlink')!.textContent = `max ${formatDownlink(maxDownlink)}`;
  document.getElementById('val-downlink-max')!.textContent = info.downlinkMax > 0 ? `Théorique : ${formatDownlink(info.downlinkMax)}` : '';
  document.getElementById('val-rtt')!.textContent = `${info.rtt} ms`;
  (document.getElementById('bar-rtt') as HTMLElement).style.width =`${Math.max(0, 100 - (info.rtt / 500) * 100)}%`;
  document.getElementById('net-save')!.textContent =
    info.saveData ? '⚡ Mode économie activé' : '';
}

function switchTab(active: Tab): void {
  TABS.forEach(tab => {
    const panel = document.getElementById(`panel-${tab}`)!;
    const btn   = document.getElementById(`tab-${tab}`)!;
    const isActive = tab === active;

    panel.style.display = isActive ? 'flex' : 'none';

    btn.style.color       = isActive ? TAB_COLORS[tab] : '';
    btn.style.borderColor = isActive ? TAB_COLORS[tab] : 'transparent';
  });
}

function main(): void {
  TABS.forEach(tab => {
    document.getElementById(`tab-${tab}`)!.addEventListener('click', () => switchTab(tab));
  });
  switchTab('audio');

  const vuBars = initVuMeter();
  const pushAudio  = createSparkline(document.getElementById('spark-audio')  as HTMLCanvasElement, TAB_COLORS.audio);
  const pushCamera = createSparkline(document.getElementById('spark-camera') as HTMLCanvasElement, TAB_COLORS.camera);

  startNetwork((info) => {updateNetworkUI(info)});

  let stopAudio: (() => void) | null = null;
  let stopLight: (() => void) | null = null;

  const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
  const stopBtn = document.getElementById('stop-btn') as HTMLButtonElement;

  startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    startBtn.textContent = 'Connexion…';

    try {
      [stopAudio, stopLight] = await Promise.all([
        startAudio((db, normalized) => {
          document.getElementById('val-audio')!.textContent = String(db);
          updateVuMeter(vuBars, normalized);
          pushAudio(normalized);
        }),
        startLight((lux, normalized) => {
          document.getElementById('val-camera')!.textContent = String(lux);
          setGauge('gauge-camera', normalized);
          pushCamera(normalized);
        }),
      ]);

      startBtn.classList.add('hidden');
      stopBtn.classList.remove('hidden');
    } catch (err) {
      console.error('Erreur capteurs:', err);
      startBtn.disabled = false;
      startBtn.textContent = 'Erreur — Réessayer';
    }
  });

  stopBtn.addEventListener('click', () => {
    if (stopAudio) stopAudio();
    if (stopLight) stopLight();
    stopAudio = null;
    stopLight = null;

    stopBtn.classList.add('hidden');
    startBtn.classList.remove('hidden');
    startBtn.disabled = false;
    startBtn.textContent = 'Démarrer les capteurs';
  });
}

main();
