// Passive production heartbeat.
// Safety net for visible Particles/sec progress if the animation-frame loop is interrupted.

(function setupPassiveProductionHeartbeat() {
  if (typeof catchUpProgress !== "function" || typeof updateLiveUI !== "function") return;

  let lastHeartbeat = Date.now();

  function heartbeat() {
    try {
      const now = Date.now();
      const elapsed = now - lastHeartbeat;
      lastHeartbeat = now;

      if (elapsed <= 0 || typeof state === "undefined" || !state.hasStarted) return;
      catchUpProgress(false);
      updateLiveUI();
    } catch (error) {
      console.warn("Atomic Idle passive heartbeat skipped:", error);
    }
  }

  setInterval(heartbeat, 250);
})();
