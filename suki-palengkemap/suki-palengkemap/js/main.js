// main.js — bootstraps the app: load saved data, start the map, render the
// initial screens, then hand off from the splash screen to the landing screen.

document.addEventListener('DOMContentLoaded', () => {
  loadStalls();
  initMap();
  renderNearby();
  renderResultsList();
  renderMapSheet();

  // Splash auto-advances to landing after the intro animation, same as the
  // original Suki prototype.
  setTimeout(() => goTo('landing'), 1800);
});
