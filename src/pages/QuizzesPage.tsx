import React, { useState } from 'react';
import { quizzes } from '../data/quizzes';
import { useNavigate } from 'react-router-dom';
import { Filter, CheckCircle2 } from 'lucide-react';

const QuizzesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };
  
  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLevel(e.target.value);
  };
  
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesCategory = selectedCategory === '' || quiz.category === selectedCategory;
    const matchesLevel = selectedLevel === '' || quiz.level === selectedLevel;
    
    return matchesCategory && matchesLevel;
  });

  const categoryColors = {
    basics: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    grammar: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    vocabulary: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    phrases: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  };
  
  const levelColors = {
    beginner: 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
    advanced: 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Quizzes</h1>
        
        {/* Filters */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row gap-4">
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

            <div className="relative">
              <div className="hidden md:absolute md:inset-y-0 md:left-0 md:pl-3 md:flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="md:pl-10 pr-4 py-3 w-full md:w-auto rounded-lg border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none
                         focus:ring-2 focus:ring-primary"
                value={selectedLevel}
                onChange={handleLevelChange}
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map(quiz => (
            <div 
              key={quiz.id}
              className="card hover:shadow-lg transform hover:scale-[1.02] transition-all cursor-pointer"
              onClick={() => navigate(`/quizzes/${quiz.id}`)}
            >
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[quiz.category]}`}>
                    {quiz.category.charAt(0).toUpperCase() + quiz.category.slice(1)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${levelColors[quiz.level]}`}>
                    {quiz.level.charAt(0).toUpperCase() + quiz.level.slice(1)}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg mb-4">{quiz.title}</h3>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {quiz.questions.length} questions
                  </span>
                  <div className="flex items-center text-primary dark:text-accent">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Start Quiz</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredQuizzes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              No quizzes found matching your criteria. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizzesPage;
