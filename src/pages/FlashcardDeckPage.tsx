import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import FlashcardComponent from '../components/FlashcardComponent';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import { FlashcardDeck } from '../types';
import { getFlashcardDeckById } from '../services/data';

const FlashcardDeckPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { updateLastFlashcard } = useProgress();

  const [deck, setDeck] = useState<FlashcardDeck | undefined>(undefined);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    getFlashcardDeckById(id).then(d => {
      setDeck(d);
      setCurrentIndex(0);
    });
  }, [id]);
  
  if (!deck) {
    return (
      <div className="min-h-screen py-12 px-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Flashcard deck not found</h2>
          <button 
            onClick={() => navigate('/flashcards')}
            className="btn-primary"
          >
            Back to Flashcards
          </button>
        </div>
      </div>
    );
  }
  
  const currentCard = deck.cards[currentIndex];
  
  const goToNextCard = () => {
    if (currentIndex < deck.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const goToPrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const shuffleDeck = () => {
    const shuffledDeck = {...deck};
    shuffledDeck.cards = [...deck.cards].sort(() => Math.random() - 0.5);
    setDeck(shuffledDeck);
    setCurrentIndex(0);
  };
  
  const handleCardViewed = async (cardId: string) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      await updateLastFlashcard(cardId);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const categoryColors = {
    basics: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    grammar: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    vocabulary: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    phrases: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  };
  
  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/flashcards')}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary 
                    dark:hover:text-accent mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Flashcards
        </button>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{deck.title}</h1>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[deck.category]}`}>
                  {deck.category.charAt(0).toUpperCase() + deck.category.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Card {currentIndex + 1} of {deck.cards.length}
              </p>
            </div>
            
            <button
              onClick={shuffleDeck}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 
                        dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              aria-label="Shuffle deck"
            >
              <RefreshCw className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          <div className="flex justify-center mb-8">
            <FlashcardComponent 
              card={currentCard}
              onViewed={handleCardViewed}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={goToPrevCard}
              className="flex items-center px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 
                        dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              disabled={currentIndex === 0}
            >
              <ArrowLeft className={`h-5 w-5 mr-1 ${
                currentIndex === 0 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
              }`} />
              Previous
            </button>
                        
            <button
              onClick={goToNextCard}
              className="flex items-center px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 
                        dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              disabled={currentIndex === deck.cards.length - 1}
            >
              Next
              <ArrowRight className={`h-5 w-5 ml-1 ${
                currentIndex === deck.cards.length - 1 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
              }`} />
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-md">
          <h2 className="font-bold text-lg mb-4">Study Tips</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Review each card multiple times to strengthen memory</li>
            <li>Say the words out loud to practice pronunciation</li>
            <li>Create your own example sentences with new vocabulary</li>
            <li>Try to recall the word before flipping the card</li>
            <li>Mark cards as "mastered" once you consistently remember them</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FlashcardDeckPage;
