import { describe, it, expect, beforeEach } from 'vitest';
import {
  pickPlayer,
  moveToNextTurn,
  resetDraftGame,
  getCurrentTeam,
  getDraftState,
  BUDGET_LIMIT,
} from './draftLogic';

// --- Test data ---

const mockPlayers = [
  { id: '1', name: 'Messi',    position: 'FORWARD',    cost: 14,  club: 'Inter Miami' },
  { id: '2', name: 'Ronaldo',  position: 'FORWARD',    cost: 13,  club: 'Al Nassr'   },
  { id: '3', name: 'Haaland',  position: 'FORWARD',    cost: 12,  club: 'Man City'   },
  { id: '4', name: 'Mbappe',   position: 'FORWARD',    cost: 90,  club: 'Real Madrid' }, // expensive — for budget tests
];

const mockTeams = [
  { userName: 'alice', teamId: 'team1', order: 0, roster: [] },
  { userName: 'bob',   teamId: 'team2', order: 1, roster: [] },
];

// Reset to a clean slate before every test so state never bleeds between tests
beforeEach(() => {
  resetDraftGame(
    mockTeams.map(t => ({ ...t, roster: [] })),
    mockPlayers
  );
});

// ─────────────────────────────────────────────
// pickPlayer
// ─────────────────────────────────────────────

describe('pickPlayer', () => {
  it('successfully picks a player and adds them to the current team roster', () => {
    const result = pickPlayer('1');

    expect(result.success).toBe(true);
    expect(getCurrentTeam().roster).toHaveLength(1);
    expect(getCurrentTeam().roster[0].name).toBe('Messi');
  });

  it('adds the player ID to selectedSoccerPlayerIds so they cannot be picked again', () => {
    pickPlayer('1');

    const state = getDraftState();
    expect(state.selectedSoccerPlayerIds.has('1')).toBe(true);
  });

  it('rejects a player that has already been picked', () => {
    pickPlayer('1');
    const result = pickPlayer('1');

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/already been picked/i);
  });

  it('rejects when no player ID is provided', () => {
    const result = pickPlayer('');

    expect(result.success).toBe(false);
  });

  it('rejects a player ID that does not exist in the player pool', () => {
    const result = pickPlayer('999');

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/not found/i);
  });

  it('rejects a pick that would exceed the 100-point budget', () => {
    // Pick the 90-point player first — leaves only 10 points
    pickPlayer('4'); // Mbappe costs 90
    moveToNextTurn(); // advance to bob so alice can pick again next round
    moveToNextTurn(); // back to alice

    // Messi costs 14 — would bring total to 104, over budget
    const result = pickPlayer('1');

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/budget/i);
  });

  it('allows a pick that fits exactly within the remaining budget', () => {
    // Haaland costs 12 — fits within 100
    const result = pickPlayer('3');

    expect(result.success).toBe(true);
  });
});

// ─────────────────────────────────────────────
// moveToNextTurn
// ─────────────────────────────────────────────

describe('moveToNextTurn', () => {
  it('advances currentTeamIndex from team 0 to team 1', () => {
    expect(getDraftState().currentTeamIndex).toBe(0);

    moveToNextTurn();

    expect(getDraftState().currentTeamIndex).toBe(1);
  });

  it('wraps back to team 0 after the last team picks', () => {
    moveToNextTurn(); // 0 → 1
    moveToNextTurn(); // 1 → 0 (wraps)

    expect(getDraftState().currentTeamIndex).toBe(0);
  });

  it('increments the round counter when wrapping around', () => {
    expect(getDraftState().currentRound).toBe(1);

    moveToNextTurn(); // 0 → 1 (still round 1)
    moveToNextTurn(); // 1 → 0 (new round)

    expect(getDraftState().currentRound).toBe(2);
  });

  it('does not increment the round mid-rotation (only on wrap)', () => {
    moveToNextTurn(); // 0 → 1

    expect(getDraftState().currentRound).toBe(1); // still round 1
  });

  it('getCurrentTeam returns the correct team after rotation', () => {
    expect(getCurrentTeam().userName).toBe('alice');

    moveToNextTurn();

    expect(getCurrentTeam().userName).toBe('bob');
  });
});
