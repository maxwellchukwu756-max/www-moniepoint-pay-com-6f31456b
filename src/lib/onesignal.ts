// OneSignal Web Push integration for Moniepoint Pay.
//
// SETUP (one-time):
// 1. Create a free OneSignal account at https://onesignal.com
// 2. Create a new "Web Push" app.
//    - Site URL: https://www-moniepoint-pay-com.lovable.app
//    - Default icon: upload the Moniepoint Pay logo (256x256 PNG)
// 3. Copy the App ID and paste it below (replace ONESIGNAL_APP_ID).
// 4. In OneSignal Dashboard → Messages → Automated → New Journey:
//    - Trigger: user with tag `mp_withdrawn` != "true"
//    - Repeat every 4 hours
//    - Title:  Moniepoint Pay Alert
//    - Body:   You still have an available balance waiting in your Moniepoint Pay
//             account. Withdraw your funds now to avoid missing out.
//    - Launch URL: https://www-moniepoint-pay-com.lovable.app/transfer
//    - Priority: HIGH, Sound: default, Icon: Moniepoint Pay logo
//
// After the user completes a withdrawal we call `markWithdrawn()` which sets
// the `mp_withdrawn=true` tag → OneSignal automatically excludes them from
// the recurring campaign.

// TODO: Replace this placeholder with your real OneSignal App ID.
export const ONESIGNAL_APP_ID = "f089219b-9dc5-4b5e-9215-c91eb797d50e";

const OPT_KEY = "mp_onesignal_opt";

type OneSignalDeferred = Array<(OneSignal: any) => void | Promise<void>>;
declare global {
  interface Window {
    OneSignalDeferred?: OneSignalDeferred;
    OneSignal?: any;
  }
}

let initialized = false;

export function initOneSignal() {
  if (typeof window === "undefined") return;
  if (initialized) return;
  if (!ONESIGNAL_APP_ID) return;
  initialized = true;

  // Inject SDK script
  if (!document.querySelector('script[data-onesignal="1"]')) {
    const s = document.createElement("script");
    s.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    s.async = true;
    s.defer = true;
    s.setAttribute("data-onesignal", "1");
    document.head.appendChild(s);
  }

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal) => {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      serviceWorkerPath: "/OneSignalSDKWorker.js",
      serviceWorkerParam: { scope: "/" },
      allowLocalhostAsSecureOrigin: true,
      notifyButton: { enable: false },
      promptOptions: {
        slidedown: {
          prompts: [{
            type: "push",
            autoPrompt: false,
            text: {
              actionMessage: "Get real-time alerts about your Moniepoint Pay balance and daily rewards.",
              acceptButton: "Enable",
              cancelButton: "Later",
            },
          }],
        },
      },
    });

    // Listen for subscription changes → mirror into localStorage
    OneSignal.User.PushSubscription.addEventListener("change", (e: any) => {
      try {
        localStorage.setItem(OPT_KEY, e.current?.optedIn ? "1" : "0");
      } catch {}
    });
  });
}

function withOneSignal(fn: (OneSignal: any) => void | Promise<void>) {
  if (typeof window === "undefined") return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(fn);
}

/** Prompt the browser for permission and subscribe the device. */
export async function enableOneSignal(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === "YOUR_ONESIGNAL_APP_ID") {
      // Fallback: still respect user intent, so the toggle reflects a "try again once configured" state.
      localStorage.setItem(OPT_KEY, "1");
      return resolve(false);
    }
    withOneSignal(async (OneSignal) => {
      try {
        await OneSignal.Notifications.requestPermission();
        await OneSignal.User.PushSubscription.optIn();
        localStorage.setItem(OPT_KEY, "1");
        resolve(true);
      } catch {
        resolve(false);
      }
    });
  });
}

export async function disableOneSignal(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve();
    localStorage.setItem(OPT_KEY, "0");
    withOneSignal(async (OneSignal) => {
      try { await OneSignal.User.PushSubscription.optOut(); } catch {}
      resolve();
    });
  });
}

export function isOneSignalOptedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(OPT_KEY) === "1";
}

/** Tag user after withdrawal so recurring "withdraw now" campaign excludes them. */
export function markWithdrawn() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("mp_withdrawn", "1"); } catch {}
  withOneSignal(async (OneSignal) => {
    try { await OneSignal.User.addTag("mp_withdrawn", "true"); } catch {}
  });
}

/** Reset the withdrawn tag (e.g. user's balance grew again). */
export function markHasBalance() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("mp_withdrawn", "0"); } catch {}
  withOneSignal(async (OneSignal) => {
    try { await OneSignal.User.addTag("mp_withdrawn", "false"); } catch {}
  });
}
