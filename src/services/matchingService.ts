import { IPlayer } from '../types';

/**
 * SERVICE: Matching Logic
 * 
 * Bu dosya özellikle 4. (Kimi Tanıyorsun) ve 5. (Cevaplayan Kim) oyunlar için
 * gerekli olan karmaşık eşleştirme algoritmalarını içerir.
 */

/**
 * Fisher-Yates Shuffle Algorithm
 * Generic array shuffling helper.
 */
export function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

/**
 * GAME 2: SUPERLATIVES (ENLERI SEC) VOTING ASSIGNMENT
 * 
 * Logic:
 * We have statements: Author says Target is "Word".
 * We need a Voter.
 * Constraint: Voter != Author AND Voter != Target.
 */
export interface ISuperlativesAssignment {
  voterId: string;
  roundIndex: number; // Index in the original rounds array to reference the statement
  authorId: string;
  targetId: string;
  word: string;
}

export function assignSuperlativesVoters(
  players: IPlayer[],
  rounds: { authorId: string; targetId: string; word: string }[]
): ISuperlativesAssignment[] {
  const assignments: ISuperlativesAssignment[] = [];
  const playerIds = players.map(p => p.id);

  // For each statement, find a valid voter
  // Ideally, we want to distribute voting duties evenly.
  // Since everyone writes 1 statement, everyone should ideally vote 1 time.
  
  // Create a pool of potential voters (shuffled)
  let voterPool = shuffle([...playerIds]);
  
  rounds.forEach((round, index) => {
    // Try to find a voter in the pool who is not author and not target
    let voterIndex = voterPool.findIndex(id => id !== round.authorId && id !== round.targetId);
    let voterId: string;

    if (voterIndex !== -1) {
      voterId = voterPool[voterIndex];
      voterPool.splice(voterIndex, 1); // Remove from pool to try and keep it 1-to-1
    } else {
      // Fallback: Pick any valid player from the full list (someone might vote twice)
      const validPlayers = playerIds.filter(id => id !== round.authorId && id !== round.targetId);
      voterId = validPlayers[Math.floor(Math.random() * validPlayers.length)];
    }

    if (voterId) {
      assignments.push({
        voterId,
        roundIndex: index,
        authorId: round.authorId,
        targetId: round.targetId,
        word: round.word
      });
    }
  });

  return assignments;
}

/**
 * GAME 4: KIMI TANIYORSUN (WHO DO YOU KNOW) MATCHING
 * 
 * Logic:
 * 1. Phase 1 (Writing): Player A writes about Player B.
 *    - Solution: Circular assignment or shuffled Derangement.
 * 
 * 2. Phase 2 (Answering): Player C reads/answers the question A wrote about B.
 *    - Constraint: C != A (Author) AND C != B (Target).
 */
export interface IGame4Pairing {
  authorId: string;
  targetId: string;
  readerId: string;
}

export function generateGame4Pairings(players: IPlayer[]): IGame4Pairing[] {
  const pIds = players.map(p => p.id);
  const pairings: IGame4Pairing[] = [];
  
  // Step 1: Assign Targets (Circular Shift for simplicity and guaranteed validity)
  // Player[i] writes about Player[i+1]
  const shuffledPlayers = shuffle(pIds);
  
  for (let i = 0; i < shuffledPlayers.length; i++) {
    const author = shuffledPlayers[i];
    const target = shuffledPlayers[(i + 1) % shuffledPlayers.length];
    
    // Step 2: Find a valid Reader
    // Reader cannot be Author or Target.
    // We search the pool for a valid candidate.
    let possibleReaders = shuffledPlayers.filter(id => id !== author && id !== target);
    
    // To ensure fair distribution, we ideally want to pick a reader who hasn't read yet,
    // but for simplicity in this pure function, we pick random valid.
    const reader = possibleReaders[Math.floor(Math.random() * possibleReaders.length)];

    pairings.push({
      authorId: author,
      targetId: target,
      readerId: reader
    });
  }

  return pairings;
}

/**
 * GAME 5: CEVAPLAYAN KIM (WHO ANSWERED) DISTRIBUTION
 * 
 * Logic (Circular Shift Method):
 * 1. Number of answers needed per question (K): 2 if Players < 5, else 3.
 * 2. To ensure uniform distribution, we treat players as a circle.
 * 3. Player at index `i` answers questions from authors at `(i + shift) % P`.
 * 4. We perform `K` shifts (shift=1, shift=2, ... shift=K).
 * 
 * Result:
 * - Every Player answers exactly K questions.
 * - Every Question receives exactly K answers.
 * - No one answers their own question (since shift > 0).
 */
export interface IGame5Distribution {
  playerId: string; // The person answering
  questionId: string; // The question ID
  questionText: string;
  questionAuthorId: string;
}

export function distributeGame5Questions(
  players: IPlayer[], 
  questions: { id: string; authorId: string; text: string }[]
): IGame5Distribution[] {
  const P = players.length;
  // Determine Load Factor (K)
  const K = P >= 5 ? 3 : 2;

  const assignments: IGame5Distribution[] = [];
  
  // Create a shuffled list of player IDs to randomize the "circle" order
  // This prevents obvious "I always answer the person to my right" patterns
  const circleIds = shuffle(players.map(p => p.id));
  
  // Perform K shifts
  for (let shift = 1; shift <= K; shift++) {
      for (let i = 0; i < P; i++) {
          const answererId = circleIds[i];
          
          // Find the Author based on the shift
          // If Answerer is at i, Author is at (i + shift) % P
          // This ensures Answerer != Author because shift is between 1 and K, and K < P (assuming P >= 3)
          const authorIndex = (i + shift) % P;
          const authorId = circleIds[authorIndex];

          // Find the question object belonging to this author
          const question = questions.find(q => q.authorId === authorId);

          if (question) {
              assignments.push({
                  playerId: answererId,
                  questionId: question.id,
                  questionText: question.text,
                  questionAuthorId: question.authorId
              });
          }
      }
  }

  // Shuffle final assignments so users don't see a pattern in the order they receive tasks
  return shuffle(assignments);
}