import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Award,
  TrendingUp,
  FileCheck2,
  Calendar,
  Download,
  AlertCircle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface SemesterResult {
  semester: string;
  academicYear: string;
  gpa: number;
  creditsEarned: number;
  status: 'Pass' | 'Dean’s List' | 'Pending';
  units: {
    code: string;
    title: string;
    grade: string;
    points: number;
    credits: number;
  }[];
}

export const ResultsView: React.FC = () => {
  const { userProfile } = useAuth();

  // Student results representation
  const [results, setResults] = useState<SemesterResult[]>([
    {
      semester: 'Year 1 - Semester 1',
      academicYear: '2024/2025',
      gpa: 3.82,
      creditsEarned: 18,
      status: 'Dean’s List',
      units: [
        { code: 'SMA 101', title: 'Basic Mathematics & Calculus I', grade: 'A', points: 4.0, credits: 3 },
        { code: 'CSC 111', title: 'Introduction to Programming in C', grade: 'A', points: 4.0, credits: 4 },
        { code: 'CSC 112', title: 'Computer Architecture & Digital Logic', grade: 'A-', points: 3.7, credits: 3 },
        { code: 'CCS 001', title: 'Communication Skills', grade: 'B+', points: 3.3, credits: 3 },
        { code: 'CCS 008', title: 'Elements of Philosophy', grade: 'A', points: 4.0, credits: 3 },
      ],
    },
    {
      semester: 'Year 1 - Semester 2',
      academicYear: '2024/2025',
      gpa: 3.75,
      creditsEarned: 18,
      status: 'Pass',
      units: [
        { code: 'SMA 104', title: 'Calculus II & Differential Equations', grade: 'A-', points: 3.7, credits: 3 },
        { code: 'CSC 121', title: 'Object Oriented Programming I', grade: 'A', points: 4.0, credits: 4 },
        { code: 'CSC 126', title: 'Discrete Mathematics', grade: 'B+', points: 3.3, credits: 3 },
        { code: 'CSC 128', title: 'Data Communications', grade: 'A', points: 4.0, credits: 4 },
      ],
    },
  ]);

  const cumulativeGpa = 3.78;
  const totalCreditsEarned = 36;
  const degreeRequirementCredits = 144;
  const progressPercent = Math.round((totalCreditsEarned / degreeRequirementCredits) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
            <Award className="w-4 h-4" />
            <span>Academic Registry Verified Records</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
            Examination Results & Transcripts
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Student Reg: <span className="text-cyan-300 font-mono font-bold">{userProfile?.registrationNumber || 'P15/28491/2023'}</span> • {userProfile?.programmeName || 'Degree Programme'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Print Unofficial Transcript</span>
        </button>
      </div>

      {/* Overview Metric Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <span className="text-slate-400 text-xs font-semibold block">Cumulative GPA</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono">{cumulativeGpa.toFixed(2)}</span>
            <span className="text-xs text-slate-400 font-mono">/ 4.00</span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">First Class Honours Track</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <span className="text-slate-400 text-xs font-semibold block">Credits Completed</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-extrabold text-white font-mono">{totalCreditsEarned}</span>
            <span className="text-xs text-slate-400 font-mono">/ {degreeRequirementCredits}</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <span className="text-slate-400 text-xs font-semibold block">Academic Standing</span>
          <div className="flex items-center space-x-2 mt-2">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
            <span className="text-lg font-bold text-emerald-300">Good Standing</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            CUE Minimum Requirements Satisfied
          </span>
        </div>
      </div>

      {/* Semester Breakdown Accordions */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white font-heading">
          Published Semester Grade Sheets
        </h3>

        {results.map((sem, sIdx) => (
          <div key={sIdx} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
              <div>
                <span className="text-sm font-bold text-white block">{sem.semester}</span>
                <span className="text-[11px] text-slate-400 font-mono">{sem.academicYear}</span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-400/30 font-semibold">
                  {sem.status}
                </span>
                <span className="font-mono text-cyan-300 font-bold">GPA: {sem.gpa.toFixed(2)}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-white/5 font-mono text-[10px] uppercase">
                    <th className="py-2">Unit Code</th>
                    <th className="py-2">Unit Title</th>
                    <th className="py-2 text-center">Credits</th>
                    <th className="py-2 text-center">Grade</th>
                    <th className="py-2 text-right">Grade Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {sem.units.map((u, uIdx) => (
                    <tr key={uIdx} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 font-mono text-cyan-300 font-semibold">{u.code}</td>
                      <td className="py-2.5 font-medium">{u.title}</td>
                      <td className="py-2.5 text-center font-mono">{u.credits}</td>
                      <td className="py-2.5 text-center font-mono font-bold text-emerald-400">{u.grade}</td>
                      <td className="py-2.5 text-right font-mono">{u.points.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
