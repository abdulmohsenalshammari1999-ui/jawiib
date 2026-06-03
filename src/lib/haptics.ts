/**
 * Haptic feedback wrapper — native on iOS/Android via Capacitor,
 * no-op on web. Import and call these instead of Capacitor directly
 * so the rest of the codebase stays platform-agnostic.
 */

type HapticStyle = 'light' | 'medium' | 'heavy';

let _impact: ((style: HapticStyle) => Promise<void>) | null = null;
let _notification: ((type: 'success' | 'warning' | 'error') => Promise<void>) | null = null;
let _selection: (() => Promise<void>) | null = null;

// Lazy-load Capacitor Haptics only in a native shell
async function load() {
  if (_impact !== null) return;
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
    _impact = (style) => Haptics.impact({ style: style === 'light' ? ImpactStyle.Light : style === 'medium' ? ImpactStyle.Medium : ImpactStyle.Heavy });
    _notification = (type) => Haptics.notification({ type: type === 'success' ? NotificationType.Success : type === 'warning' ? NotificationType.Warning : NotificationType.Error });
    _selection = () => Haptics.selectionStart();
  } catch {
    // Not in Capacitor — bind no-ops
    _impact = async () => {};
    _notification = async () => {};
    _selection = async () => {};
  }
}

export async function hapticImpact(style: HapticStyle = 'medium') {
  await load();
  await _impact!(style);
}

export async function hapticSuccess() {
  await load();
  await _notification!('success');
}

export async function hapticError() {
  await load();
  await _notification!('error');
}

export async function hapticSelection() {
  await load();
  await _selection!();
}
