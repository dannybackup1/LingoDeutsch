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

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">{user.username}</span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50">
                  <div className="px-4 py-3 border-b dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Logged in as</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
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

          {isAuthenticated && user ? (
            <>
              <div className="border-t dark:border-gray-700 pt-2 mt-2">
                <div className="px-3 py-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Logged in as</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 text-base font-medium rounded-md hover:bg-gray-100
                            dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="border-t dark:border-gray-700 pt-2 mt-2 space-y-2">
              <Link
                to="/login"
                className="block py-2 px-3 text-base font-medium rounded-md hover:bg-gray-100
                          dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block py-2 px-3 text-base font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
