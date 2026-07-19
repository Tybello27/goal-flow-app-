import type { AppData, Settings } from '../types';

export const DATA_KEY = 'goalflow.data.v1';
export const SETTINGS_KEY = 'goalflow.settings.v1';
export const ONBOARDED_KEY = 'goalflow.onboarded.v1';
export const INSTALL_HINT_KEY = 'goalflow.installhint.v1';

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / unavailable — ignore */
  }
}

export const defaultSettings = (): Settings => ({
  name: 'Tomisin',
  theme: 'system',
  accent: 'blue',
  greeting: 'auto',
  notifications: true,
  dailyDigestTime: '08:00',
});

export const loadData = (): AppData | null => read<AppData>(DATA_KEY);
export const saveData = (d: AppData) => write(DATA_KEY, d);

export const loadSettings = (): Settings => ({
  ...defaultSettings(),
  ...(read<Partial<Settings>>(SETTINGS_KEY) ?? {}),
});
export const saveSettings = (s: Settings) => write(SETTINGS_KEY, s);

export const loadOnboarded = (): boolean => read<boolean>(ONBOARDED_KEY) === true;
export const saveOnboarded = () => write(ONBOARDED_KEY, true);

export const loadInstallHintDismissed = (): boolean =>
  read<boolean>(INSTALL_HINT_KEY) === true;
export const saveInstallHintDismissed = () => write(INSTALL_HINT_KEY, true);

export function exportData(data: AppData, settings: Settings) {
  const blob = new Blob(
    [JSON.stringify({ app: 'GoalFlow', version: 1, exportedAt: new Date().toISOString(), data, settings }, null, 2)],
    { type: 'application/json' },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `goalflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function clearStorage() {
  localStorage.removeItem(DATA_KEY);
}
