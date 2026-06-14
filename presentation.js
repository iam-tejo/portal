/* ==========================================================================
   SAVIYNT WEB PRESENTATION - CORE INTERACTIVE JS DECK ENGINE
   ========================================================================== */

// --- Slide Setup ---
const slides = document.querySelectorAll(".slide");
const totalSlides = slides.length;
let currentSlide = 0;

// --- State Configurations ---
let soundEnabled = true;
let timerInterval = null;
let secondsElapsed = 0;
let audioCtx = null;
let teamCycleInterval = null;
let startTeamCycle = null;
let stopTeamCycle = null;

/// --- Speaker Notes Dictionary ---
const speakerNotes = {
  0: `<blockquote><strong>Goal: Welcome & Introduction</strong></blockquote>
      <p>• Welcoming partners and introducing yourself and your manager.</p>
      <p>• Setting the stage: Why are we sharing this Saviynt journey? It’s to show our security commitment.</p>
      <p>• Talk briefly about how modern cloud architectures require centralized identity governance (IGA).</p>`,
  
  1: `<blockquote><strong>Goal: Environment Isolation & Safety</strong></blockquote>
      <p>• Emphasize that we maintain strict isolation between Dev, Test, Staging, and Production environments.</p>
      <p>• Mention <strong>Transport Packages</strong>: All rules, workflows, and mappings are imported/exported as config packages, ensuring no custom script failures.</p>`,
  
  2: `<blockquote><strong>Goal: JML Lifecycle - The Joiner Process</strong></blockquote>
      <p>• Explain our JML automation starting with the Joiner lifecycle.</p>
      <p>• <strong>iTrent HR Ingestion:</strong> A flat file connector reads employee feeds daily to auto-create identities in Saviynt.</p>
      <p>• <strong>Attribute-Driven provisioning:</strong> Saviynt technical rules map positions, departments, locations, and employee types to standard templates.</p>
      <p>• <strong>M365 Licensing Optimization:</strong> Accounts are provisioned exactly <strong>7 days before start</strong>, minimizing licensing overhead for delay starts.</p>
      <p>• <strong>Manager Confirmation (Day 0):</strong> The manager logs in on start day to confirm the user arrived, triggering an initial password email to the manager.</p>
      <p>• <strong>ServiceNow downstream tasks:</strong> Downstream teams (for hardware, laptops, security badges) are notified via automated ServiceNow requests 7 days before start.</p>
      <p>• <strong>Non-Starter protection:</strong> If they fail to start, the manager reports it, AD accounts are auto-disabled, and licenses are canceled immediately.</p>`,
  
  3: `<blockquote><strong>Goal: JML Lifecycle - The Mover Process</strong></blockquote>
      <p>• Outline our three-phased department/position transfer workflow:</p>
      <p>• <strong>Phase 1 (Swap Birthrights):</strong> New department birthrights are provisioned immediately. Old birthrights are sent to Ops for approval to prevent instant lockouts during transition.</p>
      <p>• <strong>Phase 2 (Manager Access Review):</strong> After old birthrights are removed, we trigger an automated review campaign for the new manager to approve/clean up pre-existing ad-hoc entitlements.</p>
      <p>• <strong>Phase 3 (Disconnected Apps):</strong> Moving manual disconnected application tickets from ServiceNow into Saviynt-native audited tasks to keep user data 100% accurate.</p>`,
  
  4: `<blockquote><strong>Goal: JML Lifecycle - Automated &amp; Ad-Hoc Leaver Process</strong></blockquote>
      <p>• Explain how we handle user offboarding and account revocation.</p>
      <p>• <strong>Standard Leaver:</strong> Daily HR feed (iTrent) triggers offboarding based on end date. On end date + 1, Saviynt automatically disables identity and app access.</p>
      <p>• <strong>Fail-Safe Protection (accountExpires):</strong> Saviynt pre-sets the AD expiration attribute. AD disables logins at midnight on the end date even if Saviynt is down.</p>
      <p>• <strong>Emergency Immediate Suspension:</strong> Managers and security team can execute an ad-hoc suspension, killing active Entra ID sessions and disabling all connected accounts instantly.</p>
      <p>• <strong>One-Click Restoration:</strong> Provides immediate recovery to revert emergency suspensions in case of operational error.</p>`,
  
  5: `<blockquote><strong>Goal: App Onboarding Connector Engine</strong></blockquote>
      <p>• Explain that onboarding has shifted from custom code creation to <strong>configuration-first templates</strong>.</p>
      <p>• We utilize pre-built API templates to connect AD, Microsoft Entra, ServiceNow, Workiva, and AWS securely.</p>
      <p>• This config-first framework enables 85% faster onboarding, saving weeks of custom development.</p>`,
  
  6: `<blockquote><strong>Goal: ServiceNow vs. Saviynt ARS Request Flow</strong></blockquote>
      <p>• Walk through the linear pipeline: ServiceNow (Form submission) ➔ Saviynt (Workflows, approvals, and SOD scanning) ➔ Target Applications (automated provisioning).</p>
      <p>• Highlight the **limitations**: Since requests start in SNOW, they bypass Saviynt's native database check. Requesters can submit toxic access combos, making the security control **detective** at review rather than **preventative** at request.</p>
      <p>• Explain why **Saviynt ARS is better**: Using ARS as the front door immediately warns the requester and blocks toxic submissions *during the request stage*, eliminating downstream approval overhead.</p>`,
  
  7: `<blockquote><strong>Goal: Preventative & Detective SOD</strong></blockquote>
      <p>• Explain that ServiceNow is the request form system, but lacks application metadata insight and cannot run cross-system checks for toxic combinations.</p>
      <p>• Saviynt runs the workflows, performs SOD evaluations, and displays warnings and mitigation controls directly to the approvers during their review.</p>
      <p>• <strong>Demo Tip:</strong> Drag "Create Vendor" and "Approve Payments" into the basket to demonstrate the SOD warning displayed to the approver.</p>`,
  
  8: `<blockquote><strong>Goal: Out-of-Band (OOB) Controls</strong></blockquote>
      <p>• Discuss what happens when administrators bypass standard requests and assign access directly in AD/Workiva databases.</p>
      <p>• Saviynt delta reconciliation scans detect these changes. We can immediately revoke them or request retroactive manager approvals.</p>
      <p>• <strong>Demo Tip:</strong> Click "Scan Directories" then select "Strip Access" or "Retroactive Ticket" to show the remediation loop.</p>`,
  
  9: `<blockquote><strong>Goal: Campaign Bucket Templates (User Access Reviews)</strong></blockquote>
      <p>• Explain that instead of general campaigns, we organize apps into structured <strong>Campaign Buckets</strong> with acronyms (e.g., PQLMC, SALMC, SQEOD, SQLMD) determining cycle and reviewer type.</p>
      <p>• Decode the letters: First (Standard/Privileged), Second (Quarterly/Bi-Annual/Annual), Third/Fourth (Line Manager/Entitlement Owner/App Owner), Fifth (Connected/Disconnected).</p>
      <p>• **Compliance Safeguards**: Explain core rules: (1) Self-certifications are blocked—escalating automatically to a Line Manager. (2) Post-Mover transfers trigger a Line Manager campaign based on that Mover event. (3) Out-of-band automated reminder notifications nudge busy managers. (4) Fail-secure expiration automatically revokes access if a campaign closes without a decision.</p>
      <p>• **Demo Tip:** Click through the campaign buttons (PQLMC, SALMC, SQEOD, SQLMD) to see how target reviewer dashboard displays update, and test Approving or Revoking a review.</p>`,
  
  10: `<blockquote><strong>Goal: Role Mining — Hybrid Approach (In Progress)</strong></blockquote>
      <p>• We are currently in the <strong>middle of implementing</strong> role mining and are leaning toward the <strong>hybrid approach</strong>.</p>
      <p>• Saviynt EIC supports three approaches: <strong>Top-Down</strong> (business-driven, HR attributes like job code/department/location), <strong>Bottom-Up</strong> (data-driven, analyzes existing user permissions), and <strong>Hybrid</strong> (the recommended combination).</p>
      <p>• The hybrid approach uses bottom-up statistical clustering to find common entitlement patterns, then restricts the user base top-down by HR attributes (e.g., mine only within a specific department).</p>
      <p>• Key benefits: <strong>SOD-Aware Mining</strong> — the algorithm prevents inherent SOD conflicts within mined roles. <strong>Usage-Based Mining</strong> — only active entitlements are included, so legacy unused access is not embedded into roles.</p>
      <p>• <strong>Entitlement Hierarchy:</strong> If you mine on SAP TCode, the system recommends the next level up (SAP Role), and further up (Business/Enterprise Role) depending on strategy.</p>
      <p>• Results are saved to a <strong>Role Workbench</strong> where we can slice-dice, simulate, and publish validated roles — no direct production publishing without review.</p>`,
  
  11: `<blockquote><strong>Goal: Governance &amp; Audit Dashboards</strong></blockquote>
      <p>• Walk through the <strong>KPI Strip</strong> at the top — 5 real-time metrics: SOD Violations (0 = clean), UAR Completion (99%), Orphaned Accounts auto-revoked (142), Provisioning Success (98%), and OOB Changes detected & remediated (37).</p>
      <p>• The <strong>UAR Campaign bar chart</strong> shows a consistent improvement trend Jan–Jun — from 68% to 99%. This demonstrates our maturity in driving access reviews to completion.</p>
      <p>• The <strong>Audit Framework Status</strong> panel shows our compliance coverage: SOX 97%, ISO 27001 94%, GDPR 100%, Cyber Essentials 100% — all PASS. HIPAA is currently "In Review" due to an identified control gap being addressed.</p>
      <p>• The <strong>Recent Audit Events</strong> feed gives stakeholders real-time visibility — campaign closures, OOB remediations, and auto-revocations all appear here instantly.</p>
      <p>• The <strong>Audit Report Table</strong> shows the controls tested, owning teams, last test dates, and pass/review status — this is exactly what we export as a CSV for auditors. Saviynt generates these out-of-the-box for SOX, ISO, GDPR, HIPAA, and Cyber Essentials with no custom reporting effort.</p>`,
  
  12: `<blockquote><strong>Goal: Saviynt Vision &amp; Roadmap (NHI &amp; Intelligence)</strong></blockquote>
      <p>• Point out that we are moving away from traditional, manual access reviews to <strong>machine-learning based role analytics</strong>.</p>
      <p>• Discuss <strong>Non-Human Identities (NHI)</strong>: Highlight that machine accounts (APIs, bots, service accounts) are multiplying faster than human accounts.</p>
      <p>• Connect ML and analytics to audit preparation: Saviynt flags outliers before auditors see them.</p>`,
  
  13: `<blockquote><strong>Goal: Our Saviynt Package — Diamond Pro</strong></blockquote>
      <p>• We are on the <strong>Diamond success package</strong> combined with the <strong>Pro platform tier</strong>. These are two separate but complementary agreements.</p>
      <p>• <strong>Platform Tier (Pro):</strong> Enterprise-scale IGA with no limits on connected applications or managed identities — designed for organisations scaling their identity programme across the entire business.</p>
      <p>• <strong>Diamond Support Package</strong> is the highest tier Saviynt offers, providing white-glove, proactive, always-on support. Key differentiators from lower tiers: <strong>30-minute Sev 1 response time</strong> (vs 2 hours on Standard/Gold), dedicated Customer Success Manager, Support Account Manager (SAM), and a dedicated Saviynt Executive Sponsor for strategic alignment.</p>
      <p>• We also have access to a <strong>private Slack channel</strong> with Saviynt SMEs for real-time collaboration — invaluable during major incidents or upgrades. 20 authorised contacts and a 20% discount on Saviynt training and expert services.</p>
      <p>• The comparison table on the right shows exactly what Diamond gives us vs the lower tiers — the highlighted cyan column is our current entitlement.</p>`
};

// --- Page & Scaling Events ---
document.addEventListener("DOMContentLoaded", () => {
  setupScale();
  updateSlide();
  startTimer();
  initAudio();
  initBinds();
  initTitleMesh();
  initTeamMosaic();
  initInteractiveJoiner();
  initInteractiveMover();
  initInteractiveLeaver();
  initInteractiveSod();
  initInteractiveOob();
  initInteractiveEnvironments();
  initInteractiveRequest();
  initDemoVideoControls();
  initInteractiveCampaigns();
  initNavSidebar();
  
  window.addEventListener("resize", setupScale);
});

// Autoscale wrapper dynamically to fit viewport (maintaining 16:9)
function setupScale() {
  const wrapper = document.getElementById("deck-wrapper");
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  
  // Base design dimensions
  const baseW = 1280;
  const baseH = 720;
  
  // Adjust width if sidebar is open
  const isSidebarOpen = document.body.classList.contains('sidebar-open');
  const availableW = isSidebarOpen ? (winW - 260) : winW;
  
  const scale = Math.min(availableW / baseW, winH / baseH);
  
  wrapper.style.transform = `scale(${scale})`;
}

// --- Navigation Controller ---
function initBinds() {
  // Navigation buttons
  document.getElementById("btn-next-slide").addEventListener("click", () => nextSlide());
  document.getElementById("btn-prev-slide").addEventListener("click", () => prevSlide());
  
  // Meet the Team button
  const meetTeamBtn = document.getElementById("btn-meet-team");
  if (meetTeamBtn) {
    meetTeamBtn.addEventListener("click", () => {
      const slide1 = document.getElementById("slide-1");
      if (slide1 && slide1.classList.contains("welcome-mode")) {
        slide1.classList.remove("welcome-mode");
        slide1.classList.add("team-mode");
        playTransitionSound();
        startTeamCycle();
      }
    });
  }
  
  // Speaker Notes panel buttons
  document.getElementById("btn-toggle-notes").addEventListener("click", () => toggleNotes());
  document.getElementById("btn-close-notes").addEventListener("click", () => toggleNotes());
  
  // Sound controls
  document.getElementById("btn-toggle-sound").addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    document.getElementById("btn-toggle-sound").textContent = soundEnabled ? "🔊 Sound" : "🔇 Muted";
    playTickSound();
  });
  
  // Keyboard listeners
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
      e.preventDefault();
      nextSlide();
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "n" || e.key === "N") {
      toggleNotes();
    }
  });
}

function nextSlide() {
  const slide1 = document.getElementById("slide-1");
  if (currentSlide === 0 && slide1 && slide1.classList.contains("welcome-mode")) {
    slide1.classList.remove("welcome-mode");
    slide1.classList.add("team-mode");
    playTransitionSound();
    startTeamCycle();
    return;
  }

  if (currentSlide < totalSlides - 1) {
    slides[currentSlide].classList.remove("active");
    slides[currentSlide].classList.add("exited");
    currentSlide++;
    slides[currentSlide].classList.remove("exited");
    slides[currentSlide].classList.add("active");
    
    playTransitionSound();
    updateSlide();
  }
}

function prevSlide() {
  const slide1 = document.getElementById("slide-1");
  if (currentSlide === 0 && slide1 && slide1.classList.contains("team-mode")) {
    slide1.classList.remove("team-mode");
    slide1.classList.add("welcome-mode");
    playTransitionSound();
    stopTeamCycle();
    return;
  }

  if (currentSlide > 0) {
    slides[currentSlide].classList.remove("active");
    currentSlide--;
    slides[currentSlide].classList.remove("exited");
    slides[currentSlide].classList.add("active");
    
    playTransitionSound();
    updateSlide();
  }
}

function updateSlide() {
  // Update footer text and indicator
  document.getElementById("slide-indicator").textContent = `${currentSlide + 1} / ${totalSlides}`;
  
  // Progress Bar
  const progressPercent = ((currentSlide + 1) / totalSlides) * 100;
  document.getElementById("deck-progress-fill").style.width = `${progressPercent}%`;
  
  // Load speaker notes
  document.getElementById("speaker-notes-content").innerHTML = speakerNotes[currentSlide] || "<p>No notes for this slide.</p>";
  
  // Trigger count-up counters if the active slide contains them
  const activeSlide = slides[currentSlide];
  if (activeSlide && activeSlide.querySelector(".count-up")) {
    triggerDashboardCounters();
  }

  // Handle start/stop team cycle on Slide 1 (index 0)
  if (currentSlide === 0) {
    if (typeof startTeamCycle === "function") startTeamCycle();
  } else {
    if (typeof stopTeamCycle === "function") stopTeamCycle();
  }

  // Refresh nav sidebar active item
  refreshNavSidebar();
}

function toggleNotes() {
  playTickSound();
  const drawer = document.getElementById("speaker-notes-drawer");
  drawer.classList.toggle("open");
}

// --- Presentation Timer ---
function startTimer() {
  timerInterval = setInterval(() => {
    secondsElapsed++;
    const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
    const secs = (secondsElapsed % 60).toString().padStart(2, '0');
    document.getElementById("timer-display").textContent = `${mins}:${secs}`;
  }, 1000);
}

// --- Sound Synthesizer Binds ---
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playTickSound() {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.start(now);
    osc.stop(now + 0.06);
  } catch(e) {
    console.error(e);
  }
}

function playTransitionSound() {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    // Smooth transition sweep frequency ramp
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.18);
    
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    
    osc.start(now);
    osc.stop(now + 0.2);
  } catch(e) {
    console.error(e);
  }
}

function playSuccessChime() {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    const gain2 = audioCtx.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc2.frequency.setValueAtTime(783.99, now + 0.08); // G5
    gain2.gain.setValueAtTime(0.08, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc1.start(now);
    osc1.stop(now + 0.26);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.44);
  } catch(e) {
    console.error(e);
  }
}

function playAlertSound() {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.setValueAtTime(150, now + 0.12);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc.start(now);
    osc.stop(now + 0.36);
  } catch(e) {
    console.error(e);
  }
}

// --- Interactive SOD Simulator logic ---
function initInteractiveSod() {
  const basket = document.getElementById("sod-basket");
  const items = document.querySelectorAll(".drag-role-item");
  const consoleEl = document.getElementById("sod-alert-console");
  const resetBtn = document.getElementById("btn-reset-sod");
  const rolesPool = document.querySelector(".draggable-roles-pool");
  
  let draggedItem = null;

  items.forEach(item => {
    item.addEventListener("dragstart", (e) => {
      draggedItem = item;
      item.classList.add("dragging");
      playTickSound();
    });
    
    item.addEventListener("dragend", () => {
      draggedItem = null;
      item.classList.remove("dragging");
    });
  });

  basket.addEventListener("dragover", (e) => {
    e.preventDefault();
    basket.classList.add("dragover");
  });

  basket.addEventListener("dragleave", () => {
    basket.classList.remove("dragover");
  });

  basket.addEventListener("drop", (e) => {
    e.preventDefault();
    basket.classList.remove("dragover");
    
    if (draggedItem) {
      // Remove placeholder if exists
      const ph = basket.querySelector(".basket-empty-placeholder");
      if (ph) ph.remove();
      
      basket.appendChild(draggedItem);
      playTickSound();
      
      checkSodState();
    }
  });

  resetBtn.addEventListener("click", () => {
    playTickSound();
    
    // Clear items from basket and return to pool
    const activeRoles = basket.querySelectorAll(".drag-role-item");
    activeRoles.forEach(r => {
      rolesPool.appendChild(r);
    });
    
    // Re-add placeholder
    basket.innerHTML = '<h4>ServiceNow Basket</h4><div class="basket-empty-placeholder">Drop roles here...</div>';
    
    // Reset alert console
    consoleEl.className = "sim-alert-console";
    consoleEl.querySelector(".status-icon").textContent = "✅";
    consoleEl.querySelector(".status-msg").textContent = "Access Basket Clear. Select roles to audit.";
  });

  function checkSodState() {
    const activeRoles = Array.from(basket.querySelectorAll(".drag-role-item")).map(r => r.dataset.role);
    
    const hasCreate = activeRoles.includes("vendor-create");
    const hasApprove = activeRoles.includes("payment-approve");
    
    if (hasCreate && hasApprove) {
      // SOD VIOLATION TARGET STATE
      playAlertSound();
      consoleEl.className = "sim-alert-console violation";
      consoleEl.querySelector(".status-icon").textContent = "🚨";
      consoleEl.querySelector(".status-msg").textContent = "SOD Conflict Detected! Saviynt highlights the 'Create Vendor' + 'Approve Payments' toxic combination and displays mitigation controls directly to the approver for action.";
    } else if (activeRoles.length > 0) {
      // Normal clear state
      consoleEl.className = "sim-alert-console clear";
      consoleEl.querySelector(".status-icon").textContent = "✔";
      consoleEl.querySelector(".status-msg").textContent = "No SOD conflicts. Saviynt initiates approval workflow (routing to 1-Level or 2-Level approval based on request criteria).";
    }
  }
}

// --- Interactive OOB Simulator Logic ---
function initInteractiveOob() {
  const scanBtn = document.getElementById("btn-oob-scan");
  const stripBtn = document.getElementById("btn-oob-strip");
  const ticketBtn = document.getElementById("btn-oob-retro");
  const logsContainer = document.getElementById("oob-logs");
  const controls = document.getElementById("oob-controls");
  
  let oobDetected = false;

  scanBtn.addEventListener("click", () => {
    playTransitionSound();
    logsContainer.innerHTML = "";
    controls.classList.add("hidden");
    
    // Step-by-step logs simulation printout
    let step = 0;
    const timeline = [
      { sys: "Active Directory", acc: "j_miller", role: "Domain User", status: "Clean", class: "clean", badge: "Managed" },
      { sys: "Workiva", acc: "j_miller", role: "Payments Exec", status: "Out-of-Band! 🚨", class: "warning", badge: "Rogue Access" },
      { sys: "AWS Console", acc: "j_miller", role: "Audit ReadOnly", status: "Clean", class: "clean", badge: "Managed" }
    ];
    
    const interval = setInterval(() => {
      if (step < timeline.length) {
        const log = timeline[step];
        const row = document.createElement("div");
        row.className = `oob-log-row ${log.class}`;
        row.id = `oob-row-${step}`;
        row.innerHTML = `
          <span>${log.sys}</span>
          <span>${log.acc}</span>
          <span>${log.role}</span>
          <span><span class="oob-badge b-${log.class}">${log.status}</span></span>
        `;
        logsContainer.appendChild(row);
        
        if (log.class === "warning") {
          playAlertSound();
          oobDetected = true;
        } else {
          playTickSound();
        }
        
        logsContainer.scrollTop = logsContainer.scrollHeight;
        step++;
      } else {
        clearInterval(interval);
        if (oobDetected) {
          controls.classList.remove("hidden");
        }
      }
    }, 600);
  });

  stripBtn.addEventListener("click", () => {
    playTransitionSound();
    
    const rogueRow = document.getElementById("oob-row-1");
    if (rogueRow) {
      rogueRow.className = "oob-log-row remediated-strip";
      rogueRow.querySelector(".oob-badge").className = "oob-badge b-strip";
      rogueRow.querySelector(".oob-badge").textContent = "Revoked & Cleaned";
      
      const note = document.createElement("div");
      note.className = "oob-log-row clean";
      note.style.gridColumn = "span 4";
      note.innerHTML = "<span>⚡ System Alert: Saviynt automatically deleted out-of-band role directly on Workiva. Governance baseline restored.</span>";
      logsContainer.appendChild(note);
      
      controls.classList.add("hidden");
      oobDetected = false;
    }
  });

  ticketBtn.addEventListener("click", () => {
    playTransitionSound();
    
    const rogueRow = document.getElementById("oob-row-1");
    if (rogueRow) {
      rogueRow.className = "oob-log-row remediated-ticket";
      rogueRow.querySelector(".oob-badge").className = "oob-badge b-ticket";
      rogueRow.querySelector(".oob-badge").textContent = "Approval Pending";
      
      const note = document.createElement("div");
      note.className = "oob-log-row clean";
      note.style.gridColumn = "span 4";
      note.innerHTML = "<span>📝 System Note: Retroactive ServiceNow approval ticket generated. Access temporarily governed pending Manager approval.</span>";
      logsContainer.appendChild(note);
      
      controls.classList.add("hidden");
      oobDetected = false;
    }
  });
}

// --- Live Governance Dashboard Ticking counters ---
function triggerDashboardCounters() {
  const activeSlide = slides[currentSlide];
  if (!activeSlide) return;
  const counters = activeSlide.querySelectorAll(".count-up");
  counters.forEach(cnt => {
    const target = parseInt(cnt.dataset.target);
    const suffix = cnt.dataset.suffix || "";
    cnt.textContent = "0" + suffix;
    
    // Slower rolling animation: delay start by 350ms to align with slide transition
    setTimeout(() => {
      // Guard: check if the slide is still active
      if (slides[currentSlide] !== activeSlide) return;
      
      const duration = 1200; // 1.2 seconds animation duration
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing: easeOutQuad
        const ease = progress * (2 - progress);
        const value = Math.floor(ease * target);
        
        cnt.textContent = value.toLocaleString() + suffix;
        
        if (progress < 1 && slides[currentSlide] === activeSlide) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, 350);
  });
}

// --- Interactive Joiner Simulator Logic ---
function initInteractiveJoiner() {
  const simBtn = document.getElementById("btn-joiner-simulate");
  const confirmBtn = document.getElementById("btn-joiner-confirm");
  const nonStarterBtn = document.getElementById("btn-joiner-nonstarter");
  const profileCard = document.getElementById("joiner-profile");
  const sysGrid = document.getElementById("joiner-sys-provisioned");
  const consoleEl = document.getElementById("joiner-alert-console");
  
  const tp1 = document.getElementById("tp-1");
  const tp2 = document.getElementById("tp-2");
  const tp3 = document.getElementById("tp-3");
  
  const provAd = document.getElementById("prov-ad");
  const provEntra = document.getElementById("prov-entra");
  const provSnow = document.getElementById("prov-snow");
  const provM365 = document.getElementById("prov-m365");
  const badge = document.getElementById("joiner-status-badge");
  
  let joinerStep = 0; // 0: Idle, 1: Imported, 2: Gated/Provisioned, 3: Completed, 4: NonStarter

  simBtn.addEventListener("click", () => {
    if (joinerStep === 0) {
      // Step 1: iTrent HR Feed Import
      playTickSound();
      joinerStep = 1;
      
      // Setup Visuals
      profileCard.classList.remove("hidden");
      badge.textContent = "Imported";
      badge.className = "card-status badge warning";
      
      tp1.classList.add("active");
      tp2.classList.remove("active", "completed");
      tp3.classList.remove("active", "completed");
      
      consoleEl.className = "sim-alert-console clear";
      consoleEl.querySelector(".status-icon").textContent = "📡";
      consoleEl.querySelector(".status-msg").textContent = "iTrent Daily HR Sync parsed. Alex Rivera (Engineer, UK) imported. Access pending D-7 trigger.";
      
      simBtn.textContent = "Trigger Day-7 Provisioning ➔";
    }
    else if (joinerStep === 1) {
      // Step 2: D-7 Trigger, provisioning accounts and ServiceNow tasks, but GATING licensing
      playTransitionSound();
      joinerStep = 2;
      
      tp1.classList.remove("active");
      tp1.classList.add("completed");
      tp2.classList.add("active");
      
      sysGrid.classList.remove("hidden");
      provAd.className = "sys-provision-badge provisioned";
      provEntra.className = "sys-provision-badge provisioned-entra";
      provSnow.className = "sys-provision-badge provisioned";
      provM365.className = "sys-provision-badge";
      provM365.innerHTML = '<span class="badge-logo-emoji">⏳</span> <span>M365 Gated</span>';
      
      consoleEl.className = "sim-alert-console clear";
      consoleEl.querySelector(".status-icon").textContent = "⚡";
      consoleEl.querySelector(".status-msg").textContent = "T-minus 7 Days: AD & Entra created in parallel. SNOW task generated. M365 license held back to save costs.";
      
      simBtn.classList.add("hidden");
      confirmBtn.classList.remove("hidden");
      nonStarterBtn.classList.remove("hidden");
    }
    else if (joinerStep === 3 || joinerStep === 4) {
      // Reset Simulator
      playTickSound();
      joinerStep = 0;
      
      profileCard.classList.add("hidden");
      sysGrid.classList.add("hidden");
      
      tp1.className = "timeline-point";
      tp2.className = "timeline-point";
      tp3.className = "timeline-point";
      
      provAd.innerHTML = '<img src="assets/ad_logo.png" class="badge-logo" alt="Active Directory"> <span>AD Account</span>';
      provAd.style.borderColor = "";
      provEntra.innerHTML = '<img src="assets/entra_logo.png" class="badge-logo" alt="Microsoft Entra"> <span>Entra ID</span>';
      provEntra.style.borderColor = "";
      provSnow.innerHTML = '<img src="assets/snow_icon.png" class="badge-logo" alt="ServiceNow"> <span>SNOW Tasks</span>';
      provSnow.style.borderColor = "";
      provM365.innerHTML = '<span class="badge-logo-emoji">⏳</span> <span>M365 Gated</span>';
      provM365.style.borderColor = "";
      
      badge.style.background = "";
      badge.style.color = "";
      
      consoleEl.className = "sim-alert-console";
      consoleEl.querySelector(".status-icon").textContent = "📡";
      consoleEl.querySelector(".status-msg").textContent = "HR Source Database Idle.";
      
      simBtn.textContent = "Simulate New Joiner 🚀";
      simBtn.classList.remove("hidden");
      confirmBtn.classList.add("hidden");
      nonStarterBtn.classList.add("hidden");
    }
  });

  confirmBtn.addEventListener("click", () => {
    // Step 3: Manager Day-0 confirmation
    playSuccessChime();
    joinerStep = 3;
    
    tp2.classList.remove("active");
    tp2.classList.add("completed");
    tp3.classList.add("completed");
    
    badge.textContent = "Active";
    badge.className = "card-status badge clear";
    badge.style.background = "rgba(57, 231, 95, 0.15)";
    badge.style.color = "var(--color-success)";
    
    provM365.className = "sys-provision-badge provisioned";
    provM365.innerHTML = '<span class="badge-logo-emoji">📧</span> <span>M365 Active</span>';
    
    consoleEl.className = "sim-alert-console clear";
    consoleEl.querySelector(".status-icon").textContent = "✉️";
    consoleEl.querySelector(".status-msg").textContent = "Day-0 Confirmed: Manager confirmed start. Initial password email sent to manager. M365 licensing active.";
    
    confirmBtn.classList.add("hidden");
    nonStarterBtn.classList.add("hidden");
    simBtn.textContent = "Reset Simulator 🔄";
    simBtn.classList.remove("hidden");
  });

  nonStarterBtn.addEventListener("click", () => {
    // Step 4: Non-Starter Triggered
    playAlertSound();
    joinerStep = 4;
    
    tp2.className = "timeline-point";
    tp3.className = "timeline-point";
    
    badge.textContent = "Non-Starter";
    badge.className = "card-status badge danger";
    badge.style.background = "rgba(255, 62, 62, 0.15)";
    badge.style.color = "var(--color-danger)";
    
    provAd.className = "sys-provision-badge";
    provAd.style.borderColor = "var(--color-danger)";
    provAd.innerHTML = '<img src="assets/ad_logo.png" class="badge-logo" alt="Active Directory"> <span>AD (Disabled) ❌</span>';
    
    provEntra.className = "sys-provision-badge";
    provEntra.style.borderColor = "var(--color-danger)";
    provEntra.innerHTML = '<img src="assets/entra_logo.png" class="badge-logo" alt="Microsoft Entra"> <span>Entra (Disabled) ❌</span>';
    
    provSnow.className = "sys-provision-badge";
    provSnow.style.borderColor = "var(--color-danger)";
    provSnow.innerHTML = '<img src="assets/snow_icon.png" class="badge-logo" alt="ServiceNow"> <span>SNOW (Canceled) ❌</span>';
    
    provM365.className = "sys-provision-badge";
    provM365.style.borderColor = "var(--color-danger)";
    provM365.innerHTML = '<span class="badge-logo-emoji">❌</span> <span>M365 (Blocked)</span>';
    
    consoleEl.className = "sim-alert-console violation";
    consoleEl.querySelector(".status-icon").textContent = "🚨";
    consoleEl.querySelector(".status-msg").textContent = "Non-Starter Event: AD/Entra accounts disabled instantly. Licensing revoked. ServiceNow tasks canceled.";
    
    confirmBtn.classList.add("hidden");
    nonStarterBtn.classList.add("hidden");
    simBtn.textContent = "Reset Simulator 🔄";
    simBtn.classList.remove("hidden");
  });
}

// --- Interactive Mover Simulator Logic ---
function initInteractiveMover() {
  const simBtn = document.getElementById("btn-mover-simulate");
  const opsApproveBtn = document.getElementById("btn-mover-ops-approve");
  const mgrAuditBtn = document.getElementById("btn-mover-mgr-audit");
  
  const roleNew = document.getElementById("mover-role-new");
  const roleOld = document.getElementById("mover-role-old");
  const roleAdhoc = document.getElementById("mover-role-adhoc");
  const consoleEl = document.getElementById("mover-alert-console");
  
  let moverStep = 0; // 0: Idle, 1: Transferred (Pending Ops), 2: Ops Approved (Pending Mgr), 3: Mgr Audited

  function resetMover() {
    moverStep = 0;
    
    roleNew.textContent = "Finance Birthright: Pending ⏳";
    roleNew.className = "mover-role-card";
    
    roleOld.textContent = "Engineering Birthright: Active ✅";
    roleOld.className = "mover-role-card active";
    
    roleAdhoc.textContent = "Ad-hoc Git Access: Pre-Existing ✅";
    roleAdhoc.className = "mover-role-card active";
    
    consoleEl.className = "sim-alert-console";
    consoleEl.querySelector(".status-icon").textContent = "🏢";
    consoleEl.querySelector(".status-msg").textContent = "User Alex Rivera currently in Engineering.";
    
    simBtn.textContent = "Trigger Department Transfer 🚀";
    simBtn.classList.remove("hidden");
    opsApproveBtn.classList.add("hidden");
    mgrAuditBtn.classList.add("hidden");
  }
  
  resetMover();

  simBtn.addEventListener("click", () => {
    if (moverStep === 0) {
      playTransitionSound();
      moverStep = 1;
      
      roleNew.textContent = "Finance Birthright: Active ✅";
      roleNew.className = "mover-role-card active";
      
      roleOld.textContent = "Eng Birthright: Pending Ops Approval ⏳";
      roleOld.className = "mover-role-card pending";
      
      consoleEl.className = "sim-alert-console clear";
      consoleEl.querySelector(".status-icon").textContent = "🔄";
      consoleEl.querySelector(".status-msg").textContent = "Phase 1: Swap birthright templates. Finance active. Eng role removal sent to Ops for approval to prevent instant lockout.";
      
      simBtn.classList.add("hidden");
      opsApproveBtn.classList.remove("hidden");
    } else if (moverStep === 3) {
      playTickSound();
      resetMover();
    }
  });

  opsApproveBtn.addEventListener("click", () => {
    if (moverStep === 1) {
      playSuccessChime();
      moverStep = 2;
      
      roleOld.textContent = "Eng Birthright: Removed ❌";
      roleOld.className = "mover-role-card removed";
      
      roleAdhoc.textContent = "Ad-hoc Git: Review Required ⏳";
      roleAdhoc.className = "mover-role-card pending";
      
      consoleEl.className = "sim-alert-console clear";
      consoleEl.querySelector(".status-icon").textContent = "📋";
      consoleEl.querySelector(".status-msg").textContent = "Phase 2: Ops approved role removal. Campaign generated for new line manager to review pre-existing ad-hoc Git Access.";
      
      opsApproveBtn.classList.add("hidden");
      mgrAuditBtn.classList.remove("hidden");
    }
  });

  mgrAuditBtn.addEventListener("click", () => {
    if (moverStep === 2) {
      playSuccessChime();
      moverStep = 3;
      
      roleAdhoc.textContent = "Ad-hoc Git: Approved & Governed ✅";
      roleAdhoc.className = "mover-role-card active";
      
      consoleEl.className = "sim-alert-console clear";
      consoleEl.querySelector(".status-icon").textContent = "🔒";
      consoleEl.querySelector(".status-msg").textContent = "Phase 3 (In Progress): Manager approved Git access. Disconnected apps manual tasks migrated to Saviynt. SNOW forms decommissioned.";
      
      mgrAuditBtn.classList.add("hidden");
      simBtn.textContent = "Reset Simulator 🔄";
      simBtn.classList.remove("hidden");
    }
  });
}

// --- Interactive Leaver Simulator Logic ---
function initInteractiveLeaver() {
  const standardBtn = document.getElementById("btn-leaver-standard");
  const t30Btn = document.getElementById("btn-leaver-t30");
  const suspendBtn = document.getElementById("btn-leaver-suspend");
  const restoreBtn = document.getElementById("btn-leaver-restore");
  const resetBtn = document.getElementById("btn-leaver-reset");
  
  const statusBadge = document.getElementById("leaver-status-badge");
  const adBadge = document.getElementById("leaver-ad");
  const entraBadge = document.getElementById("leaver-entra");
  const appsBadge = document.getElementById("leaver-apps");
  const consoleEl = document.getElementById("leaver-alert-console");

  function resetLeaver() {
    statusBadge.textContent = "Active";
    statusBadge.style.background = "rgba(57, 231, 95, 0.15)";
    statusBadge.style.color = "var(--color-success)";
    
    adBadge.className = "sys-provision-badge provisioned";
    adBadge.innerHTML = '<img src="assets/ad_logo.png" class="badge-logo" alt="Active Directory"> <span>AD Account</span><br><span style="font-size:0.6rem; opacity:0.75; font-weight:normal;" id="leaver-ad-ou">(OU: Active)</span>';
    
    entraBadge.className = "sys-provision-badge provisioned";
    entraBadge.innerHTML = '<img src="assets/entra_logo.png" class="badge-logo" alt="Microsoft Entra"> <span>Entra ID (Active Sessions)</span>';
    
    appsBadge.className = "sys-provision-badge provisioned";
    appsBadge.innerHTML = '<img src="assets/workiva_logo.png" class="badge-logo" alt="Workiva"> <span>Workiva Account</span>';
    
    consoleEl.className = "sim-alert-console";
    consoleEl.querySelector(".status-icon").textContent = "🛡️";
    consoleEl.querySelector(".status-msg").textContent = "Alex Rivera has active accounts and open sessions.";
    
    standardBtn.classList.remove("hidden");
    t30Btn.classList.add("hidden");
    suspendBtn.classList.remove("hidden");
    restoreBtn.classList.add("hidden");
    resetBtn.classList.add("hidden");
  }

  resetLeaver();

  standardBtn.addEventListener("click", () => {
    playTransitionSound();
    
    statusBadge.textContent = "Offboarded";
    statusBadge.style.background = "rgba(255, 255, 255, 0.1)";
    statusBadge.style.color = "var(--color-text-dim)";
    
    adBadge.className = "sys-provision-badge disabled-state";
    adBadge.innerHTML = '<img src="assets/ad_logo.png" class="badge-logo" alt="Active Directory"> <span>AD (Disabled) ❌</span><br><span style="font-size:0.6rem; opacity:0.75; font-weight:normal;" id="leaver-ad-ou">(OU: Leavers)</span>';
    
    entraBadge.className = "sys-provision-badge disabled-state";
    entraBadge.innerHTML = '<img src="assets/entra_logo.png" class="badge-logo" alt="Microsoft Entra"> <span>Entra ID (Disabled) ❌</span>';
    
    appsBadge.className = "sys-provision-badge disabled-state";
    appsBadge.innerHTML = '<img src="assets/workiva_logo.png" class="badge-logo" alt="Workiva"> <span>Workiva (Disabled) ❌</span>';
    
    consoleEl.className = "sim-alert-console clear";
    consoleEl.querySelector(".status-icon").textContent = "📅";
    consoleEl.querySelector(".status-msg").textContent = "Standard Leaver (T+1): AD accountExpires locked login at midnight T-0. At T+1, Saviynt disabled all accounts and moved AD to Leavers OU.";
    
    standardBtn.classList.add("hidden");
    t30Btn.classList.remove("hidden");
    suspendBtn.classList.add("hidden");
    resetBtn.classList.remove("hidden");
  });

  t30Btn.addEventListener("click", () => {
    playSuccessChime();
    
    statusBadge.textContent = "Deleted";
    statusBadge.style.background = "rgba(255, 255, 255, 0.05)";
    statusBadge.style.color = "rgba(255, 255, 255, 0.4)";
    
    adBadge.className = "sys-provision-badge deleted-state";
    adBadge.innerHTML = '<img src="assets/ad_logo.png" class="badge-logo" alt="Active Directory"> <span>AD (Deleted) 🗑️</span><br><span style="font-size:0.6rem; opacity:0.4; font-weight:normal;" id="leaver-ad-ou">(OU: N/A)</span>';
    
    entraBadge.className = "sys-provision-badge deleted-state";
    entraBadge.innerHTML = '<img src="assets/entra_logo.png" class="badge-logo" alt="Microsoft Entra"> <span>Entra ID (Deleted) 🗑️</span>';
    
    appsBadge.className = "sys-provision-badge deleted-state";
    appsBadge.innerHTML = '<img src="assets/workiva_logo.png" class="badge-logo" alt="Workiva"> <span>Workiva (Deleted) 🗑️</span>';
    
    consoleEl.className = "sim-alert-console clear";
    consoleEl.querySelector(".status-icon").textContent = "🗑️";
    consoleEl.querySelector(".status-msg").textContent = "Standard Leaver (T+30): Deletion baseline completed. Accounts permanently deleted from AD, Entra ID, and all connected applications.";
    
    t30Btn.classList.add("hidden");
  });

  suspendBtn.addEventListener("click", () => {
    playAlertSound();
    
    statusBadge.textContent = "Suspended";
    statusBadge.style.background = "rgba(255, 62, 62, 0.15)";
    statusBadge.style.color = "var(--color-danger)";
    
    adBadge.className = "sys-provision-badge disabled-state";
    adBadge.innerHTML = '<img src="assets/ad_logo.png" class="badge-logo" alt="Active Directory"> <span>AD (Disabled) ❌</span><br><span style="font-size:0.6rem; opacity:0.75; font-weight:normal;" id="leaver-ad-ou">(OU: Suspended)</span>';
    
    entraBadge.className = "sys-provision-badge disabled-state";
    entraBadge.innerHTML = '<img src="assets/entra_logo.png" class="badge-logo" alt="Microsoft Entra"> <span>Entra (Sessions Killed) ❌</span>';
    
    appsBadge.className = "sys-provision-badge disabled-state";
    appsBadge.innerHTML = '<img src="assets/workiva_logo.png" class="badge-logo" alt="Workiva"> <span>Workiva (Disabled) ❌</span>';
    
    consoleEl.className = "sim-alert-console violation";
    consoleEl.querySelector(".status-icon").textContent = "🚨";
    consoleEl.querySelector(".status-msg").textContent = "Emergency Suspension: Identity disabled instantly. Active sessions killed in Entra ID. AD account moved to Suspended OU.";
    
    standardBtn.classList.add("hidden");
    suspendBtn.classList.add("hidden");
    restoreBtn.classList.remove("hidden");
    resetBtn.classList.remove("hidden");
  });

  restoreBtn.addEventListener("click", () => {
    playSuccessChime();
    resetLeaver();
    consoleEl.className = "sim-alert-console clear";
    consoleEl.querySelector(".status-icon").textContent = "🔄";
    consoleEl.querySelector(".status-msg").textContent = "Emergency Restoration: Revocation reverted. Accounts re-enabled, OU restored to Active, and sessions recovered.";
  });

  resetBtn.addEventListener("click", () => {
    playTickSound();
    resetLeaver();
  });
}

// --- Interactive Canvas Particle Mesh for Slide 1 ---
function initTitleMesh() {
  const container = document.getElementById("title-mesh");
  if (!container) return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.opacity = "0.25";
  canvas.style.pointerEvents = "none";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let width = canvas.width = container.offsetWidth || 1280;
  let height = canvas.height = container.offsetHeight || 720;

  const particles = [];
  const particleCount = 45;
  const connectionDistance = 120;

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 2 + 1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 240, 255, 0.8)";
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const alpha = (1 - dist / connectionDistance) * 0.2;
          ctx.strokeStyle = `rgba(138, 43, 226, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("resize", () => {
    width = canvas.width = container.offsetWidth || 1280;
    height = canvas.height = container.offsetHeight || 720;
  });
}

// Slide 1: Team Onboarding Mosaic Interaction
function initTeamMosaic() {
  const cards = document.querySelectorAll(".team-mosaic-card");
  const detailIcon = document.getElementById("role-detail-icon");
  const detailTitle = document.getElementById("role-detail-title");
  const detailSubtitle = document.getElementById("role-detail-subtitle");
  const detailDesc = document.getElementById("role-detail-desc");
  const detailPanel = document.getElementById("team-detail-panel");

  const slots = [
    { row: 2, col: 2, rSpan: 2, cSpan: 1 }, // Center Slot (Slot 0)
    { row: 1, col: 1, rSpan: 2, cSpan: 1 }, // Slot 1 (DEV initial)
    { row: 1, col: 3, rSpan: 2, cSpan: 1 }, // Slot 2 (BA initial)
    { row: 1, col: 2, rSpan: 1, cSpan: 1 }, // Slot 3 (SM initial)
    { row: 3, col: 1, rSpan: 1, cSpan: 1 }, // Slot 4 (PM initial)
    { row: 3, col: 3, rSpan: 1, cSpan: 1 }  // Slot 5 (QA initial)
  ];

  const rolesData = {
    po: {
      icon: "👑",
      title: "Product Owner",
      subtitle: "App Onboarding Lead (1 Member)",
      desc: "Establishes onboarding priority, aligns business requirements, and directs delivery pipelines.",
      color: "212, 175, 55"
    },
    sm: {
      icon: "🔄",
      title: "Scrum Master",
      subtitle: "Agility & Delivery Coach (1 Member)",
      desc: "Facilitates team ceremonies, unblocks technical road blocks, and coordinates sprint schedules to maintain high-velocity project progress.",
      color: "147, 112, 219"
    },
    pm: {
      icon: "💼",
      title: "Project Manager",
      subtitle: "Operations & Lifecycle Lead (1 Member)",
      desc: "Monitors pipeline progress, schedules system migrations, and coordinates support tier handoffs.",
      color: "72, 61, 139"
    },
    dev: {
      icon: "💻",
      title: "Developers",
      subtitle: "Technical Integration Engineers (4 Members)",
      desc: "Develop native API endpoints, build custom connector configurations, and map target systems schemas.",
      color: "0, 240, 255"
    },
    ba: {
      icon: "📊",
      title: "Business Analysts",
      subtitle: "Governance & Process Designers (3 Members)",
      desc: "Analyze current-state access models, map role mappings, and compile target governance rules.",
      color: "255, 127, 80"
    },
    qa: {
      icon: "🧪",
      title: "Testers",
      subtitle: "Quality & Validation Engineers (3 Members)",
      desc: "Validate simulator workflows, execute SOD conflict checks, and perform user acceptance testing (UAT).",
      color: "255, 105, 180"
    }
  };

  const cardStates = Array.from(cards).map((card) => {
    return {
      element: card,
      id: card.dataset.id,
      slotIndex: 0
    };
  });

  // Assign slot indexes based on initial properties
  let otherIdx = 1;
  cardStates.forEach(state => {
    if (state.id === "po") {
      state.slotIndex = 0;
    } else {
      state.slotIndex = otherIdx++;
    }
  });

  const updateLayout = () => {
    cardStates.forEach(state => {
      const slot = slots[state.slotIndex];
      const card = state.element;
      
      card.style.setProperty("--row", slot.row);
      card.style.setProperty("--col", slot.col);
      card.style.setProperty("--rspan", slot.rSpan);
      card.style.setProperty("--cspan", slot.cSpan);
      
      if (state.slotIndex === 0) {
        card.classList.add("large-center");
      } else {
        card.classList.remove("large-center");
      }
    });
  };

  // Initial layout setting
  updateLayout();

  let currentCycleIndex = 0;
  const cycleOrder = ["po", "sm", "pm", "dev", "ba", "qa"];
  let manualPauseTimeout = null;

  const triggerUpdate = (clickedState, manual = true) => {
    if (clickedState.slotIndex === 0) return;

    // Find the state that is currently in Slot 0 (the center)
    const centerState = cardStates.find(state => state.slotIndex === 0);

    // Swap slot indices
    const clickedOldSlot = clickedState.slotIndex;
    clickedState.slotIndex = 0;
    centerState.slotIndex = clickedOldSlot;

    // Apply layout changes
    updateLayout();

    // Update left panel
    const roleId = clickedState.id;
    const data = rolesData[roleId];
    if (data) {
      const detailPhoto = document.getElementById("role-detail-photo");
      if (detailPhoto) {
        detailPhoto.src = `assets/team_${roleId}.png`;
        detailPhoto.style.display = 'inline-block';
      }
      if (detailIcon) {
        detailIcon.textContent = data.icon;
        detailIcon.style.display = 'none';
      }
      detailTitle.textContent = data.title;
      detailSubtitle.textContent = data.subtitle;
      detailDesc.textContent = data.desc;
      
      // Update color theme variables on detail panel
      detailPanel.style.setProperty("--role-color", data.color);
      
      // Refresh pop-in animation
      detailPanel.style.animation = "none";
      detailPanel.offsetHeight; // trigger reflow
      detailPanel.style.animation = "detailPop 0.4s ease-out forwards";
      
      playTickSound();
    }

    // Sync currentCycleIndex to the new center card
    const targetIdx = cycleOrder.indexOf(roleId);
    if (targetIdx !== -1) {
      currentCycleIndex = targetIdx;
    }

    // If triggered manually, temporarily halt and restart auto-cycling
    if (manual) {
      stopTeamCycle();
      if (manualPauseTimeout) clearTimeout(manualPauseTimeout);
      
      manualPauseTimeout = setTimeout(() => {
        if (currentSlide === 0 && !teamCycleInterval) {
          startTeamCycle();
        }
      }, 6000); // 6 seconds pause before resuming cycle
    }
  };

  const runCycleStep = () => {
    currentCycleIndex = (currentCycleIndex + 1) % cycleOrder.length;
    const nextRoleId = cycleOrder[currentCycleIndex];
    const nextState = cardStates.find(state => state.id === nextRoleId);
    if (nextState && nextState.slotIndex !== 0) {
      triggerUpdate(nextState, false);
    }
  };

  startTeamCycle = () => {
    if (teamCycleInterval) clearInterval(teamCycleInterval);
    const slide1 = document.getElementById("slide-1");
    if (slide1 && slide1.classList.contains("team-mode")) {
      teamCycleInterval = setInterval(runCycleStep, 3500);
    }
  };

  stopTeamCycle = () => {
    if (teamCycleInterval) {
      clearInterval(teamCycleInterval);
      teamCycleInterval = null;
    }
    if (manualPauseTimeout) {
      clearTimeout(manualPauseTimeout);
      manualPauseTimeout = null;
    }
  };

  cardStates.forEach(state => {
    state.element.addEventListener("click", () => triggerUpdate(state));
  });

  // Start auto-cycling on load if we are on Slide 1
  if (currentSlide === 0) {
    startTeamCycle();
  }
}

// Slide 14: Demo video controls and navigation jumps
function initDemoVideoControls() {
  const video = document.getElementById("demo-video");
  if (!video) return;

  const times = {
    "gallery-1": 0,    // Ingestion Feed
    "gallery-2": 30,   // Rule Builder
    "gallery-3": 60,   // Certification
    "gallery-4": 90    // SOD Rules
  };

  Object.entries(times).forEach(([id, time]) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => {
        playTickSound();
        video.currentTime = time;
        video.play();
      });
    }
  });
}

// --- Interactive ServiceNow & Saviynt Request Simulator logic ---
function initInteractiveRequest() {
  const reqBtn = document.getElementById("btn-req-submit");
  const resetBtn = document.getElementById("btn-req-reset");
  const approveBtn = document.getElementById("btn-req-approve");
  const rejectBtn = document.getElementById("btn-req-reject");
  const consoleEl = document.getElementById("req-alert-console");
  const approverPanel = document.getElementById("approver-actions");
  const approverTitle = document.getElementById("approver-title");
  const approverPrompt = document.getElementById("approver-prompt");
  const mitigationBox = document.getElementById("sod-mitigation-box");
  const sodControls = document.getElementById("approver-sod-controls");
  const appBtns = document.querySelectorAll(".app-req-btn");
  
  const rtp1 = document.getElementById("rtp-1");
  const rtp2 = document.getElementById("rtp-2");
  const rtp3 = document.getElementById("rtp-3");
  
  let selectedApp = "adobe"; // "adobe" or "ad-admin"
  let workflowStep = 0; // 0: Idle, 1: Submitted (Pending Level 1 Approval), 2: Level 1 Approved, 3: Provisioned/Done

  const resetFlowState = () => {
    workflowStep = 0;
    rtp1.className = "timeline-point";
    rtp2.className = "timeline-point";
    rtp3.className = "timeline-point";
    approverPanel.classList.add("hidden");
    if (mitigationBox) mitigationBox.classList.add("hidden");
    if (sodControls) sodControls.classList.add("hidden");
    resetBtn.classList.add("hidden");
    reqBtn.classList.remove("hidden");
  };

  appBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // If workflow was already started/finished, auto-reset so clicking ALWAYS switches correctly
      if (workflowStep !== 0) {
        resetFlowState();
      }
      appBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedApp = btn.dataset.app;
      playTickSound();
      
      if (selectedApp === "adobe") {
        consoleEl.className = "sim-alert-console";
        consoleEl.querySelector(".status-icon").textContent = "📝";
        consoleEl.querySelector(".status-msg").textContent = "ServiceNow: Ready to submit request for Adobe Creative Cloud (Low Risk, Manager approval only).";
      } else {
        consoleEl.className = "sim-alert-console";
        consoleEl.querySelector(".status-icon").textContent = "📝";
        consoleEl.querySelector(".status-msg").textContent = "ServiceNow: Ready to submit request for AD Admin (High Risk, Manager + Security Owner, triggers SOD conflict).";
      }
    });
  });

  reqBtn.addEventListener("click", () => {
    playTransitionSound();
    workflowStep = 1;
    reqBtn.classList.add("hidden");
    
    // Highlight Step 1: SNOW Form
    rtp1.classList.add("active");
    rtp2.classList.remove("active", "completed");
    rtp3.classList.remove("active", "completed");
    
    consoleEl.className = "sim-alert-console clear";
    consoleEl.querySelector(".status-icon").textContent = "📡";
    consoleEl.querySelector(".status-msg").textContent = `ServiceNow custom form submitted. Request pushed to Saviynt via REST API.`;
    
    // Transition to Stage 2 after 1.2s
    setTimeout(() => {
      workflowStep = 2; // Level 1 Approval State
      rtp1.classList.remove("active");
      rtp1.classList.add("completed");
      rtp2.classList.add("active");
      
      approverPanel.classList.remove("hidden");
      
      if (selectedApp === "adobe") {
        playTickSound();
        approverTitle.textContent = "Level 1 Approval: Manager Review";
        approverPrompt.textContent = "Approver: Manager (Sarah Jenkins). Review access request for Adobe CC (Low Risk). No SOD violations detected.";
        if (mitigationBox) mitigationBox.classList.add("hidden");
        if (sodControls) sodControls.classList.add("hidden");
      } else {
        playAlertSound();
        approverTitle.textContent = "Level 1 Approval: Manager Review";
        approverPrompt.textContent = "Approver: Manager (Sarah Jenkins). Review access request for AD Admin (High Risk).";
        if (mitigationBox) mitigationBox.classList.remove("hidden");
        if (sodControls) sodControls.classList.remove("hidden");
      }
      
      consoleEl.querySelector(".status-msg").textContent = "Saviynt initiated approval workflow. Awaiting Manager approval.";
    }, 1200);
  });

  const handleApproval = () => {
    if (selectedApp === "adobe") {
      // 1-Level approval is enough for Adobe. Move to Step 3: Provisioned
      playSuccessChime();
      workflowStep = 4; // Done
      
      rtp2.classList.remove("active");
      rtp2.classList.add("completed");
      rtp3.classList.add("completed");
      
      approverPanel.classList.add("hidden");
      
      consoleEl.className = "sim-alert-console clear";
      consoleEl.querySelector(".status-icon").textContent = "✅";
      consoleEl.querySelector(".status-msg").textContent = "Request Approved! Saviynt auto-provisioned Adobe CC access to target directories and closed the ticket.";
      
      resetBtn.classList.remove("hidden");
    } else {
      // AD Admin requires 2-Level approval
      if (workflowStep === 2) {
        // Manager approved, move to Security Owner approval (Level 2)
        playSuccessChime();
        workflowStep = 3; // Now at Level 2 Review
        
        approverTitle.textContent = "Level 2 Approval: Security Owner Review";
        approverPrompt.textContent = "Approver: Security Owner (Mark Vance). Review request for AD Admin. Review SOD violation and mitigation details.";
        
        const controlVal = document.getElementById("sel-mitigation-control").value;
        const durationVal = document.getElementById("sel-mitigation-duration").value;
        consoleEl.querySelector(".status-msg").textContent = `Manager approved Level 1. Mitigating Control "${controlVal}" selected. Routed to Security Owner (Level 2).`;
      } else if (workflowStep === 3) {
        // Security Owner approved. Move to Step 3: Provisioned
        playSuccessChime();
        workflowStep = 4; // Done
        
        rtp2.classList.remove("active");
        rtp2.classList.add("completed");
        rtp3.classList.add("completed");
        
        approverPanel.classList.add("hidden");
        
        const controlVal = document.getElementById("sel-mitigation-control").value;
        const durationVal = document.getElementById("sel-mitigation-duration").value;
        
        consoleEl.className = "sim-alert-console clear";
        consoleEl.querySelector(".status-icon").textContent = "🔒";
        consoleEl.querySelector(".status-msg").textContent = `Request Approved! Saviynt logged SOD mitigation control "${controlVal}" (valid for ${durationVal}) and auto-provisioned AD Admin access.`;
        
        resetBtn.classList.remove("hidden");
      }
    }
  };

  const handleRejection = () => {
    playAlertSound();
    workflowStep = 4; // Done
    
    rtp2.className = "timeline-point";
    rtp3.className = "timeline-point";
    approverPanel.classList.add("hidden");
    
    consoleEl.className = "sim-alert-console violation";
    consoleEl.querySelector(".status-icon").textContent = "❌";
    consoleEl.querySelector(".status-msg").textContent = "Request Rejected! Saviynt closed the workflow and updated ServiceNow. Access was not provisioned.";
    
    resetBtn.classList.remove("hidden");
  };

  approveBtn.addEventListener("click", handleApproval);
  rejectBtn.addEventListener("click", handleRejection);

  resetBtn.addEventListener("click", () => {
    playTickSound();
    resetFlowState();
    
    appBtns.forEach(b => b.classList.remove("active"));
    appBtns[0].classList.add("active");
    selectedApp = "adobe";
    
    consoleEl.className = "sim-alert-console";
    consoleEl.querySelector(".status-icon").textContent = "📝";
    consoleEl.querySelector(".status-msg").textContent = "ServiceNow Request Portal idle. Select an app above.";
  });
}

function initInteractiveEnvironments() {
  const container = document.getElementById("env-pipeline-container");
  const cargo = document.getElementById("env-package-cargo");
  const simulateBtn = document.getElementById("btn-env-simulate");
  const consoleEl = document.getElementById("env-alert-console");
  
  if (!container || !cargo || !simulateBtn || !consoleEl) return;

  const devStep = container.querySelector(".env-step.dev");
  const preStep = container.querySelector(".env-step.pre");
  const prodStep = container.querySelector(".env-step.prod");
  
  let isSimulating = false;
  
  const getCenterCoords = (stepEl) => {
    const containerRect = container.getBoundingClientRect();
    const icon = stepEl.querySelector(".env-icon");
    const iconRect = icon.getBoundingClientRect();
    
    // Calculate relative centers, adjusting for scale
    const x = (iconRect.left + iconRect.width / 2) - containerRect.left;
    const y = (iconRect.top + iconRect.height / 2) - containerRect.top;
    
    return { x, y };
  };

  const updatePosition = (stepEl) => {
    const coords = getCenterCoords(stepEl);
    cargo.style.left = `${coords.x}px`;
    cargo.style.top = `${coords.y}px`;
  };

  simulateBtn.addEventListener("click", () => {
    if (isSimulating) return;
    isSimulating = true;
    simulateBtn.disabled = true;
    simulateBtn.style.opacity = "0.5";
    
    // Clear any previous active glow
    [devStep, preStep, prodStep].forEach(s => s.classList.remove("active-glow"));
    
    // Show cargo and place it at DEV first
    cargo.classList.remove("hidden");
    updatePosition(devStep);
    devStep.classList.add("active-glow");
    
    playTransitionSound();
    consoleEl.querySelector(".status-icon").textContent = "📦";
    consoleEl.querySelector(".status-msg").textContent = "[1/3] DEV: Package successfully compiled, signed, and registered in Azure DevOps repository.";
    
    // Step 2: Move to PRE after 1.5s
    setTimeout(() => {
      devStep.classList.remove("active-glow");
      preStep.classList.add("active-glow");
      updatePosition(preStep);
      
      playTickSound();
      consoleEl.querySelector(".status-icon").textContent = "🔍";
      consoleEl.querySelector(".status-msg").textContent = "[2/3] PRE: Operations initiating deployment. Awaiting peer 4-Eye check verification...";
      
      // Step 3: Approve at PRE after 1.8s
      setTimeout(() => {
        playSuccessChime();
        consoleEl.querySelector(".status-icon").textContent = "✅";
        consoleEl.querySelector(".status-msg").textContent = "[2/3] PRE: Developer peer check verified. Operations successfully imported package.";
        
        // Step 4: Move to PROD after 1.8s
        setTimeout(() => {
          preStep.classList.remove("active-glow");
          prodStep.classList.add("active-glow");
          updatePosition(prodStep);
          
          playTransitionSound();
          consoleEl.querySelector(".status-icon").textContent = "🛡️";
          consoleEl.querySelector(".status-msg").textContent = "[3/3] PROD: Import package deployed. Verifying target directories synchronization...";
          
          // Step 5: Final successful state after 1.8s
          setTimeout(() => {
            playSuccessChime();
            consoleEl.querySelector(".status-icon").textContent = "🎉";
            consoleEl.querySelector(".status-msg").textContent = "PROD: Release completed successfully! All directories synchronized and secure.";
            
            // Wait 2s, then reset simulation button and hide cargo
            setTimeout(() => {
              isSimulating = false;
              simulateBtn.disabled = false;
              simulateBtn.style.opacity = "1";
              cargo.classList.add("hidden");
              prodStep.classList.remove("active-glow");
              consoleEl.querySelector(".status-icon").textContent = "📝";
              consoleEl.querySelector(".status-msg").textContent = "Deployment pipeline idle. Click simulate to trigger package flow.";
            }, 2500);
          }, 1800);
          
        }, 1800);
        
      }, 1800);
      
    }, 1500);
  });
  
  // Recalculate coordinates on window resize/scale
  window.addEventListener("resize", () => {
    if (!cargo.classList.contains("hidden")) {
      if (prodStep.classList.contains("active-glow")) {
        updatePosition(prodStep);
      } else if (preStep.classList.contains("active-glow")) {
        updatePosition(preStep);
      } else {
        updatePosition(devStep);
      }
    }
  });
}

function initInteractiveCampaigns() {
  const container = document.getElementById("slide-10");
  if (!container) return;

  const buttons = container.querySelectorAll(".bucket-btn");
  const badge = document.getElementById("campaign-badge");
  const descText = document.getElementById("bucket-description-text");
  const reviewList = document.getElementById("campaign-review-list");
  const consoleEl = document.getElementById("campaign-alert-console");
  const consoleMsg = consoleEl.querySelector(".status-msg");
  const consoleIcon = consoleEl.querySelector(".status-icon");

  if (!buttons.length || !badge || !descText || !reviewList || !consoleEl) return;

  const campaignData = {
    PQLMC: {
      desc: "PQLMC: Privileged, Quarterly campaign certified by Line Managers for Connected applications.",
      user: "John Miller",
      title: "Marketing Director",
      app: "Oracle DB Write",
      info: "⚠️ Privileged Connected",
      isPrivileged: true
    },
    SALMC: {
      desc: "SALMC: Standard, Annual campaign certified by Line Managers for Connected applications.",
      user: "Emma Watson",
      title: "HR Specialist",
      app: "Microsoft 365 E5",
      info: "Standard Connected",
      isPrivileged: false
    },
    SQEOD: {
      desc: "SQEOD: Standard, Quarterly campaign certified by Entitlement Owners for Disconnected applications.",
      user: "David Kim",
      title: "Finance Manager",
      app: "Legacy Ledger DB",
      info: "Standard Disconnected (Manual Task)",
      isPrivileged: false
    },
    SQLMD: {
      desc: "SQLMD: Standard, Quarterly campaign certified by Line Managers for Disconnected applications.",
      user: "Sophia Patel",
      title: "Logistics Lead",
      app: "Warehousing Portal",
      info: "Standard Disconnected (Manual Task)",
      isPrivileged: false
    }
  };

  const bindRowEvents = (rowEl, data) => {
    const approveBtn = rowEl.querySelector(".mock-btn.approve");
    const denyBtn = rowEl.querySelector(".mock-btn.deny");

    approveBtn.addEventListener("click", () => {
      playSuccessChime();
      consoleIcon.textContent = "✅";
      consoleMsg.textContent = `Review Decision: APPROVED access for ${data.user} on '${data.app}'.`;
      rowEl.style.opacity = "0.5";
      rowEl.style.pointerEvents = "none";
    });

    denyBtn.addEventListener("click", () => {
      playAlertSound();
      consoleIcon.textContent = "❌";
      if (data.info.includes("Connected")) {
        consoleMsg.textContent = `Review Decision: REVOKED access for ${data.user} on '${data.app}'. Auto-provisioning removal task dispatched.`;
      } else {
        consoleMsg.textContent = `Review Decision: REVOKED access for ${data.user} on '${data.app}'. Manual disconnection ticket created in ServiceNow.`;
      }
      rowEl.style.opacity = "0.5";
      rowEl.style.pointerEvents = "none";
    });
  };

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const bucket = btn.dataset.bucket;
      const data = campaignData[bucket];

      if (!data) return;

      playTickSound();
      badge.textContent = `Active: ${bucket}`;
      descText.textContent = data.desc;
      consoleIcon.textContent = "📋";
      consoleMsg.textContent = `Campaign ${bucket} loaded. Awaiting manager certifications.`;

      // Render new row
      reviewList.innerHTML = `
        <div class="mock-review-row" style="margin-bottom: 0; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 12px 10px; opacity: 1; pointer-events: auto;">
          <div class="user-info">
            <strong>${data.user}</strong>
            <span>${data.title}</span>
          </div>
          <div class="access-info">
            <strong style="color: var(--color-secondary);">${data.app}</strong>
            <span class="${data.isPrivileged ? 'text-danger' : ''}" style="color: ${data.isPrivileged ? 'var(--color-danger)' : 'var(--color-text-dim)'}; font-weight: bold;">
              ${data.isPrivileged ? '⚠️ ' : ''}${data.info}
            </span>
          </div>
          <div class="mock-actions">
            <button class="mock-btn approve">Approve</button>
            <button class="mock-btn deny">Revoke</button>
          </div>
        </div>
      `;

      const newRow = reviewList.querySelector(".mock-review-row");
      bindRowEvents(newRow, data);
    });
  });

  // Bind initial row events
  const initialRow = reviewList.querySelector(".mock-review-row");
  if (initialRow) {
    bindRowEvents(initialRow, campaignData.PQLMC);
  }
}

// ============================================================
// LEFT NAVIGATION SIDEBAR — Jump to slide & Drag-to-reorder
// ============================================================
let navDragSrcIdx = null; // module-level so it survives list rebuilds

function initNavSidebar() {
  const sidebar   = document.getElementById('slide-nav-sidebar');
  const toggleBtn = document.getElementById('nav-sidebar-toggle');
  const closeBtn  = document.getElementById('nav-sidebar-close');
  const list      = document.getElementById('nav-slide-list');

  if (!sidebar || !toggleBtn || !closeBtn || !list) {
    console.warn('Nav sidebar elements not found');
    return;
  }

  // Toggle open/close
  toggleBtn.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('open');
    toggleBtn.textContent = isOpen ? '✕' : '☰';
    toggleBtn.classList.toggle('open', isOpen);
    document.body.classList.toggle('sidebar-open', isOpen);
    setupScale();
  });

  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('open');
    toggleBtn.textContent = '☰';
    toggleBtn.classList.remove('open');
    document.body.classList.remove('sidebar-open');
    setupScale();
  });

  // Event delegation: single listener on <ul> for all item clicks
  list.addEventListener('click', (e) => {
    const item = e.target.closest('.nav-slide-item');
    if (!item) return;
    if (e.target.classList.contains('nav-drag-handle')) return;
    const idx = parseInt(item.dataset.idx, 10);
    if (!isNaN(idx)) navGoToSlide(idx);
  });

  // Drag events via delegation on the list
  list.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.nav-slide-item');
    if (!item) return;
    navDragSrcIdx = parseInt(item.dataset.idx, 10);
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  list.addEventListener('dragend', () => {
    list.querySelectorAll('.nav-slide-item').forEach(el => {
      el.classList.remove('dragging', 'drag-over');
    });
  });

  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    const item = e.target.closest('.nav-slide-item');
    list.querySelectorAll('.nav-slide-item').forEach(el => el.classList.remove('drag-over'));
    if (item) item.classList.add('drag-over');
  });

  list.addEventListener('dragleave', (e) => {
    if (!list.contains(e.relatedTarget)) {
      list.querySelectorAll('.nav-slide-item').forEach(el => el.classList.remove('drag-over'));
    }
  });

  list.addEventListener('drop', (e) => {
    e.preventDefault();
    const item = e.target.closest('.nav-slide-item');
    if (!item) return;
    item.classList.remove('drag-over');
    const destIdx = parseInt(item.dataset.idx, 10);
    if (navDragSrcIdx === null || isNaN(navDragSrcIdx) || navDragSrcIdx === destIdx) return;
    navReorderSlide(navDragSrcIdx, destIdx);
    navDragSrcIdx = null;
  });

  buildNavList();
}

function getSlideTitle(slideEl, idx) {
  const h = slideEl.querySelector(
    'h1.slide-main-title, h2.slide-header, h2.placeholder-title, h1'
  );
  if (h) {
    const text = h.textContent.trim().replace(/\s+/g, ' ');
    return text.length > 36 ? text.slice(0, 34) + '…' : text;
  }
  return 'Slide ' + (idx + 1);
}

function buildNavList() {
  const list = document.getElementById('nav-slide-list');
  if (!list) return;
  list.innerHTML = '';

  const allSlides = document.querySelectorAll('.slide');
  allSlides.forEach((slideEl, idx) => {
    const li = document.createElement('li');
    li.className = 'nav-slide-item' + (idx === currentSlide ? ' active-nav-item' : '');
    li.draggable = true;
    li.dataset.idx = idx;
    li.innerHTML =
      '<span class="nav-drag-handle" title="Drag to reorder">⠿</span>' +
      '<span class="nav-slide-num">' + (idx + 1) + '</span>' +
      '<span class="nav-slide-label">' + getSlideTitle(slideEl, idx) + '</span>';
    list.appendChild(li);
  });
}

function navGoToSlide(targetIdx) {
  const allSlides = document.querySelectorAll('.slide');
  if (targetIdx < 0 || targetIdx >= allSlides.length) return;
  allSlides[currentSlide].classList.remove('active', 'exited');
  currentSlide = targetIdx;
  allSlides[currentSlide].classList.add('active');
  
  if (targetIdx === 0) {
    const slide1 = document.getElementById("slide-1");
    if (slide1) {
      slide1.classList.add("welcome-mode");
      slide1.classList.remove("team-mode");
    }
  }
  
  playTransitionSound();
  updateSlide();
}

function navReorderSlide(fromIdx, toIdx) {
  const container = document.querySelector('.slides-container');
  const slideEls  = Array.from(container.querySelectorAll('.slide'));
  const moved = slideEls[fromIdx];
  const ref   = slideEls[toIdx];
  if (fromIdx < toIdx) {
    container.insertBefore(moved, ref.nextSibling);
  } else {
    container.insertBefore(moved, ref);
  }
  // Recalculate where the active slide is now
  const updated = Array.from(container.querySelectorAll('.slide'));
  const activeEl = container.querySelector('.slide.active');
  currentSlide = activeEl ? updated.indexOf(activeEl) : 0;
  buildNavList();
  updateSlide();
}

function refreshNavSidebar() {
  const items = document.querySelectorAll('.nav-slide-item');
  items.forEach((item, idx) => {
    item.classList.toggle('active-nav-item', idx === currentSlide);
  });
}

