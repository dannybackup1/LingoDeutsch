import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, LayersIcon } from 'lucide-react';
import { FlashcardDeck } from '../types';
import { listFlashcardDecks } from '../services/data';

const FlashcardsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);

  useEffect(() => {
    listFlashcardDecks().then(setDecks).catch(() => setDecks([]));
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const filteredDecks = selectedCategory
    ? decks.filter(deck => deck.category === selectedCategory)
    : decks;

  const categoryColors = {
    basics: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    grammar: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800',
    vocabulary: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800',
    phrases: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Flashcards</h1>
        
        {/* Filter */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="relative">
              <div className="hidden md:absolute md:inset-y-0 md:left-0 md:pl-3 md:flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="md:pl-10 pr-4 py-3 w-full md:w-auto rounded-lg border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none
                         focus:ring-2 focus:ring-primary"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">All Categories</option>
                <option value="basics">Basics</option>
                <option value="grammar">Grammar</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="phrases">Phrases</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Flashcard Decks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map(deck => (
            <div 
              key={deck.id}
              className={`card hover:shadow-lg transform hover:scale-[1.02] transition-all cursor-pointer
                         border-l-4 ${categoryColors[deck.category]}`}
              onClick={() => navigate(`/flashcards/${deck.id}`)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">{deck.title}</h3>
                  <LayersIcon className="h-5 w-5 text-primary dark:text-accent" />
                </div>
                
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[deck.category]}`}>
                  {deck.category.charAt(0).toUpperCase() + deck.category.slice(1)}
                </span>
                
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {deck.cards.length} cards
                  </span>
                  <span className="text-primary dark:text-accent text-sm font-medium">
                    Practice Now
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredDecks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              No flashcard decks found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsPage;
