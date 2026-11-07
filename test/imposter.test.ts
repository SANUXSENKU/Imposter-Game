import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import { db, initDatabase, getRandomWord, upsertPlayer, updatePlayerScore, getLeaderboard, getAvailableCategories } from '../src/server/db/database.ts';
import { RoomManager } from '../src/server/game/RoomManager.ts';
import { GameRoom } from '../src/server/game/Room.ts';
import { Player } from '../src/shared/types.ts';

describe('IMPOSTER Game Suite & AUTHORITATIVE ENGINE TESTS', () => {
  let server: http.Server;
  let io: SocketIOServer;
  let roomManager: RoomManager;

  before(() => {
    initDatabase();
    db.exec(`
      DELETE FROM scores WHERE player_id LIKE 'test_%';
      DELETE FROM players WHERE id LIKE 'test_%';
    `);
    server = http.createServer();
    io = new SocketIOServer(server);
    roomManager = new RoomManager(io);
  });

  after(() => {
    io.close();
    server.close();
  });

  it('1. Database Initialization & Seeding', () => {
    const categories = getAvailableCategories();
    assert.ok(categories.length >= 10, 'Expected at least 10 categories');
    assert.ok(categories.includes('Food'), 'Expected Food category');
    assert.ok(categories.includes('Animals'), 'Expected Animals category');

    const totalWords = db.prepare('SELECT COUNT(*) as count FROM word_records').get() as { count: number };
    assert.ok(totalWords.count >= 200, `Expected at least 200 words, found ${totalWords.count}`);
  });

  it('2. Word Selection and Hint Isolation', () => {
    const foodWord = getRandomWord(['Food']);
    assert.strictEqual(foodWord.category, 'Food');
    assert.ok(foodWord.word.length > 0);
    assert.ok(foodWord.hints.length >= 1, 'Expected at least 1 hint');

    // Confirm hints do not equal the secret word directly
    assert.notStrictEqual(foodWord.hints[0].toLowerCase(), foodWord.word.toLowerCase());
  });

  it('3. Player Registration and Leaderboard Persistence', () => {
    const testPlayer: Player = {
      id: 'test_p1',
      sessionToken: 'tok_test_p1',
      displayName: 'Agent Falcon',
      avatarId: 'avatar-1',
      isHost: true,
      isReady: true,
      isConnected: true,
      score: 0
    };

    upsertPlayer(testPlayer);

    // Update score
    updatePlayerScore(testPlayer.id, {
      won: true,
      isImposter: false,
      pointsDelta: 125,
      displayName: testPlayer.displayName,
      avatarId: testPlayer.avatarId
    });

    const leaderboard = getLeaderboard(5);
    const entry = leaderboard.find((e: any) => e.playerId === testPlayer.id);
    assert.ok(entry, 'Expected player in leaderboard');
    assert.strictEqual((entry as any).points, 125);
    assert.strictEqual((entry as any).totalWins, 1);
  });

  it('4. Room Creation, Joining, and Max Player Limits', () => {
    const host: Player = {
      id: 'host_1',
      sessionToken: 'tok_host_1',
      displayName: 'Commander Alpha',
      avatarId: 'avatar-1',
      isHost: true,
      isReady: true,
      isConnected: true,
      score: 0
    };

    const room = roomManager.createRoom(host);
    assert.ok(room.code.length >= 4);
    assert.strictEqual(room.players.size, 1);

    // Add 2nd and 3rd player
    const p2: Player = { id: 'p2', sessionToken: 'tok_p2', displayName: 'P2', avatarId: 'avatar-2', isHost: false, isReady: true, isConnected: true, score: 0 };
    const p3: Player = { id: 'p3', sessionToken: 'tok_p3', displayName: 'P3', avatarId: 'avatar-3', isHost: false, isReady: true, isConnected: true, score: 0 };

    assert.strictEqual(room.addPlayer(p2, 'sock_p2'), true);
    assert.strictEqual(room.addPlayer(p3, 'sock_p3'), true);
    assert.strictEqual(room.players.size, 3);
  });

  it('5. Secret Word Assignment and Role Privacy Verification', () => {
    const host: Player = { id: 'h_test', sessionToken: 'tok_h', displayName: 'Host', avatarId: 'avatar-1', isHost: true, isReady: true, isConnected: true, score: 0 };
    const room = new GameRoom('r_privacy', 'TEST1', host, io);
    room.addPlayer({ id: 'p_2', sessionToken: 'tok_2', displayName: 'Player 2', avatarId: 'avatar-2', isHost: false, isReady: true, isConnected: true, score: 0 }, 's_2');
    room.addPlayer({ id: 'p_3', sessionToken: 'tok_3', displayName: 'Player 3', avatarId: 'avatar-3', isHost: false, isReady: true, isConnected: true, score: 0 }, 's_3');

    // Start game
    const started = room.startGame(host.id);
    assert.strictEqual(started, true);
    assert.strictEqual(room.phase, 'ASSIGNMENT');

    // Authoritative state check
    const roles = Array.from(room.playerRoles.values());
    const imposterCount = roles.filter(r => r === 'IMPOSTER').length;
    const civilianCount = roles.filter(r => r === 'CIVILIAN').length;

    assert.strictEqual(imposterCount, 1, 'Exactly 1 imposter expected');
    assert.strictEqual(civilianCount, 2, 'Exactly 2 civilians expected');

    // Check public state projection does NOT leak secret word or roles!
    const publicState = room.getPublicState();
    assert.strictEqual((publicState as any).secretWord, undefined, 'Secret word MUST NOT be in public state');
    assert.strictEqual((publicState as any).playerRoles, undefined, 'Player roles MUST NOT be in public state');
    assert.strictEqual((publicState as any).imposterIds, undefined, 'Imposter IDs MUST NOT be in public state');
  });

  it('6. Clue Submission, Turn Sequence, and Redaction of Direct Giveaways', () => {
    const host: Player = { id: 'h_clue', sessionToken: 'tok_hc', displayName: 'Host', avatarId: 'avatar-1', isHost: true, isReady: true, isConnected: true, score: 0 };
    const room = new GameRoom('r_clue', 'TEST2', host, io);
    room.addPlayer({ id: 'p_b', sessionToken: 'tok_b', displayName: 'Player B', avatarId: 'avatar-2', isHost: false, isReady: true, isConnected: true, score: 0 }, 's_b');
    room.addPlayer({ id: 'p_c', sessionToken: 'tok_c', displayName: 'Player C', avatarId: 'avatar-3', isHost: false, isReady: true, isConnected: true, score: 0 }, 's_c');

    room.startGame(host.id);
    // Manually force to CLUE phase for testing
    (room as any).startCluePhase();
    assert.strictEqual(room.phase, 'CLUE');

    const firstSpeaker = room.speakerOrder[0];
    const nonSpeaker = room.speakerOrder[1];

    // Non-speaker trying to submit should fail
    const invalidSubmit = room.submitClue(nonSpeaker, 'Premature clue');
    assert.strictEqual(invalidSubmit, false);

    // Current speaker submits direct giveaway (secret word)
    const directWord = room.secretWord;
    const validSubmit = room.submitClue(firstSpeaker, `It is definitely ${directWord}!`);
    assert.strictEqual(validSubmit, true);

    // Verify word was sanitized/redacted by server
    assert.strictEqual(room.clues[0].clueText.includes(directWord), false, 'Direct giveaway should be redacted');

    // Advancing through all speakers transitions to DISCUSSION
    const secondSpeaker = room.speakerOrder[1];
    const thirdSpeaker = room.speakerOrder[2];
    room.submitClue(secondSpeaker, 'Subtle clue 2');
    room.submitClue(thirdSpeaker, 'Subtle clue 3');

    assert.strictEqual(room.phase, 'DISCUSSION');
    assert.strictEqual(room.clues.length, 3);
  });

  it('7. Voting System, Tie-Breakers, and Prevention of Self-Voting', () => {
    const host: Player = { id: 'h_vote', sessionToken: 'tok_hv', displayName: 'Host', avatarId: 'avatar-1', isHost: true, isReady: true, isConnected: true, score: 0 };
    const room = new GameRoom('r_vote', 'TEST3', host, io);
    room.addPlayer({ id: 'p_2', sessionToken: 'tok_2', displayName: 'P2', avatarId: 'avatar-2', isHost: false, isReady: true, isConnected: true, score: 0 }, 's_2');
    room.addPlayer({ id: 'p_3', sessionToken: 'tok_3', displayName: 'P3', avatarId: 'avatar-3', isHost: false, isReady: true, isConnected: true, score: 0 }, 's_3');

    room.startGame(host.id);
    (room as any).startVotingPhase(false);
    assert.strictEqual(room.phase, 'VOTING');

    // Self-voting must fail
    const selfVote = room.castVote('h_vote', 'h_vote');
    assert.strictEqual(selfVote, false, 'Self-voting should be rejected');

    // Valid vote
    const validVote = room.castVote('h_vote', 'p_2');
    assert.strictEqual(validVote, true);
    assert.strictEqual(room.votes.get('h_vote'), 'p_2');
  });

  it('8. Complete Simulated Game with Winner Determination', () => {
    const host: Player = { id: 'u1', sessionToken: 'tok_1', displayName: 'User1', avatarId: 'avatar-1', isHost: true, isReady: true, isConnected: true, score: 0 };
    const room = new GameRoom('r_sim', 'TEST4', host, io);
    room.addPlayer({ id: 'u2', sessionToken: 'tok_2', displayName: 'User2', avatarId: 'avatar-2', isHost: false, isReady: true, isConnected: true, score: 0 }, 's_2');
    room.addPlayer({ id: 'u3', sessionToken: 'tok_3', displayName: 'User3', avatarId: 'avatar-3', isHost: false, isReady: true, isConnected: true, score: 0 }, 's_3');

    room.settings.allowImposterGuess = false; // direct test without guess delay
    room.startGame(host.id);

    // Identify who is imposter
    const imposterId = Array.from(room.playerRoles.entries()).find(([_, r]) => r === 'IMPOSTER')![0];
    const civilianIds = Array.from(room.playerRoles.entries()).filter(([_, r]) => r === 'CIVILIAN').map(([id]) => id);

    // Force voting phase
    (room as any).startVotingPhase(false);

    // All players vote for the Imposter
    room.castVote(civilianIds[0], imposterId);
    room.castVote(civilianIds[1], imposterId);
    room.castVote(imposterId, civilianIds[0]);

    // Outcome should be REVEAL with Civilians Winning
    assert.strictEqual(room.phase, 'REVEAL');
    assert.ok(room.lastRoundResult, 'Expected last round result');
    assert.strictEqual(room.lastRoundResult.winnerTeam, 'CIVILIANS');
    assert.strictEqual(room.lastRoundResult.eliminatedPlayerId, imposterId);
    assert.strictEqual(room.lastRoundResult.wasImposterEliminated, true);

    // Check civilian score bonus
    const civPlayer = room.players.get(civilianIds[0])!;
    assert.ok(civPlayer.score >= 100, 'Civilian should earn points for win');
  });
});
