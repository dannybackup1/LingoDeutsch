import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, MessageSquare, Brain, CalendarCheck } from 'lucide-react';
import DailyWordCard from '../components/DailyWordCard';
import { DailyWord } from '../types';
import { getDailyWord as fetchDailyWord } from '../services/data';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [dailyWord, setDailyWord] = useState<DailyWord | null>(null);

  useEffect(() => {
    fetchDailyWord().then(setDailyWord).catch(() => setDailyWord(null));
  }, []);

  const features = [
    {
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      title: 'Structured Lessons',
      description: 'Learn German grammar, vocabulary, and phrases through our carefully crafted lessons.',
      link: '/lessons'
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      title: 'Flashcards',
      description: 'Practice and memorize German words and phrases with interactive flashcards.',
      link: '/flashcards'
    },
    {
      icon: <Brain className="h-10 w-10 text-primary" />,
      title: 'Interactive Quizzes',
      description: 'Test your knowledge with quizzes designed to reinforce what you\'ve learned.',
      link: '/quizzes'
    },
    {
      icon: <CalendarCheck className="h-10 w-10 text-primary" />,
      title: 'Daily Word',
      description: 'Learn a new German word every day with example sentences and pronunciation.',
      link: '/daily-word'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/90 to-primary text-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Learn German with LingoDeutsch
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
            Master the German language through interactive lessons, flashcards, and quizzes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => navigate('/lessons')}
              className="px-8 py-3 bg-white text-primary font-semibold rounded-lg shadow-lg 
                        hover:bg-gray-100 transition-colors duration-300"
            >
              Start Learning
            </button>
            <button 
              onClick={() => navigate('/daily-word')}
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold 
                        rounded-lg hover:bg-white/10 transition-colors duration-300"
            >
              Word of the Day
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            How LingoDeutsch Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card hover:shadow-lg transform hover:scale-[1.02] transition-all cursor-pointer"
                onClick={() => navigate(feature.link)}
              >
                <div className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Word Preview */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Expand Your Vocabulary Daily
          </h2>
          {dailyWord && <DailyWordCard dailyWord={dailyWord} />}
          <div className="text-center mt-8">
            <button 
              onClick={() => navigate('/daily-word')}
              className="btn-primary"
            >
              See More Daily Words
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 bg-accent/20 dark:bg-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Ready to Start Learning German?
          </h2>
          <p className="text-xl mb-8 text-gray-700 dark:text-gray-300">
            Join thousands of learners who are already improving their German language skills with LingoDeutsch.
          </p>
          <button 
            onClick={() => navigate('/lessons')}
            className="btn-primary text-lg px-10 py-4"
          >
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
