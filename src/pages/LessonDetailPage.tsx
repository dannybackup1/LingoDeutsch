import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lesson } from '../types';
import { getLessonById, listLessons } from '../services/data';
import { ArrowLeft, BookOpen, Check, Volume as VolumeUp } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';

const LessonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { updateLastLesson, lastLessonId } = useProgress();
  const [lesson, setLesson] = useState<Lesson | undefined>(undefined);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    if (!id) return;
    getLessonById(id).then(setLesson);
    listLessons().then(setAllLessons);
  }, [id]);

  const handleMarkComplete = async () => {
    if (!isAuthenticated) {
      alert('Please log in to save your progress.');
      navigate('/login');
      return;
    }

    if (lesson) {
      try {
        await updateLastLesson(lesson.id);
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Function to extract German text from markdown content
  const extractGermanWords = (content: string): string[] => {
    const germanWords: string[] = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      // Match text between ** or after -
      const matches = line.match(/\*\*(.*?)\*\*|-\s*(.*?)\s*-/g);
      if (matches) {
        matches.forEach(match => {
          const word = match.replace(/\*\*/g, '').replace(/-/g, '').trim();
          if (/[äöüßa-z]/i.test(word)) { // Simple check for German characters
            germanWords.push(word);
          }
        });
      }
    });
    
    return germanWords;
  };

  if (!lesson) {
    return (
      <div className="min-h-screen py-12 px-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Lesson not found</h2>
          <button 
            onClick={() => navigate('/lessons')}
            className="btn-primary"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

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

  const germanWords = extractGermanWords(lesson.content);
  const isCompleted = lastLessonId === lesson.id;

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/lessons')}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary 
                    dark:hover:text-accent mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Lessons
        </button>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
          {lesson.imageUrl && (
            <div className="h-64 bg-gray-200 dark:bg-gray-700">
              <img 
                src={lesson.imageUrl} 
                alt={lesson.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[lesson.category]}`}>
                {lesson.category.charAt(0).toUpperCase() + lesson.category.slice(1)}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${levelColors[lesson.level]}`}>
                {lesson.level.charAt(0).toUpperCase() + lesson.level.slice(1)}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{lesson.description}</p>
            
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{lesson.content}</ReactMarkdown>
            </div>

            {/* German Words with Audio */}
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Practice Pronunciation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {germanWords.map((word, index) => (
                  <button
                    key={index}
                    onClick={() => speakText(word)}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 
                             rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="font-medium">{word}</span>
                    <VolumeUp className="h-5 w-5 text-primary dark:text-accent" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => speakText(lesson.title)}
                className="flex items-center text-primary dark:text-accent"
              >
                <VolumeUp className="h-5 w-5 mr-1" />
                <span>Listen to Pronunciation</span>
              </button>
              
              <button
                onClick={handleMarkComplete}
                className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                  isCompleted 
                    ? 'bg-success/20 text-success hover:bg-success/30' 
                    : 'bg-primary text-white hover:bg-primary/90'
                } transition-colors`}
                disabled={isCompleted}
              >
                {isCompleted ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    <BookOpen className="h-5 w-5 mr-2" />
                    Save Progress
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          {lesson && parseInt(lesson.id) > 1 && (
            <button
              onClick={() => navigate(`/lessons/${parseInt(lesson.id) - 1}`)}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary 
                        dark:hover:text-accent transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Previous Lesson
            </button>
          )}
          {lesson && parseInt(lesson.id) < allLessons.length && (
            <button
              onClick={() => navigate(`/lessons/${parseInt(lesson.id) + 1}`)}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary 
                        dark:hover:text-accent transition-colors ml-auto"
            >
              Next Lesson
              <ArrowLeft className="h-5 w-5 ml-1 transform rotate-180" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonDetailPage;
