import { Router } from "express";
import {
  getDraftState,
  getCurrentTeam,
  pickPlayer,
  moveToNextTurn,
  resetDraftGame,
} from "../logic/draftLogic";

import playersJson from "../data/generated/players.json";
import type { SoccerPlayer } from "../logic/draftLogic";
const playerPool = playersJson as SoccerPlayer[];

const router = Router();

// Get full game state
router.get("/state", (_req, res) => {
  const state = getDraftState();
  res.json({ ...state, selectedSoccerPlayerIds: Array.from(state.selectedSoccerPlayerIds) });
});

// Get current team's turn
router.get("/current", (_req, res) => res.json(getCurrentTeam()));

// Check if a soccer player is still available
router.get("/is-available/:playerId", (req, res) => {
  const { playerId } = req.params;
  const isAvailable = !getDraftState().selectedSoccerPlayerIds.has(playerId);
  res.json({ playerId, available: isAvailable });
});

// Pick a soccer player
router.post("/pick", (req, res) => {
  const { playerId } = req.body || {};
  const result = pickPlayer(playerId);
  if (!result.success) return res.status(400).json(result);
  moveToNextTurn();
  return res.json({ ok: true, message: result.message, state: getDraftState() });
});

// Get current turn info
router.get("/turn", (_req, res) => {
  try {
    const team = getCurrentTeam();
    res.json({ team });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Reset draft with real players
router.post("/reset", (req, res) => {
  const { draftTeams } = req.body || {};
  if (!Array.isArray(draftTeams) || draftTeams.length === 0) {
    return res
      .status(400)
      .json({ ok: false, message: "draftTeams array required" });
  }

  resetDraftGame(draftTeams, playerPool);
  return res.json({ ok: true, state: getDraftState() });
});

export default router;
