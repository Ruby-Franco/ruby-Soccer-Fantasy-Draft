// Type Definitions
export type SoccerPlayer = {
  id: string | number; // allow numbers coming from JSON, we normalize later
  name: string;
  position: string;
  cost: number;
  club: string;
};

export type DraftTeam = {
  userName: string;
  teamId: string;
  order: number;
  roster: SoccerPlayer[];
};

export type DraftGameState = {
  currentRound: number;
  currentTeamIndex: number;
  draftTeams: DraftTeam[];
  selectedSoccerPlayerIds: Set<string>; // always store as normalized string
  playerPool: SoccerPlayer[];
};

// --- Utils ---
const normalizeId = (id: string | number | undefined | null): string =>
  String(id ?? "").trim();

// Global Game State
let draftGameState: DraftGameState = {
  currentRound: 1,
  currentTeamIndex: 0,
  draftTeams: [
    { userName: "user1", teamId: "team1", order: 0, roster: [] },
  ],
  selectedSoccerPlayerIds: new Set<string>(),
  playerPool: [],
};

// Returns the DraftTeam whose turn it currently is
export function getCurrentTeam(): DraftTeam {
  const team = draftGameState.draftTeams[draftGameState.currentTeamIndex];
  if (!team) {
    throw new Error("Current team not found");
  }
  return team;
}

// Picks a soccer player for the current team
export function pickPlayer(playerUniqueId: string) {
  if (!playerUniqueId) {
    return { success: false, message: "Player ID is missing." };
  }

  const normalized = normalizeId(playerUniqueId);

  if (draftGameState.selectedSoccerPlayerIds.has(normalized)) {
    return { success: false, message: "Player has already been picked." };
  }

  const soccerPlayer = draftGameState.playerPool.find(
    (p) => normalizeId(p.id) === normalized
  );

  if (!soccerPlayer) {
    return { success: false, message: "Player not found." };
  }

  const currentTeam = getCurrentTeam();
  currentTeam.roster.push(soccerPlayer);

  draftGameState.selectedSoccerPlayerIds.add(normalized);
  return { success: true, message: "Player successfully picked!" };
}

// Moves the turn to the next team
export function moveToNextTurn() {
  draftGameState.currentTeamIndex++;
  if (draftGameState.currentTeamIndex >= draftGameState.draftTeams.length) {
    draftGameState.currentTeamIndex = 0;
    draftGameState.currentRound++;
  }
}

// Returns the current overall state of the draft
export function getDraftState(): DraftGameState {
  return draftGameState;
}

// Resets the entire draft for a new game
export function resetDraftGame(
  newDraftTeams: DraftTeam[],
  players: SoccerPlayer[]
) {
  draftGameState = {
    currentRound: 1,
    currentTeamIndex: 0,
    draftTeams: newDraftTeams
      .map((t) => ({ ...t, roster: t.roster ?? [] }))
      .sort((a, b) => a.order - b.order),
    selectedSoccerPlayerIds: new Set<string>(),
    playerPool: players,
  };
}

// Returns a specific team's roster by userName
export function getTeamRoster(userName: string): SoccerPlayer[] | null {
  const team = draftGameState.draftTeams.find((t) => t.userName === userName);
  return team ? team.roster : null;
}

// Returns all draft teams with their rosters
export function getAllDraftTeams(): DraftTeam[] {
  return draftGameState.draftTeams;
}

export function setPlayerPool(players: SoccerPlayer[]) {
  draftGameState.playerPool = players;
}

// Returns only the soccer players who haven't been picked yet
export function getPlayerPool(): SoccerPlayer[] {
  return draftGameState.playerPool.filter(
    (player) => !draftGameState.selectedSoccerPlayerIds.has(normalizeId(player.id))
  );
}
