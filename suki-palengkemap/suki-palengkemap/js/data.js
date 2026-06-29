// data.js — the single source of truth for stall/vendor data.
// Shared by the map screen, results list, detail screen, and landing nearby cards.

const STORAGE_KEY = 'suki:stalls';
const DEFAULT_CENTER = { lat: 14.5995, lng: 120.9842 }; // Quiapo, Manila — change to your real target market
const DEFAULT_ZOOM = 18;

let stalls = [];
let nextStallId = 1;
let nextItemId = 1;

// Shared UI state used across screens
let currentSearchQuery = '';
let browseAllActive = false;
let currentDetailStallId = null;

function loadStalls() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      stalls = data.stalls || [];
      nextStallId = data.nextStallId || (stalls.length + 1);
      nextItemId = data.nextItemId || 1;
    }
  } catch (e) {
    console.error('Could not load saved stalls', e);
  }
}

function saveStalls() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stalls, nextStallId, nextItemId }));
  } catch (e) {
    console.error('Could not save stalls', e);
  }
}

function findStall(id) {
  return stalls.find(s => s.id === id);
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str == null ? '' : str;
  return d.innerHTML;
}

// Rough straight-line distance in meters between two lat/lng points (Haversine).
function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters) {
  if (meters < 1000) return Math.round(meters) + 'm away';
  return (meters / 1000).toFixed(1) + 'km away';
}
