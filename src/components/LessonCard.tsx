import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lesson } from '../types';
import { BookOpen } from 'lucide-react';

interface LessonCardProps {
  lesson: Lesson;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson }) => {
  const navigate = useNavigate();
  
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

  const handleClick = () => {
    navigate(`/lessons/${lesson.id}`);
  };

  return (
    <div
      className="card hover:shadow-lg transform hover:scale-[1.02] transition-all cursor-pointer"
      onClick={handleClick}
    >
      
      {lesson.imageUrl && (
        <div className="h-36 rounded-t-xl bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <img 
            src={lesson.imageUrl} 
            alt={lesson.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[lesson.category]}`}>
            {lesson.category.charAt(0).toUpperCase() + lesson.category.slice(1)}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${levelColors[lesson.level]}`}>
            {lesson.level.charAt(0).toUpperCase() + lesson.level.slice(1)}
          </span>
        </div>
        
        <h3 className="font-bold text-lg mb-2">{lesson.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{lesson.description}</p>
        
        <div className="flex items-center text-primary dark:text-accent">
          <BookOpen className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">Start learning</span>
        </div>
      </div>
    </div>
  );
};

export default LessonCard;
