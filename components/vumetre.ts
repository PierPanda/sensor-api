import { VU_BAR_COUNT } from '~/constant';

export function initVuMeter(): HTMLDivElement[] {
  const container = document.getElementById('vumeter')!;
  const bars: HTMLDivElement[] = [];
  
  for (let i = 0; i < VU_BAR_COUNT; i++) {
    const bar = document.createElement('div');
    bar.className = 'w-3 rounded-sm transition-all duration-75';
    bar.style.height = '4px';
    bar.style.backgroundColor = '#1e1e30';
    container.appendChild(bar);
    bars.push(bar);
  }
  
  return bars;
}

export function updateVuMeter(bars: HTMLDivElement[], normalized: number): void {
  const activeCount = Math.round(normalized * VU_BAR_COUNT);
  
  bars.forEach((bar, i) => {
    const isActive = i < activeCount;
    const ratio = i / VU_BAR_COUNT;
    
    let color: string;
    if (ratio < 0.6) {
      color = '#a78bfa'; 
    } else if (ratio < 0.85) {
      color = '#fbbf24'; 
    } else {
      color = '#ef4444';
    }
    
    bar.style.height = isActive ? `${20 + (i / VU_BAR_COUNT) * 108}px` : '4px';
    bar.style.backgroundColor = isActive ? color : '#1e1e30';
  });
}