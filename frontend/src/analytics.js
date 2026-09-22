import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, logEvent, setUserId, setUserProperties } from 'firebase/analytics';

// Firebase configuration values are public identifiers for a web application; they
// are not credentials. Keep server credentials out of the client bundle.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDe7XHaIkUfNTzMQMQQPk3ZmKowjZZV6Wo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'backbenchers-rudra.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'backbenchers-rudra',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'backbenchers-rudra.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '80373319965',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:80373319965:web:cf2969d753b84ef4d4b9f4',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-MPX6NHXPLE',
};

export const ANALYTICS_EVENTS = Object.freeze({
  SESSION_START: 'research_session_start', SESSION_END: 'research_session_end',
  ACTIVE_HEARTBEAT: 'active_heartbeat', IDLE: 'user_idle', VISIBILITY: 'tab_visibility_change',
  PAGE_VIEW: 'virtual_page_view', NAVIGATION: 'navigation', LOGIN: 'login', LOGOUT: 'logout',
  SUBJECT_OPEN: 'subject_open', MATERIAL_OPEN: 'material_open', MATERIAL_CLOSE: 'material_close',
  MATERIAL_SAVE: 'material_save', MATERIAL_UNSAVE: 'material_unsave',
  DOWNLOAD_START: 'download_start', DOWNLOAD_COMPLETE: 'download_complete', DOWNLOAD_FAILED: 'download_failed',
  SEARCH: 'search', FILTER: 'content_filter', THEME_CHANGE: 'theme_change', SIDEBAR: 'sidebar_toggle',
  SCROLL: 'scroll_progress', API_ERROR: 'api_error', APP_ERROR: 'app_error',
  INTERACTION: 'ui_interaction', ADMIN_ACTION: 'admin_action', BLOCKED_ACTION: 'blocked_action',
});

let analytics = null;
let sessionId = null;
let initialized = false;
let lastActiveAt = Date.now();
let heartbeat = null;
const scrollMilestones = new Set();

const deviceClass = () => window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
const route = () => window.location.hash.replace('#', '') || 'login';
const safe = (value, limit = 100) => typeof value === 'string' ? value.replace(/[\r\n]/g, ' ').slice(0, limit) : value;
const baseParams = () => ({
  research_session_id: sessionId,
  route_name: safe(route(), 40),
  device_class: deviceClass(),
  viewport_width: window.innerWidth,
  viewport_height: window.innerHeight,
  debug_mode: import.meta.env.DEV || new URLSearchParams(window.location.search).has('analytics_debug'),
});

const newSessionId = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export async function initializeAnalytics() {
  if (initialized || typeof window === 'undefined') return analytics;
  initialized = true;
  try {
    if (!await isSupported()) return null;
    analytics = getAnalytics(initializeApp(firebaseConfig));
    sessionId = newSessionId();
    track(ANALYTICS_EVENTS.SESSION_START, { referrer_host: safe(document.referrer ? new URL(document.referrer).host : 'direct', 80) });
    installBehaviorObservers();
  } catch (error) {
    // Analytics must never prevent the portal from loading.
    console.warn('Firebase Analytics unavailable:', error?.message);
  }
  return analytics;
}

export function identifyResearchUser(user) {
  if (!analytics || !user?.id) return;
  // The backend-generated UUID is a pseudonymous study identifier. Never pass email,
  // display name, Microsoft account ID, session tokens, or free text to Analytics.
  setUserId(analytics, String(user.id));
  setUserProperties(analytics, { user_role: user.isAdmin ? 'admin' : 'student' });
}

export function track(name, params = {}) {
  if (!analytics) return;
  try {
    const cleaned = Object.fromEntries(Object.entries({ ...baseParams(), ...params })
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, typeof value === 'string' ? safe(value) : value]));
    logEvent(analytics, name, cleaned);
  } catch { /* reporting is intentionally non-blocking */ }
}

export function trackPageView(page, params = {}) {
  track(ANALYTICS_EVENTS.PAGE_VIEW, { page_name: safe(page, 60), ...params });
}

export function trackMaterial(event, material, extra = {}) {
  track(event, {
    material_id: safe(String(material?.id || 'unknown'), 80),
    subject_code: safe(material?.subjectCode || 'unknown', 40),
    material_category: safe(material?.category || 'unknown', 40),
    material_type: safe(material?.subcategory || material?.category || 'unknown', 40),
    ...extra,
  });
}

function installBehaviorObservers() {
  const markActive = () => { lastActiveAt = Date.now(); };
  ['pointerdown', 'keydown', 'touchstart', 'focus'].forEach(type => window.addEventListener(type, markActive, { passive: true }));
  document.addEventListener('visibilitychange', () => track(ANALYTICS_EVENTS.VISIBILITY, { visibility_state: document.visibilityState }));
  window.addEventListener('error', () => track(ANALYTICS_EVENTS.APP_ERROR, { error_type: 'window_error' }));
  window.addEventListener('unhandledrejection', () => track(ANALYTICS_EVENTS.APP_ERROR, { error_type: 'unhandled_rejection' }));
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (total <= 0) return;
    const milestone = [25, 50, 75, 100].find(value => (window.scrollY / total) * 100 >= value && !scrollMilestones.has(`${route()}-${value}`));
    if (milestone) { scrollMilestones.add(`${route()}-${milestone}`); track(ANALYTICS_EVENTS.SCROLL, { scroll_percent: milestone }); }
  }, { passive: true });
  heartbeat = window.setInterval(() => {
    const activeSeconds = Math.round((Date.now() - lastActiveAt) / 1000);
    track(activeSeconds <= 60 ? ANALYTICS_EVENTS.ACTIVE_HEARTBEAT : ANALYTICS_EVENTS.IDLE, { inactive_seconds: activeSeconds });
  }, 60_000);
  window.addEventListener('pagehide', () => track(ANALYTICS_EVENTS.SESSION_END, { session_duration_seconds: Math.round((Date.now() - lastActiveAt) / 1000) }));
}

export function shutdownAnalytics() { if (heartbeat) window.clearInterval(heartbeat); heartbeat = null; }
