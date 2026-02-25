Status: Implemented in this iteration ✅

# Suggestions to improve usability, WCAG compliance, and premium polish

This build recreates the Figma Make layout as a static, GitHub Pages–friendly prototype. Below are targeted upgrades that will materially improve UX, accessibility, and “studio-grade” finish.

## 1) Usability wins (highest impact)
- **Global command palette (⌘K / Ctrl+K):** Fast product/SKU search + quick actions (create PO, approve, reorder). Huge for procurement managers.
- **Saved views for catalog:** “Branch essentials”, “Approved suppliers only”, “Contract items”, “Under budget”. Makes browsing feel enterprise-grade.
- **Sticky cart + PO summary:** Persistent drawer showing totals, shipping to branch, budget impact, approver chain.
- **Reorder center:** One-click reorder of frequently purchased SKUs with branch-level quantities.
- **Activity timeline with filters:** Let users filter by branch, PO status, supplier, category.

## 2) WCAG / accessibility upgrades
- **Skip link + landmarks:** Add a “Skip to content” link and ensure header/nav/main/footer landmarks are consistent on every page.
- **Keyboard navigation:** Ensure carousel buttons, cards, filters, and “Add to Cart” are reachable and usable via keyboard.
- **Visible focus states:** Keep the current focus ring, but verify it appears on all interactive components (buttons, links, inputs, custom controls).
- **Contrast checks:** Validate text contrast for gray copy on light backgrounds and red-on-white badges; adjust to meet WCAG AA.
- **Form labels + errors:** Make sure every input has a visible label, error states are announced (aria-live), and helper text is associated.
- **Reduced motion mode:** Respect `prefers-reduced-motion` for parallax/animations (already scaffolded—extend to all new motion).

## 3) Premium polish (visual + motion)
- **Motion system:** Define 3 consistent transitions:
  - Micro-hover: 120–160ms, subtle translate/scale
  - Page/section reveal: 240–320ms fade + 6–10px lift
  - Modal/drawer: 220ms ease-out
- **Skeleton loading:** Add “shimmer” placeholders for product tiles + dashboard cards (feels like real data).
- **Image art direction:** Use 3 tiers of imagery:
  - Hero: people + environment (warehouse/shop floor)
  - Category: product-in-use
  - Product tiles: clean product shots
- **Data visualization:** Upgrade the line chart to include:
  - Clear axis labels
  - Hover crosshair
  - Benchmarks (budget line, target savings)

## 4) Dashboard feature ideas that look great in a portfolio
- **Intelligence Hub panel:** AI-based “Savings identified”, “Contract compliance”, “Inventory risk” with explainability (why, confidence, recommended action).
- **Approval queue with animation:** A compact table that expands to show PO details + policy violations (budget, supplier, thresholds) before approval.

## 5) IA / narrative improvements for portfolio impact
- Add a **"What this prototype demonstrates"** section on Home (2–3 bullets): approvals, multi-branch buying, spend visibility.
- Add 1 “**before/after**” mini-story: how a manager used the dashboard to reduce stockouts + save spend.

---
If you want, I can implement the **Intelligence Hub** + **Approval Queue** as two dashboard modules next (they’re the best portfolio ROI).
