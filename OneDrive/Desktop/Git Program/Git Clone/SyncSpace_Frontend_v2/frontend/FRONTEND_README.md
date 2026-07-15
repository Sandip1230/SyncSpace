# SyncSpace — Frontend

React + Yjs + Konva + Monaco. Code editor is the primary view; the
whiteboard opens as a slide-in panel from the **Annotate** button (also
mirrored as a Code/Annotate switch in the header).

## Setup

```bash
npm install
cp .env.example .env        # adjust VITE_SERVER_URL if needed
npm run dev                 # frontend on http://localhost:5173
npm run server              # backend on http://localhost:3001 (separate terminal)
```

The app works fully standalone even with the backend offline — the
header just shows **Offline** and edits stay local until a connection
is available.

Open the same URL (with the same `?room=` query param) in two tabs to
test live sync once `yjs-relay` is added server-side (see below).

## What's implemented

- **Code Editor** — Monaco, bound to a shared `Y.Text` via `y-monaco`.
  Language switcher, tab bar, cursor position in the status bar, custom
  dark theme matching the brand palette.
- **Whiteboard** — Konva canvas with pen, rectangle, ellipse, arrow,
  text, and eraser tools; 6 preset colors + custom color picker; 3
  stroke widths; undo/redo (`Y.UndoManager`); clear board; drag to
  reposition shapes. All shape state lives in a shared `Y.Map`, so it's
  structured the same way the code text is — ready for real-time sync
  the moment the backend relay exists.
- **Mode switch** — code view and whiteboard are two modes of one
  workspace, not two separate pages. `Esc` always returns to code.

## What's intentionally out of scope for now

- Shape resize handles / multi-select (move-only for Week 1)
- Live preview of in-progress strokes to other users (shapes sync once
  committed on mouse-up, not on every mouse-move — keeps CRDT traffic
  sane; can be added later if live "watch them draw" matters)
- Cursor presence / avatars (peer *count* is already live via the
  existing `userJoined`/`userLeft` events; per-user cursors need
  Yjs Awareness wired through the socket relay too)

## Connecting real-time sync (backend teammate)

The frontend already emits/listens for a small Yjs-over-Socket.io
contract. See `server-additions/yjsRelay.js` for a ready-to-paste
implementation and `src/lib/socketYjsProvider.js` for the client side
of the same contract.

**Heads up:** `server.js` currently does
`require('./sockets/roomHandler')` but the file on disk is
`sockets/roomHandle.js` — that mismatch will throw on `npm run server`
until the name is fixed on one side or the other.

## Folder structure

```
src/
  components/
    Layout/       AppShell, Header (mode switch)
    CodeEditor/    Monaco pane
    Whiteboard/    Konva canvas + Toolbar
  hooks/
    useSocket.js   Socket.io connection + room presence
    useYDoc.js     Shared Y.Doc (ytext + shapesMap)
  lib/
    socketYjsProvider.js   Yjs <-> Socket.io bridge
    id.js
  styles/
    variables.css  Design tokens (70/20/10 palette)
    global.css
```
