import React, { useState, useMemo } from 'react';
import {
  ALL_KENYAN_INSTITUTIONS,
  getAllCounties,
  getAllInstitutionTypes,
  searchInstitutions,
  InstitutionFilterParams,
} from '../../services/institutionService';
import {
  Institution,
  InstitutionType,
  InstitutionOwnership,
  CourseLevel,
} from '../../types';
import {
  Search,
  Building2,
  MapPin,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  X,
  ExternalLink,
  ChevronRight,
  BookOpen,
  School,
  Clock,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

interface InstitutionDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectInstitutionForRegister?: (institution: Institution) => void;
  onOpenAdminAdd?: () => void;
  onOpenProgrammeDiscovery?: () => void;
}

export const InstitutionDiscoveryModal: React.FC<InstitutionDiscoveryModalProps> = ({
  isOpen,
  onClose,
  onSelectInstitutionForRegister,
  onOpenAdminAdd,
  onOpenProgrammeDiscovery,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<InstitutionType | 'All'>('All');
  const [selectedCounty, setSelectedCounty] = useState<string>('All');
  const [selectedOwnership, setSelectedOwnership] = useState<InstitutionOwnership | 'All'>('All');
  const [selectedRegulator, setSelectedRegulator] = useState<'CUE' | 'TVETA' | 'Other' | 'All'>('All');
  const [courseKeyword, setCourseKeyword] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | 'All'>('All');

  // Selected institution for deep view
  const [detailedInstitution, setDetailedInstitution] = useState<Institution | null>(null);

  const allCounties = useMemo(() => getAllCounties(), []);
  const allTypes = useMemo(() => getAllInstitutionTypes(), []);

  // Filtered institutions
  const filteredInstitutions = useMemo(() => {
    let list = ALL_KENYAN_INSTITUTIONS;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.shortName.toLowerCase().includes(q) ||
          i.county.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q) ||
          i.campuses.some((c) => c.name.toLowerCase().includes(q) || (c.town && c.town.toLowerCase().includes(q))) ||
          i.programmes.some((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
      );
    }

    // Type
    if (selectedType !== 'All') {
      list = list.filter((i) => {
        if (selectedType === 'University') {
          return i.type === 'University' || (i.type.includes('University') && i.type !== 'University College');
        }
        return i.type.toLowerCase() === selectedType.toLowerCase();
      });
    }

    // County
    if (selectedCounty !== 'All') {
      const cLower = selectedCounty.toLowerCase();
      list = list.filter((i) => i.county.toLowerCase().includes(cLower));
    }

    // Ownership
    if (selectedOwnership !== 'All') {
      list = list.filter((i) => i.ownership === selectedOwnership);
    }

    // Regulator
    if (selectedRegulator !== 'All') {
      list = list.filter((i) => i.regulator === selectedRegulator);
    }

    // Course
    if (courseKeyword.trim()) {
      const c = courseKeyword.toLowerCase().trim();
      list = list.filter((i) =>
        i.programmes.some(
          (p) =>
            p.name.toLowerCase().includes(c) ||
            p.code.toLowerCase().includes(c) ||
            p.department.toLowerCase().includes(c)
        )
      );
    }

    // Level
    if (selectedLevel !== 'All') {
      list = list.filter((i) =>
        i.programmes.some((p) => p.level === selectedLevel || p.award === selectedLevel)
      );
    }

    return list;
  }, [
    searchQuery,
    selectedType,
    selectedCounty,
    selectedOwnership,
    selectedRegulator,
    courseKeyword,
    selectedLevel,
  ]);

  if (!isOpen) return null;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedCounty('All');
    setSelectedOwnership('All');
    setSelectedRegulator('All');
    setCourseKeyword('');
    setSelectedLevel('All');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col glass-card border border-white/20 rounded-2xl shadow-2xl overflow-hidden bg-slate-950/95">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-bold text-white font-heading">
                  All-Kenya Tertiary Education Directory
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  CUE & TVETA Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official register of Universities, National Polytechnics, TVET Colleges & Vocational Centres
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenProgrammeDiscovery && (
              <button
                type="button"
                onClick={onOpenProgrammeDiscovery}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-xs font-semibold text-cyan-300 transition-colors shadow-sm cursor-pointer"
                title="Search all approved university and TVET programmes"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search Programmes</span>
                <span className="sm:hidden">Courses</span>
              </button>
            )}
            {onOpenAdminAdd && (
              <button
                type="button"
                onClick={onOpenAdminAdd}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-xs font-semibold text-cyan-300 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Institution</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-white/10 bg-slate-900/60 space-y-3">
          {/* Main search and keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search institution by name, short name or campus (e.g. 'Thika', 'Kabete', 'Kenyatta')..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="sm:col-span-6 relative">
              <BookOpen className="w-4 h-4 text-emerald-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={courseKeyword}
                onChange={(e) => setCourseKeyword(e.target.value)}
                placeholder="Filter by course keyword (e.g. 'ICT', 'Electrical', 'Civil', 'Commerce')..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Structured dropdown filters */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {/* County */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400 text-[11px] font-medium">County:</span>
              <select
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="All">All Counties</option>
                {allCounties.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Institution Type */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400 text-[11px] font-medium">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="All">All Institution Types</option>
                {allTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Ownership */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400 text-[11px] font-medium">Ownership:</span>
              <select
                value={selectedOwnership}
                onChange={(e) => setSelectedOwnership(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="All">Public & Private</option>
                <option value="Public">Public Only</option>
                <option value="Private">Private Only</option>
              </select>
            </div>

            {/* Regulator */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400 text-[11px] font-medium">Regulator:</span>
              <select
                value={selectedRegulator}
                onChange={(e) => setSelectedRegulator(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="All">All Regulators</option>
                <option value="CUE">CUE (Universities)</option>
                <option value="TVETA">TVETA (Technical & Vocational)</option>
                <option value="Other">Other Statutory Boards</option>
              </select>
            </div>

            {/* Level */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400 text-[11px] font-medium">Course Level:</span>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="All">All Levels</option>
                <option value="Bachelor Degree">Bachelor Degree</option>
                <option value="Diploma (Level 6)">Diploma (Level 6)</option>
                <option value="Certificate (Level 5)">Certificate (Level 5)</option>
                <option value="Artisan (Level 4)">Artisan (Level 4)</option>
              </select>
            </div>

            {/* Reset button */}
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto text-[11px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Content Body: Grid of Institutions or Detail View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing <strong className="text-white">{filteredInstitutions.length}</strong> accredited institutions
            </span>
            <span className="text-[11px] text-slate-500">
              Click &quot;View Details&quot; to inspect campuses, programs & examining bodies
            </span>
          </div>

          {filteredInstitutions.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-semibold text-slate-300">No institutions match your search</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try clearing some filters or searching for county names like Nairobi, Kiambu, Mombasa, or Kisumu.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-semibold cursor-pointer"
              >
                Show All Institutions
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInstitutions.map((inst) => (
                <div
                  key={inst.id}
                  className="glass-card border border-white/10 hover:border-cyan-400/40 rounded-xl p-4 flex flex-col justify-between transition-all group hover:bg-slate-900/60"
                >
                  <div className="space-y-3">
                    {/* Top Row: Short name & Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-sm font-bold text-cyan-300 group-hover:border-cyan-400/50 transition-colors">
                          {inst.shortName}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/25">
                            {inst.type}
                          </span>
                          <span className="ml-1.5 text-[10px] font-semibold text-slate-400">
                            {inst.ownership || 'Public'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-400/25 flex items-center space-x-1 shrink-0">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>{inst.regulator || 'Verified'}</span>
                      </span>
                    </div>

                    {/* Name */}
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                        {inst.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{inst.county} County</span>
                      </div>
                    </div>

                    {/* Accreditation status */}
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-[11px] text-slate-300 space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>Status:</span>
                        <span className="text-emerald-400 font-semibold">{inst.licensingStatus || 'Registered and Licensed'}</span>
                      </div>
                      {inst.registrationNumber && (
                        <div className="flex items-center justify-between text-slate-400 text-[10px]">
                          <span>Reg No:</span>
                          <span className="text-slate-300 font-mono">{inst.registrationNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick counts */}
                    <div className="grid grid-cols-3 gap-1 py-1 text-center border-t border-b border-white/5 text-[11px]">
                      <div>
                        <span className="text-xs font-bold text-white block">{inst.campuses.length}</span>
                        <span className="text-[10px] text-slate-500">Campuses</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{inst.schools.length}</span>
                        <span className="text-[10px] text-slate-500">Depts / Schools</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{inst.programmes.length}</span>
                        <span className="text-[10px] text-slate-500">Courses</span>
                      </div>
                    </div>

                    {/* Sample Programs */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Featured Courses:
                      </span>
                      <div className="space-y-1">
                        {inst.programmes.slice(0, 2).map((prog) => (
                          <div
                            key={prog.id}
                            className="text-[11px] text-slate-300 truncate flex items-center justify-between"
                          >
                            <span className="truncate">{prog.name}</span>
                            <span className="text-[9px] px-1 rounded bg-white/10 text-cyan-300 shrink-0 ml-1">
                              {prog.examiningBody || 'KNEC/Senate'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setDetailedInstitution(inst)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer text-center"
                    >
                      View Details
                    </button>

                    {onSelectInstitutionForRegister && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectInstitutionForRegister(inst);
                          onClose();
                        }}
                        className="py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white transition-all shadow-md flex items-center space-x-1 cursor-pointer"
                        title="Register / Enroll with this institution"
                      >
                        <span>Register</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              All institution credentials strictly verified against the CUE Official University Register & TVETA Register.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer text-xs"
          >
            Close Directory
          </button>
        </div>

        {/* Deep Detailed View Modal */}
        {detailedInstitution && (
          <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in duration-150">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-900">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-lg">
                  {detailedInstitution.shortName}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {detailedInstitution.name}
                  </h3>
                  <div className="text-xs text-cyan-300 flex items-center space-x-2 mt-0.5">
                    <span>{detailedInstitution.type}</span>
                    <span>•</span>
                    <span>{detailedInstitution.county} County</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{detailedInstitution.regulator} Licensed</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailedInstitution(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Detailed Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Institution Overview Card */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Accreditation / Charter:</span>
                  <span className="text-white font-medium">{detailedInstitution.accreditation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Registration Number:</span>
                  <span className="text-white font-mono">{detailedInstitution.registrationNumber || 'Official Charter'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Data Source:</span>
                  <span className="text-white">{detailedInstitution.source}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Last Verified:</span>
                  <span className="text-emerald-400 font-medium">
                    {new Date(detailedInstitution.lastVerifiedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Campuses & Centres */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>Campuses & Centres ({detailedInstitution.campuses.length})</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {detailedInstitution.campuses.map((c) => (
                    <div key={c.id} className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{c.name}</span>
                        {c.isMainCampus && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                            Main Campus
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px]">{c.address}</p>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-300 pt-1">
                        <span>📞 {c.contacts.phone}</span>
                        <span>✉️ {c.contacts.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic Courses & Examining Bodies */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>Approved Programmes & Examining Bodies ({detailedInstitution.programmes.length})</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {detailedInstitution.programmes.map((prog) => (
                    <div key={prog.id} className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1.5 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-white">{prog.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 font-bold shrink-0">
                          {prog.examiningBody || 'KNEC / Senate'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                        <span>Level: {prog.level}</span>
                        <span>•</span>
                        <span>Dept: {prog.department}</span>
                        <span>•</span>
                        <span>{prog.durationYears} Years</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/10 bg-slate-900 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setDetailedInstitution(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs cursor-pointer"
              >
                Back to List
              </button>

              {onSelectInstitutionForRegister && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectInstitutionForRegister(detailedInstitution);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg flex items-center space-x-2 cursor-pointer"
                >
                  <span>Select & Register with {detailedInstitution.shortName}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
