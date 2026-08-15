/**
 * Guarded loader for @dhana-cs/react-native-truecaller, following the same
 * pattern as lib/nativeAds.ts: `require()` inside a try/catch instead of a
 * static top-level `import`, so a missing/broken native module degrades to
 * "Truecaller sign-in is unavailable" instead of crashing the app.
 *
 * Extra caution here versus the AdMob wrapper: inspecting the installed
 * package (node_modules/@dhana-cs/react-native-truecaller) turned up a real
 * bug — its New Architecture code path does `require('./NativeTrueCallerSDK')`,
 * a file that does not exist anywhere in the package. This project runs
 * with the New Architecture enabled, so that branch is what will execute on
 * a real device. It's unclear whether that throws at call time or behaves
 * some other way without testing on real hardware, which nobody involved in
 * building this has been able to do — so every call in services/truecallerAuth.ts
 * is individually try/caught on top of this loader, not just the import.
 */
import type * as TruecallerSdk from '@dhana-cs/react-native-truecaller';

let mod: typeof TruecallerSdk | null = null;
let attempted = false;

export function loadTruecallerModule(): typeof TruecallerSdk | null {
  if (attempted) return mod;
  attempted = true;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require('@dhana-cs/react-native-truecaller');
  } catch (error) {
    if (__DEV__) {
      console.warn(
        '[truecaller] native module unavailable — expected in Expo Go, or if this build predates a prebuild/dev-client rebuild after installing the package.'
      );
    }
    mod = null;
  }

  return mod;
}
