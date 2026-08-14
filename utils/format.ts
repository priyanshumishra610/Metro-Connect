import type { CommuteFrequency } from '@/types/database';

export function formatTime(hhmmss: string): string {
  const [h, m] = hhmmss.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatFrequency(frequency: CommuteFrequency): string {
  switch (frequency) {
    case 'weekdays':
      return 'Weekdays';
    case 'three_to_four_days':
      return '3–4 days a week';
    case 'few_days':
      return 'A few days a week';
    case 'occasionally':
      return 'Occasionally';
  }
}

export function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'Good morning.';
  if (hour >= 16 && hour < 20) return 'Heading home?';
  return 'Your route is waiting.';
}
