import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { getApiBase } from '../services/config';

interface ProgressContextType {
  lastLessonId: string | null;
  lastFlashcardId: string | null;
  lastFlashcardDeckId: string | null;
  lastFlashcardIndex: number | null;
  updateLastLesson: (lessonId: string) => Promise<void>;
  updateLastFlashcard: (cardId: string, deckId: string, cardIndex: number) => Promise<void>;
  isLoading: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

// Helper function to parse flashcardId format "deckId-cardId"
// Example: "1-0001" -> { deckId: "1", cardId: "0001" }
function parseFlashcardId(flashcardId: string) {
  const parts = flashcardId.split('-');
  if (parts.length === 2) {
    return { deckId: parts[0], cardId: parts[1] };
  }
  return null;
}

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [lastLessonId, setLastLessonId] = useState<string | null>(null);
  const [lastFlashcardId, setLastFlashcardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const progressLoadedRef = useRef<string | null>(null);

  // Parse lastFlashcardId to extract deckId and cardIndex
  // This is computed from the flashcardId format "deckId-cardId"
  const { lastFlashcardDeckId, lastFlashcardIndex } = useMemo(() => {
    if (!lastFlashcardId) {
      return { lastFlashcardDeckId: null, lastFlashcardIndex: null };
    }

    const parsed = parseFlashcardId(lastFlashcardId);
    if (!parsed) {
      return { lastFlashcardDeckId: null, lastFlashcardIndex: null };
    }

    // For backward compatibility: if lastFlashcardId is in format "deckId-cardId"
    // we treat it as if the user was at that card, but we don't know the exact index
    // The actual cardIndex will need to be derived from the cards array in FlashcardDeckPage
    return { lastFlashcardDeckId: parsed.deckId, lastFlashcardIndex: 0 };
  }, [lastFlashcardId]);

  // Load progress from backend when user changes
  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.id) {
        setLastLessonId(null);
        setLastFlashcardId(null);
        progressLoadedRef.current = null;
        return;
      }

      // Avoid reloading same user's progress
      if (progressLoadedRef.current === user.id) {
        return;
      }

      setIsLoading(true);
      try {
        const apiBase = getApiBase();
        const response = await fetch(`${apiBase}/progress/${encodeURIComponent(user.id)}`);
        if (response.ok) {
          const data = await response.json();
          setLastLessonId(data.lastLessonId || null);
          setLastFlashcardId(data.lastFlashcardId || null);
          progressLoadedRef.current = user.id;
        } else {
          setLastLessonId(null);
          setLastFlashcardId(null);
          progressLoadedRef.current = user.id;
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
        setLastLessonId(null);
        setLastFlashcardId(null);
        progressLoadedRef.current = user.id;
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [user?.id]);

  const updateLastLesson = useCallback(async (lessonId: string) => {
    if (!user?.id) {
      throw new Error('User must be logged in to save progress');
    }

    // Optimistic update
    setLastLessonId(lessonId);

    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/progress/update-last-learning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, lessonId }),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }
    } catch (error) {
      // Revert optimistic update on failure
      setLastLessonId(null);
      throw error;
    }
  }, [user?.id]);

  const updateLastFlashcard = useCallback(async (cardId: string, deckId: string, cardIndex: number) => {
    if (!user?.id) {
      throw new Error('User must be logged in to save progress');
    }

    // Use cardId directly as flashcardId since it already contains deck info (format: "1-0022")
    const flashcardId = cardId;

    // Optimistic update
    setLastFlashcardId(flashcardId);

    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/progress/update-last-learning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, flashcardId }),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }
    } catch (error) {
      // Revert optimistic update on failure
      setLastFlashcardId(null);
      throw error;
    }
  }, [user?.id]);

  return (
    <ProgressContext.Provider
      value={{
        lastLessonId,
        lastFlashcardId,
        lastFlashcardDeckId,
        lastFlashcardIndex,
        updateLastLesson,
        updateLastFlashcard,
        isLoading,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
