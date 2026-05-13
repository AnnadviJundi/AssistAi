# Quiz Mode MCQ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Quiz Mode from freeform chat into a multiple-choice flow with one question, three answer buttons, explanation feedback, and a Next Question action.

**Architecture:** Keep Explain Mode unchanged. For Quiz Mode, the backend returns structured quiz payloads from Gemini and the frontend renders those payloads as interactive cards inside the chat timeline. The frontend evaluates selected options locally and only calls the backend again when the user starts a quiz topic or requests the next question.

**Tech Stack:** React, Vite, Tailwind CSS v4, local shadcn-style UI components, Gemini REST API

---

### Task 1: Structured quiz payloads

**Files:**
- Modify: `server/chat-handler.js`
- Modify: `src/lib/study-assistant.js`

- [ ] Add a quiz-specific system instruction that forces Gemini to return strict JSON with `question`, `options`, `correctOption`, `explanation`, and `topic`.
- [ ] Parse quiz JSON on the server and normalize malformed output into a user-facing error.
- [ ] Keep Explain Mode on the current text response path.

### Task 2: Interactive quiz rendering

**Files:**
- Modify: `src/pages/ChatPage.jsx`

- [ ] Add quiz message metadata support in client state so assistant messages can carry either markdown text or a quiz payload.
- [ ] Render Quiz Mode assistant responses as a card with three answer buttons.
- [ ] Lock answers after one selection, reveal explanation, and show a `Next Question` button only after selection.

### Task 3: Quiz flow and session persistence

**Files:**
- Modify: `src/pages/ChatPage.jsx`
- Modify: `src/lib/study-assistant.js`

- [ ] Store selected answer and revealed explanation state in session history so refresh does not reset the active quiz card.
- [ ] Trigger the next backend request only from the topic submit action and the `Next Question` action.
- [ ] Preserve mode reset and Clear Session behavior.

### Task 4: Verification

**Files:**
- Modify if needed after verification: `src/pages/ChatPage.jsx`, `server/chat-handler.js`

- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.
- [ ] Smoke-check that Explain Mode still renders markdown and Quiz Mode shows buttons plus explanation state.
