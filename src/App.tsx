import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ProgressProvider } from './context/ProgressContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LessonsPage from './pages/LessonsPage';
import LessonDetailPage from './pages/LessonDetailPage';
import FlashcardsPage from './pages/FlashcardsPage';
import FlashcardDeckPage from './pages/FlashcardDeckPage';
import QuizzesPage from './pages/QuizzesPage';
import QuizPage from './pages/QuizPage';
import DailyWordPage from './pages/DailyWordPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PasswordRecoveryPage from './pages/PasswordRecoveryPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProgressProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/lessons" element={<LessonsPage />} />
                  <Route path="/lessons/:id" element={<LessonDetailPage />} />
                  <Route path="/flashcards" element={<FlashcardsPage />} />
                  <Route path="/flashcards/:id" element={<FlashcardDeckPage />} />
                  <Route path="/quizzes" element={<QuizzesPage />} />
                  <Route path="/quizzes/:id" element={<QuizPage />} />
                  <Route path="/daily-word" element={<DailyWordPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<PasswordRecoveryPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
