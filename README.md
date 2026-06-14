# Saviynt Modern Presentation Deck 🚀📊

A fully interactive, premium web-based presentation deck built specifically to outline our organization's Saviynt Identity Governance and Administration (IGA) implementation.

This slide deck is designed to be presented alongside your manager to partners, featuring responsive scaling, 3D transitions, a speaker notes console panel, and live interactive compliance simulators.

---

## ⌨️ Presentation Binds & Keyboard Shortcuts

Make your presentation delivery seamless with these built-in keyboard hotkeys:

*   **Next Slide:** Press `Right Arrow` (➔), `Spacebar`, or `Page Down` (PgDn).
*   **Previous Slide:** Press `Left Arrow` (🠔) or `Page Up` (PgUp).
*   **Toggle Speaker Notes Drawer:** Press the `N` key (or click the 📝 Notes button on the controller bar).
*   **Toggle Audio Transitions:** Click the 🔊 Sound button to enable/disable subtle audio feedback.

---

## 🛠️ Key Technical Features

1.  **Dynamic 16:9 Scaling:**
    The deck is locked to a standard 1280x720 layout. JavaScript automatically scales the wrapper (`transform: scale(...)`) on browser window resizes, ensuring the deck centers perfectly on any projector or monitor without content clipping.
2.  **3D Carousel Transitions:**
    Built using CSS 3D perspectives. Slide transitions rotate and slide out along a 3D Y-axis, creating a premium visual effect.
3.  **Live Interactive SOD Sandbox (Slide 7):**
    Allows you to demonstrate Segregation of Duties (SOD) live. Drag roles like **"Create Vendor Profile"** and **"Approve Payments"** into the ServiceNow Basket. Saviynt instantly intercepts the action and generates a preventative warning block.
4.  **Live Interactive Out-of-Band Remediator (Slide 8):**
    Click **"Scan Directories"** to audit active targets. The system prints reconciliation scans in real-time, identifying out-of-band roles (rogue access). Click **"Strip Rogue Access"** or **"Retroactive Ticket"** to demonstrate immediate remediation.
5.  **Governance Live Ticker Widgets (Slide 11):**
    When landing on Slide 11, numbers automatically count up from zero to their target values, adding a dynamic, interactive dashboard feel to audit reviews.
6.  **Pacing Timer:**
    Displays elapsed minutes and seconds since the presentation load to keep your speaking time on track.

---

## 🚀 How to Run Locally

### Option 1: Direct File Open
1. Open **Finder** on your Mac.
2. Go to `/Users/tejov/Documents/Game/SaviyntPresentation`.
3. Double-click [index.html](file:///Users/tejov/Documents/Game/SaviyntPresentation/index.html) to run it immediately in your browser.

### Option 2: Local Python Server (Recommended)
To ensure that audio synthesis and notes drawers function smoothly without standard browser local-file sandboxing restrictions, run:

```bash
python3 -m http.server 8086 --directory /Users/tejov/Documents/Game/SaviyntPresentation
```

Then navigate to **[http://localhost:8086](http://localhost:8086)**!
