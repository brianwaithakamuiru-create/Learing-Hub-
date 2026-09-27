import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface Question {
  id: string;
  unitCode: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SAMPLE_QUIZ_QUESTIONS: Record<string, Question[]> = {
  general: [
    {
      id: 'q1',
      unitCode: 'ACAD 101',
      question: 'Which regulatory body is statutory mandated to accredit universities and academic programmes in Kenya?',
      options: [
        'Higher Education Loans Board (HELB)',
        'Commission for University Education (CUE)',
        'Kenya National Examinations Council (KNEC)',
        'Kenya Universities and Colleges Central Placement Service (KUCCPS)',
      ],
      correctIndex: 1,
      explanation: 'The Commission for University Education (CUE) is established under the Universities Act, No. 42 of 2012 to regulate and ensure quality assurance in Kenyan university education.',
    },
    {
      id: 'q2',
      unitCode: 'CS / IT',
      question: 'In relational database theory (Codd’s rules), what property guarantees that all transactions are processed completely or aborted entirely?',
      options: ['Consistency', 'Atomicity', 'Isolation', 'Durability'],
      correctIndex: 1,
      explanation: 'Atomicity (the A in ACID) requires that each transaction is "all or nothing": if one part fails, the entire transaction rolls back.',
    },
    {
      id: 'q3',
      unitCode: 'MATH / STAT',
      question: 'What is the asymptotic time complexity of searching an element in a balanced Binary Search Tree (AVL tree) with n nodes?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctIndex: 1,
      explanation: 'Because a balanced binary search tree maintains a height of O(log n), lookup, insertion, and deletion all take O(log n) time in the worst case.',
    },
    {
      id: 'q4',
      unitCode: 'LAW / GOV',
      question: 'Under the Constitution of Kenya 2010, Chapter 6 focuses primarily on what critical standard for public officers?',
      options: ['Land and Environment', 'Leadership and Integrity', 'Public Finance', 'National Security'],
      correctIndex: 1,
      explanation: 'Chapter Six of the Kenyan Constitution governs Leadership and Integrity, defining moral and ethical conduct for public servants.',
    },
  ],
};

export const QuizzesView: React.FC = () => {
  const { userProfile } = useAuth();
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>('all');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const questions = SAMPLE_QUIZ_QUESTIONS.general;
  const currentQ = questions[currentQuestionIndex];

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    setShowExplanation(true);
    if (index === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Interactive Self-Assessment</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
            Academic Quizzes & Knowledge Checks
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Test your grasp of core programme concepts and revision units.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-400/30">
          <span>Score: {score} / {questions.length}</span>
        </div>
      </div>

      {/* Quiz Card */}
      {!quizFinished ? (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          {/* Progress */}
          <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-white/10">
            <span className="font-mono text-cyan-400 font-bold">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px]">
              {currentQ.unitCode}
            </span>
          </div>

          {/* Question Text */}
          <h3 className="text-lg font-bold text-white leading-relaxed font-heading">
            {currentQ.question}
          </h3>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;
              let optionClass = 'bg-white/5 border-white/10 hover:border-cyan-400/40 text-slate-200';

              if (showExplanation) {
                if (isCorrect) {
                  optionClass = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.2)] font-semibold';
                } else if (isSelected) {
                  optionClass = 'bg-rose-500/20 border-rose-400 text-rose-200';
                } else {
                  optionClass = 'bg-white/5 border-white/5 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  disabled={showExplanation}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${optionClass}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {showExplanation && (
                    <div>
                      {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {showExplanation && (
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-400/30 text-xs text-slate-200 animate-in fade-in duration-150">
              <span className="font-bold text-cyan-300 block mb-1">Explanation:</span>
              <p className="leading-relaxed text-slate-300">{currentQ.explanation}</p>
            </div>
          )}

          {/* Footer Controls */}
          {showExplanation && (
            <div className="pt-4 border-t border-white/10 flex items-center justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] cursor-pointer"
              >
                <span>{currentQuestionIndex + 1 < questions.length ? 'Next Question' : 'Complete Quiz'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Complete Card */
        <div className="glass-panel p-8 text-center rounded-2xl border border-white/10 space-y-4">
          <Award className="w-12 h-12 text-cyan-400 mx-auto" />
          <h2 className="text-xl font-bold text-white font-heading">
            Assessment Complete!
          </h2>
          <p className="text-slate-300 text-sm">
            You scored <span className="text-cyan-400 font-bold font-mono text-base">{score}</span> out of {questions.length} (
            {Math.round((score / questions.length) * 100)}%)
          </p>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Quiz</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
