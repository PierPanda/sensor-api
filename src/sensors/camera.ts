import { MAX_LUX } from '../constant';

export type LightCallback = (lux: number, normalized: number) => void;

/**
 * Essaie d'utiliser AmbientLightSensor, sinon fallback sur la caméra
 */
export async function startLight(onUpdate: LightCallback): Promise<() => void> {
  if ('AmbientLightSensor' in window) {
    try {
      const permission = await navigator.permissions.query({ name: 'ambient-light-sensor' as PermissionName });
      if (permission.state !== 'denied') {
        const sensor = new (window as any).AmbientLightSensor({ frequency: 10 });
        sensor.addEventListener('reading', () => {
          const lux = Math.round(sensor.illuminance);
          const normalized = Math.min(1, lux / MAX_LUX);
          onUpdate(lux, normalized);
        });
        sensor.addEventListener('error', (e: any) => {
          console.warn('AmbientLightSensor error:', e.error.message);
        });
        sensor.start();
        console.log('✓ AmbientLightSensor actif');
        return () => sensor.stop();
      }
    } catch (err) {
      console.warn('AmbientLightSensor non disponible, fallback caméra');
    }
  }

  return startCameraFallback(onUpdate);
}

/**
 * Fallback: estime les lux à partir de la luminance moyenne de la caméra
 */
async function startCameraFallback(onUpdate: LightCallback): Promise<() => void> {
  console.log('⚠ Fallback caméra pour la luminosité (estimation)');
  
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

  const video = document.createElement('video');
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  await video.play();

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 48;
  const ctx = canvas.getContext('2d')!;

  const intervalId = setInterval(() => {
    if (video.readyState < 2) return;
    ctx.drawImage(video, 0, 0, 64, 48);
    const { data } = ctx.getImageData(0, 0, 64, 48);

    let luminance = 0;
    const pixelCount = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      luminance += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    const avgLuminance = luminance / pixelCount / 255; // 0-1
    const estimatedLux = Math.round(Math.pow(avgLuminance, 2) * MAX_LUX);
    const normalized = Math.min(1, estimatedLux / MAX_LUX);
    
    onUpdate(estimatedLux, normalized);
  }, 150);

  return () => {
    clearInterval(intervalId);
    stream.getTracks().forEach(t => t.stop());
  };
}
