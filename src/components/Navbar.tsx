import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, GraduationCap, Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-primary dark:text-accent">
            LingoDeutsch
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/lessons" className="nav-link">Lessons</Link>
          <Link to="/flashcards" className="nav-link">Flashcards</Link>
          <Link to="/quizzes" className="nav-link">Quizzes</Link>
          <Link to="/daily-word" className="nav-link">Daily Word</Link>
          
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-accent" />
            ) : (
              <Moon className="h-5 w-5 text-primary" />
            )}
          </button>
        </div>
        
        <div className="md:hidden flex items-center">
          <button 
            onClick={toggleTheme} 
            className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-accent" />
            ) : (
              <Moon className="h-5 w-5 text-primary" />
            )}
          </button>
          
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 
                      dark:text-gray-300 dark:hover:bg-gray-800 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-3 space-y-2 px-4 pb-3 pt-2">
          <Link 
            to="/lessons" 
            className="block py-2 px-3 text-base font-medium rounded-md hover:bg-gray-100 
                      dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Lessons
          </Link>
          <Link 
            to="/flashcards" 
            className="block py-2 px-3 text-base font-medium rounded-md hover:bg-gray-100 
                      dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Flashcards
          </Link>
          <Link 
            to="/quizzes" 
            className="block py-2 px-3 text-base font-medium rounded-md hover:bg-gray-100 
                      dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Quizzes
          </Link>
          <Link 
            to="/daily-word" 
            className="block py-2 px-3 text-base font-medium rounded-md hover:bg-gray-100 
                      dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Daily Word
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
