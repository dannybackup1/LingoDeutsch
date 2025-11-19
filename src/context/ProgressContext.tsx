import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getApiBase } from '../services/config';

interface ProgressContextType {
  completedLessons: string[];
  masteredFlashcards: string[];
  markLessonComplete: (lessonId: string) => Promise<void>;
  markFlashcardMastered: (cardId: string) => Promise<void>;
  resetProgress: () => void;
  isLoading: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [masteredFlashcards, setMasteredFlashcards] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const progressLoadedRef = useRef<string | null>(null);

  // Load progress from backend when user changes
  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.id) {
        setCompletedLessons([]);
        setMasteredFlashcards([]);
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
          setCompletedLessons(data.completedLessons || []);
          setMasteredFlashcards(data.masteredFlashcards || []);
          progressLoadedRef.current = user.id;
        } else {
          // Initialize as empty if API fails
          setCompletedLessons([]);
          setMasteredFlashcards([]);
          progressLoadedRef.current = user.id;
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
        setCompletedLessons([]);
        setMasteredFlashcards([]);
        progressLoadedRef.current = user.id;
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [user?.id]);

  const markLessonComplete = useCallback(async (lessonId: string) => {
    if (!user?.id) {
      throw new Error('User must be logged in to mark lesson complete');
    }

    // Optimistic update
    setCompletedLessons(prev => {
      if (prev.includes(lessonId)) return prev;
      return [...prev, lessonId];
    });

    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/progress/lesson-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, lessonId }),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }
    } catch (error) {
      // Revert optimistic update on failure
      setCompletedLessons(prev => prev.filter(id => id !== lessonId));
      throw error;
    }
  }, [user?.id]);

  const markFlashcardMastered = useCallback(async (cardId: string) => {
    if (!user?.id) {
      throw new Error('User must be logged in to mark flashcard mastered');
    }

    // Optimistic update
    setMasteredFlashcards(prev => {
      if (prev.includes(cardId)) return prev;
      return [...prev, cardId];
    });

    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/progress/flashcard-master`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, flashcardId: cardId }),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }
    } catch (error) {
      // Revert optimistic update on failure
      setMasteredFlashcards(prev => prev.filter(id => id !== cardId));
      throw error;
    }
  }, [user?.id]);

  const resetProgress = () => {
    setCompletedLessons([]);
    setMasteredFlashcards([]);
    progressLoadedRef.current = null;
  };

  return (
    <ProgressContext.Provider
      value={{
        completedLessons,
        masteredFlashcards,
        markLessonComplete,
        markFlashcardMastered,
        resetProgress,
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
