import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUnitsForStudent } from '../../services/institutionService';
import { fetchUserNotes, fetchUserAssignments, fetchUserDocuments } from '../../services/workplaceService';
import { ProgrammeUnit, Assignment, AcademicNote, AcademicDocument } from '../../types';
import {
  BookOpen,
  Star,
  User,
  Mail,
  FileText,
  Calendar,
  CheckCircle2,
  FolderArchive,
  Search,
  Filter,
  ExternalLink,
  Plus,
  HelpCircle,
  Sparkles,
  ChevronRight,
  BookMarked,
  Layers,
  GraduationCap,
} from 'lucide-react';

interface MyUnitsViewProps {
  onNavigate: (route: string) => void;
}

export const MyUnitsView: React.FC<MyUnitsViewProps> = ({ onNavigate }) => {
  const { userProfile, currentUser } = useAuth();
  const [units, setUnits] = useState<ProgrammeUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favoriteUnitCodes, setFavoriteUnitCodes] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('mlh_favorite_units');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Selected Unit Modal
  const [selectedUnit, setSelectedUnit] = useState<ProgrammeUnit | null>(null);
  const [unitAssignments, setUnitAssignments] = useState<Assignment[]>([]);
  const [unitNotes, setUnitNotes] = useState<AcademicNote[]>([]);
  const [unitDocs, setUnitDocs] = useState<AcademicDocument[]>([]);

  // Load units for the student's selected institution, programme, year, and semester
  useEffect(() => {
    const loadUnits = async () => {
      setLoading(true);
      try {
        const instId = userProfile?.institutionId || 'uon';
        const progId = userProfile?.programmeId || 'uon-bsc-cs';
        const year = userProfile?.yearOfStudy || 'Year 1';
        const sem = userProfile?.semester || 'Semester 1';

        const list = await getUnitsForStudent(instId, progId, year, sem);
        setUnits(list);
      } catch (err) {
        console.warn('Notice loading units:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUnits();
  }, [userProfile]);

  // Load associated notes, assignments, documents when a unit is opened
  useEffect(() => {
    const activeUid = currentUser?.uid || userProfile?.uid;
    if (!selectedUnit || !activeUid) return;

    const loadUnitWorkspace = async () => {
      try {
        const [asgs, nts, dcs] = await Promise.all([
          fetchUserAssignments(activeUid),
          fetchUserNotes(activeUid),
          fetchUserDocuments(activeUid),
        ]);

        const uCode = selectedUnit.code.toLowerCase();
        setUnitAssignments(
          asgs.filter((a) => a.course?.toLowerCase().includes(uCode) || a.unit?.toLowerCase().includes(uCode))
        );
        setUnitNotes(
          nts.filter((n) => n.course?.toLowerCase().includes(uCode) || n.unit?.toLowerCase().includes(uCode))
        );
        setUnitDocs(
          dcs.filter((d) => d.courseCode?.toLowerCase().includes(uCode) || d.unitName?.toLowerCase().includes(uCode))
        );
      } catch (err) {
        console.warn('Notice loading unit workspace items:', err);
      }
    };

    loadUnitWorkspace();
  }, [selectedUnit, currentUser?.uid, userProfile?.uid]);

  const toggleFavorite = (code: string) => {
    setFavoriteUnitCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      try {
        localStorage.setItem('mlh_favorite_units', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  // Filtered units
  const filteredUnits = units.filter((u) => {
    const matchesSearch =
      u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.lecturerName && u.lecturerName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' ||
      (selectedCategory === 'CORE' && u.isCore) ||
      (selectedCategory === 'ELECTIVE' && !u.isCore);

    const matchesFavorite = !favoritesOnly || favoriteUnitCodes.has(u.code);

    return matchesSearch && matchesCategory && matchesFavorite;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Student Programme Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>{userProfile?.institutionName || 'University'} • {userProfile?.campusName || 'Main Campus'}</span>
            </div>
            <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
              My Academic Units
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Enrolled units for <span className="text-slate-200 font-semibold">{userProfile?.programmeName || 'Academic Programme'}</span> ({userProfile?.yearOfStudy || 'Year 1'}, {userProfile?.semester || 'Semester 1'})
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onNavigate('/timetable')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>View Timetable</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/documents')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 text-xs font-bold shadow-[0_0_15px_rgba(34,211,238,0.25)] cursor-pointer"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Digital Library</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-white/10">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code, title, lecturer..."
              className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'CORE', 'ELECTIVE'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                favoritesOnly
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Favorites</span>
            </button>
          </div>
        </div>
      </div>

      {/* Units Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          Loading approved academic units from institution registry...
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-white/10">
          <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white font-heading">
            No Units Found
          </h3>
          <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
            {searchQuery
              ? `No registered units match "${searchQuery}". Try a different keyword.`
              : 'No units have been published for this programme/semester combination yet in the institution database.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.map((unit) => {
            const isFav = favoriteUnitCodes.has(unit.code);

            return (
              <div
                key={unit.id}
                className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyan-400/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Code, Core badge, Favorite button */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-400/30">
                      {unit.code}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {unit.credits} Credits
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(unit.code)}
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                        title={isFav ? 'Remove Favorite' : 'Mark Favorite'}
                      >
                        <Star
                          className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 font-heading">
                    {unit.title}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {unit.description || 'Core academic curriculum unit under approved CUE syllabus.'}
                  </p>

                  {/* Lecturer Information (if officially provided) */}
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-1">
                    {unit.lecturerName ? (
                      <div className="flex items-center space-x-2 text-xs text-slate-300">
                        <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{unit.lecturerName}</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 italic">
                        Lecturer TBA by Department
                      </div>
                    )}
                    {unit.lecturerEmail && (
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                        <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{unit.lecturerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Open Unit Workspace */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {unit.isCore ? 'CORE REQUIREMENT' : 'ELECTIVE'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedUnit(unit)}
                    className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    <span>Unit Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* UNIT WORKSPACE MODAL                                                      */}
      {/* ========================================================================= */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl glass-panel border border-white/20 rounded-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                    {selectedUnit.code}
                  </span>
                  <span className="text-xs text-slate-400">• {selectedUnit.credits} Credit Units</span>
                </div>
                <h2 className="text-xl font-bold text-white font-heading">
                  {selectedUnit.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedUnit.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUnit(null)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Lecturer Box */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 my-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-sm">
                  {selectedUnit.lecturerName?.[0] || 'L'}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {selectedUnit.lecturerName || 'Lecturer To Be Announced'}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    {selectedUnit.lecturerEmail || 'Contact departmental administrative office'}
                  </span>
                </div>
              </div>
              {selectedUnit.lecturerEmail && (
                <a
                  href={`mailto:${selectedUnit.lecturerEmail}`}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-400/30"
                >
                  Email Lecturer
                </a>
              )}
            </div>

            {/* Sub-Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {/* 1. Assignments for this Unit */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-white">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Assignments & CATs</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUnit(null);
                      onNavigate('/assignments');
                    }}
                    className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
                {unitAssignments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No assignments recorded for {selectedUnit.code} yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {unitAssignments.slice(0, 3).map((a) => (
                      <div key={a.id} className="p-2 rounded-lg bg-white/5 text-xs flex items-center justify-between">
                        <span className="font-semibold text-slate-200 truncate">{a.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono">
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Personal Notes for this Unit */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-white">
                    <BookMarked className="w-4 h-4 text-emerald-400" />
                    <span>Personal Notes</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUnit(null);
                      onNavigate('/notes');
                    }}
                    className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    Add Note
                  </button>
                </div>
                {unitNotes.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No personal notes created for {selectedUnit.code} yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {unitNotes.slice(0, 3).map((n) => (
                      <div key={n.id} className="p-2 rounded-lg bg-white/5 text-xs">
                        <span className="font-semibold text-slate-200 block truncate">{n.title}</span>
                        <span className="text-[10px] text-slate-400 block line-clamp-1">{n.summary}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Official CUE Verified Curriculum Unit
              </span>
              <button
                type="button"
                onClick={() => setSelectedUnit(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
              >
                Close Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
