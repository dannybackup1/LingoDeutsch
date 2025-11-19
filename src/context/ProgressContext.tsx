import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getApiBase } from '../services/config';

interface ProgressContextType {
  lastLessonId: string | null;
  lastFlashcardId: string | null;
  updateLastLesson: (lessonId: string) => Promise<void>;
  updateLastFlashcard: (flashcardId: string) => Promise<void>;
  isLoading: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [lastLessonId, setLastLessonId] = useState<string | null>(null);
  const [lastFlashcardId, setLastFlashcardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const progressLoadedRef = useRef<string | null>(null);

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

  const updateLastFlashcard = useCallback(async (flashcardId: string) => {
    if (!user?.id) {
      throw new Error('User must be logged in to save progress');
    }

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
