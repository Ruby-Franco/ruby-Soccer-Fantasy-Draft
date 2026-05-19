// Type Definitions
export type Player = {
  id: string | number; // allow numbers coming from JSON, we normalize later
  name: string;
  position: string;
  cost: number;
  club: string;
};

export type Participant = {
  participantId: string;
  teamId: string;
  order: number;
  team: Player[]; // Ruby add
};

export type DraftGameState = {
  currentRound: number;
  currentParticipantIndex: number;
  participants: Participant[];
  selectedPlayerIds: Set<string>; // always store as normalized string
  availablePlayers: Player[];
};

// --- Utils ---
const normalizeId = (id: string | number | undefined | null): string =>
  String(id ?? "").trim();

// Global Game State
let draftGameState: DraftGameState = {
  currentRound: 1,
  currentParticipantIndex: 0,
  participants: [
    { participantId: "user1", teamId: "team1", order: 0, team: [] },
    //{ participantId: "user2", teamId: "team2", order: 1, team: [] },
  ],
  selectedPlayerIds: new Set<string>(),
  availablePlayers: [],
};

// Functions

// Returns the participant whose turn it currently is
export function getCurrentParticipant(): Participant {
  const participant =
    draftGameState.participants[draftGameState.currentParticipantIndex];
  if (!participant) {
    throw new Error("Current participant not found");
  }
  return participant;
}

// Picks a player for the current participant
export function pickPlayer(playerUniqueId: string) {
  if (!playerUniqueId) {
    return { success: false, message: "Player ID is missing." };
  }

  // normalize inputs to avoid string/number or whitespace mismatches
  const normalized = normalizeId(playerUniqueId);

  if (draftGameState.selectedPlayerIds.has(normalized)) {
    return { success: false, message: "Player has already been picked." };
  }

  // find by normalized id
  const player = draftGameState.availablePlayers.find(
    (p) => normalizeId(p.id) === normalized
  );

  if (!player) {
    return { success: false, message: "Player not found." };
  }

  const currentParticipant = getCurrentParticipant();
  currentParticipant.team.push(player);

  draftGameState.selectedPlayerIds.add(normalized);
  return { success: true, message: "Player successfully picked!" };
}

// Moves the turn to the next participant
export function moveToNextTurn() {
  draftGameState.currentParticipantIndex++;
  if (
    draftGameState.currentParticipantIndex >=
    draftGameState.participants.length
  ) {
    draftGameState.currentParticipantIndex = 0;
    draftGameState.currentRound++;
  }
}

// Returns the current overall state of the draft
export function getDraftState(): DraftGameState {
  return draftGameState;
}

// Resets the entire draft for testing or starting a new game
export function resetDraftGame(
  newParticipants: Participant[],
  players: Player[]
) {
  draftGameState = {
    currentRound: 1,
    currentParticipantIndex: 0,
    participants: newParticipants
      .map((p) => ({ ...p, team: p.team ?? [] }))
      .sort((a, b) => a.order - b.order),
    selectedPlayerIds: new Set<string>(),
    availablePlayers: players,
  };
}

// Helpers

export function getCurrentTeam(): Player[] {
  const currentParticipant = getCurrentParticipant();
  return currentParticipant.team;
}

// Returns a specific participant's team by participantId
export function getParticipantTeam(participantId: string): Player[] | null {
  const participant = draftGameState.participants.find(
    (p) => p.participantId === participantId
  );
  return participant ? participant.team : null;
}

// Returns all participants with their teams
export function getAllParticipantsWithTeams(): Participant[] {
  return draftGameState.participants;
}

export function setAvailablePlayers(players: Player[]) {
  draftGameState.availablePlayers = players;
}

// Returns only the players who haven't been picked yet
export function getAvailablePlayers(): Player[] {
  return draftGameState.availablePlayers.filter(
    (player) => !draftGameState.selectedPlayerIds.has(normalizeId(player.id))
  );
}
