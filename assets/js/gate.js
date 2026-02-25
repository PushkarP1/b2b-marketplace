/* Password gate (client-side polite gate; not real security)
   - Kept compatible with the base index.html you provided.
*/

(function(){
  const DEV_BYPASS_PASSWORD = false;
  const ACCESS_PASSWORD = "PSI";

  const STORAGE_KEY = "b2b_gate_unlocked";

  function qs(sel){return document.querySelector(sel)}

  function unlock(){
    localStorage.setItem(STORAGE_KEY, "1");
    const gate = qs(".gate");
    if (gate) gate.style.display = "none";
    document.documentElement.classList.remove("is-locked");
  }

  function lock(){
    localStorage.removeItem(STORAGE_KEY);
    const gate = qs(".gate");
    if (gate) gate.style.display = "grid";
    document.documentElement.classList.add("is-locked");
  }

  function ensureGate(){
    const gate = qs(".gate");
    if (!gate) return;

    // Wire up
    const form = qs("#gateForm");
    const input = qs("#gatePassword");
    const err = qs("#gateError");
    const btnLock = qs("#gateLock");

    if (btnLock){
      btnLock.addEventListener("click", (e)=>{e.preventDefault(); lock();});
    }

    if (form){
      form.addEventListener("submit", (e)=>{
        e.preventDefault();
        const entered = (input?.value || "").trim();
        if (entered === ACCESS_PASSWORD){
          if (err) err.style.display = "none";
          unlock();
          input.value = "";
        } else {
          if (err) err.style.display = "block";
          if (input){ input.focus(); input.select(); }
        }
      });
    }

    const unlocked = DEV_BYPASS_PASSWORD || localStorage.getItem(STORAGE_KEY) === "1";
    if (unlocked) {
      gate.style.display = "none";
    } else {
      gate.style.display = "grid";
      setTimeout(()=>{ input?.focus(); }, 50);
    }
  }

  document.addEventListener("DOMContentLoaded", ensureGate);
})();
