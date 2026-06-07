import { create } from 'zustand';
import type { AppState, SpiritType, SoulPool, DialogueMessage, VisualAnalysisResult, ObservationRecord, FinalResult, PhotoHistoryItem, PkRelationshipResult } from '@/types';
import { INITIAL_SOUL_POOL } from '@/constants';
import type { DeepSeekDialogueResponse } from '@/services/deepseekApi';

interface InitialDialoguePrefetchState {
  initialDialogueRequestId: number | null;
  initialDialogueStatus: 'idle' | 'pending' | 'ready' | 'error';
  initialDialogueResponse: DeepSeekDialogueResponse | null;
  initialDialogueError: string | null;
}

interface AppActions {
  setStage: (stage: AppState['stage']) => void;
  setPhotoUrl: (url: string | null) => void;
  setVisualAnalysis: (analysis: VisualAnalysisResult | null) => void;
  addDialogueMessage: (message: DialogueMessage) => void;
  setDialogueHistory: (history: DialogueMessage[]) => void;
  setCurrentRound: (round: number) => void;
  setCurrentSpeaker: (speaker: SpiritType | null) => void;
  updateSoulPool: (pool: Partial<SoulPool>) => void;
  setObservationRecord: (record: ObservationRecord | null) => void;
  setIsGeneratingObservation: (generating: boolean) => void;
  setObservationError: (error: string | null) => void;
  setFinalResult: (result: FinalResult | null) => void;
  setIsGeneratingResult: (generating: boolean) => void;
  setResultError: (error: string | null) => void;
  setLoading: (isLoading: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  addPhotoHistory: (item: PhotoHistoryItem) => void;
  setFriendResult: (result: FinalResult | null) => void;
  setPkRelationship: (result: PkRelationshipResult | null) => void;
  setIsAnalyzingFriend: (analyzing: boolean) => void;
  setFriendAnalysisError: (error: string | null) => void;
  setIsGeneratingPk: (generating: boolean) => void;
  setPkError: (error: string | null) => void;
  beginInitialDialoguePrefetch: (requestId: number) => void;
  resolveInitialDialoguePrefetch: (requestId: number, response: DeepSeekDialogueResponse) => void;
  rejectInitialDialoguePrefetch: (requestId: number, error: string) => void;
  resetInitialDialoguePrefetch: () => void;
  clearFriendPk: () => void;
  reset: () => void;
}

const initialInitialDialogueState: InitialDialoguePrefetchState = {
  initialDialogueRequestId: null,
  initialDialogueStatus: 'idle',
  initialDialogueResponse: null,
  initialDialogueError: null,
};

const initialState: AppState & InitialDialoguePrefetchState = {
  stage: 'home',
  photoUrl: null,
  photoHistory: [],
  visualAnalysis: null,
  dialogueHistory: [],
  currentRound: 0,
  currentSpeaker: null,
  hiddenSoulPool: INITIAL_SOUL_POOL,
  observationRecord: null,
  isGeneratingObservation: false,
  observationError: null,
  finalResult: null,
  isGeneratingResult: false,
  resultError: null,
  isLoading: false,
  loadingMessage: '',
  error: null,
  friendResult: null,
  pkRelationship: null,
  isAnalyzingFriend: false,
  friendAnalysisError: null,
  isGeneratingPk: false,
  pkError: null,
  ...initialInitialDialogueState,
};

export const useAppStore = create<AppState & InitialDialoguePrefetchState & AppActions>((set) => ({
  ...initialState,

  setStage: (stage) => set({ stage }),

  setPhotoUrl: (url) => set({ photoUrl: url }),

  setVisualAnalysis: (analysis) => set({ visualAnalysis: analysis }),

  addDialogueMessage: (message) =>
    set((state) => ({
      dialogueHistory: [...state.dialogueHistory, message],
    })),

  setDialogueHistory: (history) => set({ dialogueHistory: history }),

  setCurrentRound: (round) => set({ currentRound: round }),

  setCurrentSpeaker: (speaker) => set({ currentSpeaker: speaker }),

  updateSoulPool: (pool) =>
    set((state) => ({
      hiddenSoulPool: { ...state.hiddenSoulPool, ...pool },
    })),

  setObservationRecord: (record) => set({ observationRecord: record }),

  setIsGeneratingObservation: (generating) => set({ isGeneratingObservation: generating }),

  setObservationError: (error) => set({ observationError: error }),

  setFinalResult: (result) => set({ finalResult: result }),

  setIsGeneratingResult: (generating) => set({ isGeneratingResult: generating }),

  setResultError: (error) => set({ resultError: error }),

  setLoading: (isLoading, message = '') =>
    set({ isLoading, loadingMessage: message }),

  setError: (error) => set({ error }),

  addPhotoHistory: (item) =>
    set((state) => ({
      photoHistory: [...state.photoHistory, item],
    })),

  setFriendResult: (result) => set({ friendResult: result }),

  setPkRelationship: (result) => set({ pkRelationship: result }),

  setIsAnalyzingFriend: (analyzing) => set({ isAnalyzingFriend: analyzing }),

  setFriendAnalysisError: (error) => set({ friendAnalysisError: error }),

  setIsGeneratingPk: (generating) => set({ isGeneratingPk: generating }),

  setPkError: (error) => set({ pkError: error }),

  beginInitialDialoguePrefetch: (requestId) =>
    set({
      initialDialogueRequestId: requestId,
      initialDialogueStatus: 'pending',
      initialDialogueResponse: null,
      initialDialogueError: null,
    }),

  resolveInitialDialoguePrefetch: (requestId, response) =>
    set((state) =>
      state.initialDialogueRequestId !== requestId
        ? state
        : {
            initialDialogueStatus: 'ready',
            initialDialogueResponse: response,
            initialDialogueError: null,
          }
    ),

  rejectInitialDialoguePrefetch: (requestId, error) =>
    set((state) =>
      state.initialDialogueRequestId !== requestId
        ? state
        : {
            initialDialogueStatus: 'error',
            initialDialogueResponse: null,
            initialDialogueError: error,
          }
    ),

  resetInitialDialoguePrefetch: () => set(initialInitialDialogueState),

  clearFriendPk: () =>
    set({
      friendResult: null,
      pkRelationship: null,
      isAnalyzingFriend: false,
      friendAnalysisError: null,
      isGeneratingPk: false,
      pkError: null,
    }),

  reset: () => set(initialState),
}));
