# Agency HQ - FINISH SPEC

**Goal:** Make Agency HQ actually usable, not just buildable.
**Standard:** Definition of Done (7-11 iterations, tested, verified, delightful)
**Owner:** Daniel
**Deadline:** Today

---

## Current State Audit

### What Exists
- [x] Convex schema deployed
- [x] Basic page structure (/, /clients, /clients/[slug], /agents, /settings)
- [x] Some Convex functions
- [x] Build passes

### What's Broken/Missing
- [ ] No seed data - dashboard is empty
- [ ] No task creation UI
- [ ] No task editing/status change UI
- [ ] No client creation UI
- [ ] Activity feed not populated
- [ ] Agent heartbeat not integrated with Clawdbot
- [ ] Audit log not implemented
- [ ] Notifications not implemented
- [ ] No loading states
- [ ] No error states
- [ ] Not tested end-to-end

---

## Definition of "Finished"

### Must Have (MVP Complete)

1. **Seed Data Present**
   - [ ] RTV agency record exists
   - [ ] All 6 agency agents (Daniel, Foreman, PM, Growth, Creative, Builder, Research)
   - [ ] 2 clients (SimsCo, 1322) with real data
   - [ ] Sample tasks in various states
   - [ ] Sample activities

2. **Dashboard Functional**
   - [ ] Stats show real data (MRR, clients, capacity)
   - [ ] Client health list shows clients with correct status colors
   - [ ] Agent cards show real agents with status
   - [ ] Activity feed shows recent activity
   - [ ] Task board shows real tasks, can be clicked

3. **Task Management Works**
   - [ ] Can create new task (modal/form)
   - [ ] Can change task status (drag or click)
   - [ ] Can assign task to agent
   - [ ] Task detail view shows full info

4. **Client Pages Work**
   - [ ] Client list shows all clients
   - [ ] Client detail shows domains, tasks, agents, contacts
   - [ ] Can navigate between clients
   - [ ] Health score displays correctly

5. **Agent Pages Work**
   - [ ] Shows all agency agents with levels
   - [ ] Shows client agents grouped by client
   - [ ] Status indicators accurate

6. **Settings Page Works**
   - [ ] Displays current settings
   - [ ] Can save changes (persists to Convex)

7. **Visual Polish**
   - [ ] Consistent styling
   - [ ] Loading states for all async data
   - [ ] Empty states for no data
   - [ ] Error handling displayed gracefully

8. **Integration Ready**
   - [ ] Agents can query/update via Convex functions
   - [ ] Activity auto-logs on mutations
   - [ ] Functions documented

---

## Execution Plan

### Step 1: Seed Data (15 min)
Create comprehensive seed script with real RTV data.

### Step 2: Fix Dashboard (30 min)
Wire up all widgets to real data, add loading/empty states.

### Step 3: Task Management (45 min)
Add create modal, status change, task detail modal.

### Step 4: Client Pages (30 min)
Fix client list, detail view, add create client flow.

### Step 5: Integration Functions (30 min)
Ensure all agent-facing functions work, add activity logging.

### Step 6: Polish Pass (30 min)
Loading states, empty states, error handling, visual consistency.

### Step 7: Verification (30 min)
Test every flow manually, fix issues, verify on localhost.

---

## Verification Checklist

Before calling this done:

- [ ] Fresh `convex dev` + seed runs without errors
- [ ] Dashboard loads with real data in <2s
- [ ] Can create a task and see it appear
- [ ] Can move task through statuses
- [ ] Can click through to client detail
- [ ] Can see agent status on agents page
- [ ] Settings save and persist
- [ ] No console errors
- [ ] Looks professional (would show to a client)

---

*This spec is the contract. Nothing is done until all boxes are checked.*
