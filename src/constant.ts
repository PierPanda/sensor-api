export const TABS = ['audio', 'camera', 'network'] as const;
export type Tab = typeof TABS[number];

export const TAB_LABELS: Record<Tab, string> = {
  audio:   'Bruit',
  camera:  'Lumière',
  network: 'Réseau',
};

export const TAB_COLORS: Record<Tab, string> = {
  audio:   '#a78bfa',
  camera:  '#fbbf24',
  network: '#34d399',
};

export const TYPE_LABELS: Record<string, string> = {
  wifi:      '📶 WiFi',
  ethernet:  '🔌 Ethernet',
  cellular:  '📱 Cellulaire',
  bluetooth: '🔵 Bluetooth',
  wimax:     '📡 WiMAX',
  none:      '✗ Hors ligne',
  other:     '? Autre',
  unknown:   '? Inconnu',
};

export const NETWORK_LABELS: Record<string, string> = {
  'slow-2g': 'Très lent (WAP)',
  '2g':      'Lent (EDGE)',
  '3g':      'Moyen (HSPA)',
  '4g':      'Rapide (LTE/WiFi)',
  'N/A':     'Non disponible',
};

export const GAUGE_R = 80;
export const GAUGE_C = 2 * Math.PI * GAUGE_R;

export const MAX_LUX = 1000;

export const VU_BAR_COUNT = 20;
