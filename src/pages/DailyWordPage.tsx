import React, { useState, useEffect } from 'react';
import DailyWordCard from '../components/DailyWordCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { DailyWord } from '../types';
import { getAllDailyWords } from '../services/data';

const DailyWordPage: React.FC = () => {
  const [words, setWords] = useState<DailyWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    getAllDailyWords().then(setWords).catch(() => setWords([]));
  }, []);

  const currentWord = words[currentWordIndex];

  const goToPrevWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  const goToNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Daily German Word</h1>
        
        <div className="mb-10">
          {currentWord && <DailyWordCard dailyWord={currentWord} />}
        </div>

        <div className="flex justify-center items-center gap-4">
          <button
            onClick={goToPrevWord}
            className="flex items-center px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 
                      dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            disabled={currentWordIndex === 0}
          >
            <ArrowLeft className={`h-5 w-5 mr-1 ${
              currentWordIndex === 0 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
            }`} />
            Previous
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-300">
            {words.length > 0 ? `${currentWordIndex + 1} of ${words.length}` : 'Loading...'}
          </span>

          <button
            onClick={goToNextWord}
            className="flex items-center px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 
                      dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            disabled={words.length === 0 || currentWordIndex === words.length - 1}
          >
            Next
            <ArrowRight className={`h-5 w-5 ml-1 ${
              words.length > 0 && currentWordIndex === words.length - 1 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
            }`} />
          </button>
        </div>
        
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Daily Word Practice Tips</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-primary dark:text-accent mr-2">•</span>
              <span>Say the word out loud several times to practice pronunciation</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary dark:text-accent mr-2">•</span>
              <span>Create your own example sentence using the word</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary dark:text-accent mr-2">•</span>
              <span>Try to use the word in conversation during the day</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary dark:text-accent mr-2">•</span>
              <span>Write the word down in a vocabulary notebook with its meaning</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary dark:text-accent mr-2">•</span>
              <span>Review past daily words regularly to strengthen your memory</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DailyWordPage;
