export type AudioCallback = (db: number, normalized: number) => void;

export async function startAudio(onUpdate: AudioCallback): Promise<() => void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.8;
  audioContext.createMediaStreamSource(stream).connect(analyser);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  let rafId: number;

  const tick = (): void => {
    rafId = requestAnimationFrame(tick);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const n = dataArray[i] / 255;
      sum += n * n;
    }
    // dB FS
    const rms = Math.sqrt(sum / bufferLength);
    const dbFS = 20 * Math.log10(rms + 1e-6);
    
// dB SPL
    const dbSPL = Math.max(30, Math.min(90, 90 + dbFS));
    const normalized = (dbSPL - 30) / 60;
    
    onUpdate(Math.round(dbSPL), normalized);
  };
  tick();

  return () => {
    cancelAnimationFrame(rafId);
    stream.getTracks().forEach(t => t.stop());
    audioContext.close();
  };
}
