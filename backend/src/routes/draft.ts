import { Router } from "express";
import {
  getDraftState,
  getCurrentParticipant,
  pickPlayer,
  moveToNextTurn,
  resetDraftGame,
} from "../logic/draftLogic";

// ✅ Import real players from Python-generated JSON
import playersJson from "../data/generated/players.json";
import type { Player } from "../logic/draftLogic";
const realPlayers = playersJson as Player[];

const router = Router();

// Get full game state
router.get("/state", (_req, res) => {
  const state = getDraftState();
  res.json({ ...state, selectedPlayerIds: Array.from(state.selectedPlayerIds) });
});

// Get current participant's turn
router.get("/current", (_req, res) => res.json(getCurrentParticipant()));

// Check if a player is still available
router.get("/is-available/:playerId", (req, res) => {
  const { playerId } = req.params;
  const isAvailable = !getDraftState().selectedPlayerIds.has(playerId);
  res.json({ playerId, available: isAvailable });
});

// Pick a player
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
    const participant = getCurrentParticipant();
    res.json({ participant });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

//  Reset draft with real players
router.post("/reset", (req, res) => {
  const { participants } = req.body || {};
  if (!Array.isArray(participants) || participants.length === 0) {
    return res
      .status(400)
      .json({ ok: false, message: "participants array required" });
  }

  resetDraftGame(participants, realPlayers);
  return res.json({ ok: true, state: getDraftState() });
});

export default router;
