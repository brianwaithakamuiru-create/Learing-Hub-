import React, { useState, useMemo } from 'react';
import {
  COMPREHENSIVE_KENYAN_PROGRAMMES,
  getAllDistinctFields,
  getAllDistinctLevels,
  getAllDistinctExaminingBodies,
  ProgrammeFilterParams,
} from '../../services/programmesCatalogueData';
import {
  ALL_KENYAN_INSTITUTIONS,
  getAllCounties,
} from '../../services/institutionService';
import {
  AcademicProgramme,
  CourseLevel,
  ExaminingBody,
  StudyMode,
  Institution,
} from '../../types';
import {
  Search,
  BookOpen,
  Building2,
  MapPin,
  GraduationCap,
  Award,
  Layers,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  X,
  SlidersHorizontal,
  Scale,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Eye,
  Calendar,
  AlertCircle,
  FileText,
  BadgeAlert,
} from 'lucide-react';

interface ProgrammeDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProgrammeForRegister?: (programme: AcademicProgramme, institution: Institution) => void;
  initialQuery?: string;
}

export const ProgrammeDiscoveryModal: React.FC<ProgrammeDiscoveryModalProps> = ({
  isOpen,
  onClose,
  onSelectProgrammeForRegister,
  initialQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('All');
  const [selectedCounty, setSelectedCounty] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | 'All'>('All');
  const [selectedField, setSelectedField] = useState<string>('All');
  const [selectedExaminingBody, setSelectedExaminingBody] = useState<ExaminingBody | 'All'>('All');
  const [selectedStudyMode, setSelectedStudyMode] = useState<StudyMode | 'All'>('All');
  const [selectedRegulator, setSelectedRegulator] = useState<'CUE' | 'TVETA' | 'All'>('All');

  // Selected programme for deep curriculum/entry details view
  const [detailProgramme, setDetailProgramme] = useState<AcademicProgramme | null>(null);

  // Side-by-side comparison tray
  const [compareList, setCompareList] = useState<AcademicProgramme[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  // Distinct filters
  const allCounties = useMemo(() => getAllCounties(), []);
  const allFields = useMemo(() => getAllDistinctFields(), []);
  const allLevels = useMemo(() => getAllDistinctLevels(), []);
  const allExaminingBodies = useMemo(() => getAllDistinctExaminingBodies(), []);

  // Filtered programmes
  const filteredProgrammes = useMemo(() => {
    let list = [...COMPREHENSIVE_KENYAN_PROGRAMMES];

    // Text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          (p.programmeName && p.programmeName.toLowerCase().includes(q)) ||
          (p.field && p.field.toLowerCase().includes(q)) ||
          (p.specialization && p.specialization.toLowerCase().includes(q)) ||
          (p.institutionName && p.institutionName.toLowerCase().includes(q)) ||
          p.department.toLowerCase().includes(q)
      );
    }

    // Institution filter
    if (selectedInstitutionId !== 'All') {
      const instClean = selectedInstitutionId.toLowerCase();
      list = list.filter((p) => p.institutionId.toLowerCase() === instClean);
    }

    // County filter
    if (selectedCounty !== 'All') {
      const cClean = selectedCounty.toLowerCase();
      list = list.filter((p) => {
        const inst = ALL_KENYAN_INSTITUTIONS.find(
          (i) => i.id.toLowerCase() === p.institutionId.toLowerCase()
        );
        return inst && inst.county.toLowerCase().includes(cClean);
      });
    }

    // Qualification Level filter
    if (selectedLevel !== 'All') {
      list = list.filter(
        (p) => p.level === selectedLevel || p.qualificationLevel === selectedLevel
      );
    }

    // Academic Field filter
    if (selectedField !== 'All') {
      list = list.filter((p) => p.field === selectedField);
    }

    // Examining Body filter
    if (selectedExaminingBody !== 'All') {
      list = list.filter((p) => p.examiningBody === selectedExaminingBody);
    }

    // Study Mode filter
    if (selectedStudyMode !== 'All') {
      list = list.filter((p) => {
        if (Array.isArray(p.modeOfStudy)) {
          return p.modeOfStudy.includes(selectedStudyMode);
        }
        return p.modeOfStudy === selectedStudyMode;
      });
    }

    // Regulator filter (CUE vs TVETA)
    if (selectedRegulator !== 'All') {
      list = list.filter((p) => {
        if (selectedRegulator === 'CUE') {
          return p.cueAccredited || p.source?.includes('CUE') || p.examiningBody === 'University Senate';
        }
        if (selectedRegulator === 'TVETA') {
          return (
            p.tvetaAccredited ||
            p.source?.includes('TVETA') ||
            p.examiningBody === 'KNEC' ||
            p.examiningBody === 'TVET-CDACC' ||
            p.examiningBody === 'NITA'
          );
        }
        return true;
      });
    }

    return list;
  }, [
    searchQuery,
    selectedInstitutionId,
    selectedCounty,
    selectedLevel,
    selectedField,
    selectedExaminingBody,
    selectedStudyMode,
    selectedRegulator,
  ]);

  // Toggle programme in comparison tray
  const toggleCompare = (prog: AcademicProgramme) => {
    if (compareList.some((p) => p.id === prog.id)) {
      setCompareList(compareList.filter((p) => p.id !== prog.id));
    } else {
      if (compareList.length >= 3) {
        // Max 3 for side-by-side
        setCompareList([...compareList.slice(1), prog]);
      } else {
        setCompareList([...compareList, prog]);
      }
    }
  };

  const handleRegisterClick = (prog: AcademicProgramme) => {
    const inst = ALL_KENYAN_INSTITUTIONS.find(
      (i) => i.id.toLowerCase() === prog.institutionId.toLowerCase()
    );
    if (inst && onSelectProgrammeForRegister) {
      onSelectProgrammeForRegister(prog, inst);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="programme-discovery-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="programme-discovery-modal-container"
        className="relative w-full max-w-7xl max-h-[92vh] glass-panel border border-cyan-400/30 rounded-2xl flex flex-col shadow-2xl overflow-hidden bg-slate-950/95"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-bold text-white font-heading tracking-tight">
                  Search Kenyan Tertiary Academic Programmes & Courses
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-400/30">
                  CUE & TVETA Unified
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Official approved academic curriculum catalogue spanning Universities, University Colleges, National Polytechnics, TVET Colleges & Vocational Centres
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {compareList.length > 0 && (
              <button
                type="button"
                onClick={() => setIsComparing(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition-all cursor-pointer shadow-sm"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compare ({compareList.length})</span>
              </button>
            )}

            <button
              id="close-programme-discovery-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Catalogue"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="p-4 border-b border-white/10 bg-slate-900/60 space-y-3">
          {/* Search Query Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              id="programme-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search programmes e.g. 'Computer Science', 'Information Technology', 'Civil Engineering', 'Medicine', 'Law', 'Electrical', 'Hospitality'..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 text-xs">
            {/* Institution Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                Institution
              </label>
              <select
                id="filter-institution-select"
                value={selectedInstitutionId}
                onChange={(e) => setSelectedInstitutionId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-200 focus:border-cyan-400 truncate"
              >
                <option value="All">All Institutions ({ALL_KENYAN_INSTITUTIONS.length})</option>
                {ALL_KENYAN_INSTITUTIONS.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.shortName} - {inst.name}
                  </option>
                ))}
              </select>
            </div>

            {/* County Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                County
              </label>
              <select
                id="filter-county-select"
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-200 focus:border-cyan-400 truncate"
              >
                <option value="All">All 47 Counties</option>
                {allCounties.map((c) => (
                  <option key={c} value={c}>
                    {c} County
                  </option>
                ))}
              </select>
            </div>

            {/* Qualification Level Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                Qualification Level
              </label>
              <select
                id="filter-level-select"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as CourseLevel | 'All')}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-200 focus:border-cyan-400 truncate"
              >
                <option value="All">All Levels (PhD to Artisan)</option>
                {allLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Field Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                Academic Discipline / Field
              </label>
              <select
                id="filter-field-select"
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-200 focus:border-cyan-400 truncate"
              >
                <option value="All">All Disciplines</option>
                {allFields.map((fld) => (
                  <option key={fld} value={fld}>
                    {fld}
                  </option>
                ))}
              </select>
            </div>

            {/* Examining Body */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                Examining Body
              </label>
              <select
                id="filter-examining-body-select"
                value={selectedExaminingBody}
                onChange={(e) => setSelectedExaminingBody(e.target.value as ExaminingBody | 'All')}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-200 focus:border-cyan-400 truncate"
              >
                <option value="All">All Examining Bodies</option>
                {allExaminingBodies.map((eb) => (
                  <option key={eb} value={eb}>
                    {eb}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode of Study */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                Mode of Study
              </label>
              <select
                id="filter-mode-select"
                value={selectedStudyMode}
                onChange={(e) => setSelectedStudyMode(e.target.value as StudyMode | 'All')}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-200 focus:border-cyan-400 truncate"
              >
                <option value="All">All Modes of Study</option>
                <option value="Full-time">Full-time</option>
                <option value="Evening">Evening</option>
                <option value="Weekend">Weekend</option>
                <option value="Distance / Online">Distance / Online</option>
                <option value="Blended Learning">Blended Learning</option>
              </select>
            </div>

            {/* Regulator Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                Regulator
              </label>
              <select
                id="filter-regulator-select"
                value={selectedRegulator}
                onChange={(e) => setSelectedRegulator(e.target.value as 'CUE' | 'TVETA' | 'All')}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-200 focus:border-cyan-400 truncate"
              >
                <option value="All">All Regulators (CUE & TVETA)</option>
                <option value="CUE">CUE (Universities)</option>
                <option value="TVETA">TVETA (Polytechnics & TVETs)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Bar */}
        <div className="px-6 py-2.5 bg-slate-900/40 border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-cyan-300">{filteredProgrammes.length}</span> verified academic programmes and courses across Kenya
          </div>
          {(selectedInstitutionId !== 'All' ||
            selectedCounty !== 'All' ||
            selectedLevel !== 'All' ||
            selectedField !== 'All' ||
            selectedExaminingBody !== 'All' ||
            selectedStudyMode !== 'All' ||
            selectedRegulator !== 'All' ||
            searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedInstitutionId('All');
                setSelectedCounty('All');
                setSelectedLevel('All');
                setSelectedField('All');
                setSelectedExaminingBody('All');
                setSelectedStudyMode('All');
                setSelectedRegulator('All');
              }}
              className="text-xs text-rose-300 hover:text-rose-200 underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Programmes Grid List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredProgrammes.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h4 className="text-base font-bold text-white mb-1">No programmes found</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No tertiary academic programmes match your current search terms or filter combinations. Try selecting &quot;All Disciplines&quot; or clearing your query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProgrammes.map((prog) => {
                const institution = ALL_KENYAN_INSTITUTIONS.find(
                  (i) => i.id.toLowerCase() === prog.institutionId.toLowerCase()
                );
                const isCompared = compareList.some((p) => p.id === prog.id);

                return (
                  <div
                    key={prog.id}
                    className="p-4 sm:p-5 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-cyan-400/40 transition-all flex flex-col justify-between group shadow-sm"
                  >
                    <div>
                      {/* Top Badges: Award / Level & Examining Body */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                            {prog.award || prog.level || 'Degree'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-400/20">
                            {prog.examiningBody || 'University Senate'}
                          </span>
                          {prog.field && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 hidden sm:inline">
                              {prog.field}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                          {prog.code}
                        </span>
                      </div>

                      {/* Programme Title */}
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors font-heading mb-1.5 leading-snug">
                        {prog.name}
                      </h3>

                      {/* Institution & Campus */}
                      <div className="flex items-center space-x-2 text-xs text-slate-300 mb-2">
                        <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="font-semibold text-white">
                          {institution?.name || prog.institutionName || 'Recognized Kenyan Institution'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{institution?.county || 'Kenya'} County</span>
                          {prog.campus && <span>• {prog.campus}</span>}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{prog.duration || `${prog.durationYears} Years`}</span>
                        </div>
                      </div>

                      {/* Entry Requirements summary */}
                      {prog.entryRequirements && (
                        <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[11px] text-slate-300 mb-3 space-y-1">
                          <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                            <span>
                              {typeof prog.entryRequirements === 'string'
                                ? prog.entryRequirements
                                : prog.entryRequirements.minimumMeanGrade}
                            </span>
                          </div>
                          {typeof prog.entryRequirements !== 'string' &&
                            prog.entryRequirements.requiredClusterSubjects && (
                              <p className="text-[10px] text-slate-400 truncate">
                                Cluster: {prog.entryRequirements.requiredClusterSubjects.join(', ')}
                              </p>
                            )}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 mt-2">
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailProgramme(prog)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>View Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleCompare(prog)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center space-x-1 cursor-pointer ${
                            isCompared
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                          }`}
                          title="Add to comparison"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">
                            {isCompared ? 'Comparing' : 'Compare'}
                          </span>
                        </button>
                      </div>

                      {onSelectProgrammeForRegister && institution && (
                        <button
                          type="button"
                          onClick={() => handleRegisterClick(prog)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-bold text-xs transition-all shadow flex items-center space-x-1.5 cursor-pointer"
                        >
                          <span>Enroll</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Persistent Bar */}
        <div className="p-3 border-t border-white/10 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400 px-6">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Official Registry: Commission for University Education (CUE) & Technical and Vocational Education and Training Authority (TVETA)
            </span>
          </div>

          {compareList.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-slate-300">
                {compareList.length} course(s) selected
              </span>
              <button
                type="button"
                onClick={() => setIsComparing(true)}
                className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors cursor-pointer"
              >
                Compare Side-by-Side
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* MODAL 1: PROGRAMME DETAIL VIEW (CURRICULUM & ENTRY REQUIREMENTS)          */}
        {/* ========================================================================= */}
        {detailProgramme && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="relative w-full max-w-3xl glass-panel border border-cyan-400/40 rounded-2xl bg-slate-950 p-6 space-y-5 shadow-2xl animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      {detailProgramme.level || detailProgramme.award}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-400/20">
                      Examining Body: {detailProgramme.examiningBody || 'University Senate'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                      Code: {detailProgramme.code}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-heading">
                    {detailProgramme.name}
                  </h3>
                  <p className="text-xs text-cyan-300 font-semibold mt-0.5">
                    {detailProgramme.institutionName} • {detailProgramme.department}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailProgramme(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Overview */}
              {detailProgramme.overview && (
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed">
                  <p>{detailProgramme.overview}</p>
                </div>
              )}

              {/* Key Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Duration</span>
                  <span className="font-bold text-white">
                    {detailProgramme.duration || `${detailProgramme.durationYears} Years`}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Academic Calendar</span>
                  <span className="font-bold text-white">
                    {detailProgramme.academicPeriod || 'Semester'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Accreditation</span>
                  <span className="font-bold text-emerald-400">
                    {detailProgramme.cueAccredited ? 'CUE Approved' : 'TVETA Licensed'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Study Modes</span>
                  <span className="font-bold text-white">
                    {Array.isArray(detailProgramme.modeOfStudy)
                      ? detailProgramme.modeOfStudy.join(', ')
                      : detailProgramme.modeOfStudy || 'Full-time'}
                  </span>
                </div>
              </div>

              {/* Detailed Entry Requirements */}
              {detailProgramme.entryRequirements && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5 uppercase tracking-wider text-cyan-300">
                    <GraduationCap className="w-4 h-4" />
                    <span>Statutory Entry Requirements & Qualifications</span>
                  </h4>
                  {typeof detailProgramme.entryRequirements === 'string' ? (
                    <p className="text-xs text-slate-300">{detailProgramme.entryRequirements}</p>
                  ) : (
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div>
                        <span className="font-semibold text-white">Minimum Grade: </span>
                        <span>{detailProgramme.entryRequirements.minimumMeanGrade}</span>
                      </div>
                      {detailProgramme.entryRequirements.requiredClusterSubjects && (
                        <div>
                          <span className="font-semibold text-white">Required Subjects / Clusters: </span>
                          <span>{detailProgramme.entryRequirements.requiredClusterSubjects.join(' • ')}</span>
                        </div>
                      )}
                      {detailProgramme.entryRequirements.alternativeRequirements && (
                        <div>
                          <span className="font-semibold text-white">Alternative Paths: </span>
                          <span className="text-slate-400">
                            {detailProgramme.entryRequirements.alternativeRequirements}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Curriculum Stages / Units Preview */}
              {detailProgramme.curriculumStages && detailProgramme.curriculumStages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5 uppercase tracking-wider text-cyan-300">
                    <Layers className="w-4 h-4" />
                    <span>Sample Curriculum & Course Modules</span>
                  </h4>
                  <div className="space-y-2.5">
                    {detailProgramme.curriculumStages.map((stg) => (
                      <div
                        key={stg.stageNumber}
                        className="p-3 rounded-xl bg-slate-900/60 border border-white/10"
                      >
                        <div className="text-xs font-bold text-cyan-300 mb-2">{stg.stageName}</div>
                        <div className="space-y-1.5">
                          {stg.units.map((u) => (
                            <div
                              key={u.code}
                              className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white/5 border border-white/5"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-slate-400 text-[11px]">{u.code}</span>
                                <span className="text-slate-200">{u.title}</span>
                              </div>
                              <span className="text-[10px] text-cyan-400 font-semibold">
                                {u.isCore ? 'Core Unit' : 'Elective'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Source & Verification Citation */}
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-400/20 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="block font-semibold text-white">
                      {detailProgramme.source || 'Commission for University Education / TVETA Official Register'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Accreditation Number: {detailProgramme.cueAccreditationNumber || detailProgramme.tvetaCourseCode || 'VERIFIED'}
                    </span>
                  </div>
                </div>
                {detailProgramme.sourceUrl && (
                  <a
                    href={detailProgramme.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 text-xs font-semibold underline"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDetailProgramme(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  Close
                </button>
                {onSelectProgrammeForRegister && (
                  <button
                    type="button"
                    onClick={() => {
                      handleRegisterClick(detailProgramme);
                      setDetailProgramme(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-bold text-xs shadow-lg flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Register with this Programme</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: SIDE-BY-SIDE PROGRAMME COMPARISON TOOL                            */}
        {/* ========================================================================= */}
        {isComparing && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="relative w-full max-w-6xl glass-panel border border-cyan-400/40 rounded-2xl bg-slate-950 p-6 space-y-5 shadow-2xl animate-in fade-in duration-200 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-heading">
                      Side-by-Side Programme Comparison
                    </h3>
                    <p className="text-xs text-slate-400">
                      Comparing {compareList.length} accredited Kenyan tertiary programmes across institutions
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setCompareList([])}
                    className="text-xs text-rose-300 hover:underline px-2 py-1"
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsComparing(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {compareList.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <p>No programmes selected for comparison yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {compareList.map((prog) => {
                    const inst = ALL_KENYAN_INSTITUTIONS.find(
                      (i) => i.id.toLowerCase() === prog.institutionId.toLowerCase()
                    );
                    return (
                      <div
                        key={prog.id}
                        className="p-4 rounded-xl border border-white/15 bg-slate-900/80 space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                              {prog.award || prog.level}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleCompare(prog)}
                              className="text-slate-400 hover:text-rose-400 p-1"
                              title="Remove from comparison"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-white font-heading">
                              {prog.name}
                            </h4>
                            <span className="text-[11px] font-mono text-cyan-400 block mt-0.5">
                              Code: {prog.code}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-1 text-xs">
                            <div className="font-semibold text-white flex items-center space-x-1.5">
                              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{inst?.name || prog.institutionName}</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {inst?.type} • {inst?.county} County
                            </div>
                          </div>

                          {/* Comparison Metrics */}
                          <div className="space-y-2 text-xs divide-y divide-white/5">
                            <div className="pt-1.5 flex justify-between">
                              <span className="text-slate-400">Examining Body:</span>
                              <span className="font-semibold text-emerald-300">
                                {prog.examiningBody || 'University Senate'}
                              </span>
                            </div>

                            <div className="pt-1.5 flex justify-between">
                              <span className="text-slate-400">Duration:</span>
                              <span className="font-semibold text-white">
                                {prog.duration || `${prog.durationYears} Years`}
                              </span>
                            </div>

                            <div className="pt-1.5 flex justify-between">
                              <span className="text-slate-400">Academic Structure:</span>
                              <span className="font-semibold text-white">
                                {prog.academicPeriod || 'Semester'}
                              </span>
                            </div>

                            <div className="pt-1.5 flex justify-between">
                              <span className="text-slate-400">Accreditation:</span>
                              <span className="font-semibold text-emerald-400">
                                {prog.cueAccredited ? 'CUE Approved' : 'TVETA Licensed'}
                              </span>
                            </div>

                            <div className="pt-1.5 space-y-1">
                              <span className="text-slate-400 block">Entry Requirement:</span>
                              <p className="text-[11px] text-slate-200">
                                {typeof prog.entryRequirements === 'string'
                                  ? prog.entryRequirements
                                  : prog.entryRequirements?.minimumMeanGrade}
                              </p>
                            </div>
                          </div>
                        </div>

                        {onSelectProgrammeForRegister && inst && (
                          <button
                            type="button"
                            onClick={() => {
                              handleRegisterClick(prog);
                              setIsComparing(false);
                            }}
                            className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-sky-500 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow"
                          >
                            <span>Enroll with this Programme</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsComparing(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Back to Catalogue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
