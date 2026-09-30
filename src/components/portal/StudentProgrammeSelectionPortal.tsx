import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Institution,
  DepartmentItem,
  AcademicProgramme,
  Campus,
  CourseLevel,
  StudentAcademicSelection,
} from '../../types';
import {
  ALL_KENYAN_INSTITUTIONS,
  getInstitutionById,
  getDepartmentsByInstitution,
  getProgrammesByDepartment,
  getAllCounties,
} from '../../services/institutionService';
import { AddAcademicDataModal } from './AddAcademicDataModal';
import {
  Building2,
  GraduationCap,
  BookOpen,
  Layers,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  Check,
  Edit3,
  Sparkles,
  School,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Plus,
  RefreshCw,
  Info,
  Award,
} from 'lucide-react';

interface StudentProgrammeSelectionPortalProps {
  onContinueToWorkplace: (selection: StudentAcademicSelection) => void;
  onSelectForRegister?: (selection: StudentAcademicSelection) => void;
  onSwitchToLogin?: () => void;
  onBackToHome?: () => void;
  initialSelection?: Partial<StudentAcademicSelection> | null;
}

type StepKey = 1 | 2 | 3 | 4 | 5 | 6;

const STEP_DEFINITIONS = [
  { step: 1, number: '01', title: 'Institution', label: 'Select Institution' },
  { step: 2, number: '02', title: 'Department', label: 'Select Department' },
  { step: 3, number: '03', title: 'Programme', label: 'Select Programme' },
  { step: 4, number: '04', title: 'Level', label: 'Course Level' },
  { step: 5, number: '05', title: 'Study Details', label: 'Campus & Mode' },
  { step: 6, number: '06', title: 'Confirm', label: 'Confirm Selection' },
];

const INSTITUTION_TYPE_CATEGORIES = [
  { id: 'All', label: 'All Types' },
  { id: 'University', label: 'University' },
  { id: 'TVET', label: 'TVET' },
  { id: 'College', label: 'College' },
  { id: 'KMTC', label: 'KMTC' },
  { id: 'Polytechnic', label: 'Polytechnic' },
  { id: 'Other', label: 'Other registered' },
];

export const StudentProgrammeSelectionPortal: React.FC<StudentProgrammeSelectionPortalProps> = ({
  onContinueToWorkplace,
  onSelectForRegister,
  onSwitchToLogin,
  onBackToHome,
  initialSelection,
}) => {
  const { currentUser, userProfile, updateProfile } = useAuth();

  // Wizard active step
  const [currentStep, setCurrentStep] = useState<StepKey>(1);

  // Stepper Hierarchy State
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentItem | null>(null);
  const [selectedProgramme, setSelectedProgramme] = useState<AcademicProgramme | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedStudyMode, setSelectedStudyMode] = useState<string | null>(null);
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const [selectedIntake, setSelectedIntake] = useState<string | null>(null);

  // Step 1: Institution filters
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [countyFilter, setCountyFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Step 2: Department state
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Step 3: Programme state
  const [programmeSearch, setProgrammeSearch] = useState('');
  const [programmes, setProgrammes] = useState<AcademicProgramme[]>([]);
  const [loadingProgrammes, setLoadingProgrammes] = useState(false);

  // Admin Modal
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Pre-load from initialSelection if provided
  useEffect(() => {
    if (initialSelection?.institutionId) {
      const inst = ALL_KENYAN_INSTITUTIONS.find(
        (i) => i.id.toLowerCase() === initialSelection.institutionId?.toLowerCase()
      );
      if (inst) {
        setSelectedInstitution(inst);
      }
    }
  }, [initialSelection]);

  // Load departments automatically whenever selectedInstitution changes
  useEffect(() => {
    if (!selectedInstitution) {
      setDepartments([]);
      return;
    }

    let isMounted = true;
    setLoadingDepartments(true);

    getDepartmentsByInstitution(selectedInstitution.id)
      .then((depts) => {
        if (isMounted) {
          setDepartments(depts);
          setLoadingDepartments(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching departments:', err);
        if (isMounted) setLoadingDepartments(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedInstitution]);

  // Load programmes automatically whenever selectedDepartment changes
  useEffect(() => {
    if (!selectedInstitution || !selectedDepartment) {
      setProgrammes([]);
      return;
    }

    let isMounted = true;
    setLoadingProgrammes(true);

    getProgrammesByDepartment(selectedInstitution.id, selectedDepartment.name)
      .then((progs) => {
        if (isMounted) {
          // If by department name returned few, also fallback to matching by school
          if (progs.length === 0 && selectedDepartment.schoolId) {
            const fallback = selectedInstitution.programmes.filter(
              (p) => p.schoolId === selectedDepartment.schoolId
            );
            setProgrammes(fallback);
          } else {
            setProgrammes(progs);
          }
          setLoadingProgrammes(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching programmes:', err);
        if (isMounted) setLoadingProgrammes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedInstitution, selectedDepartment]);

  // Automatically determine available levels when programme is chosen
  const availableLevels = useMemo(() => {
    if (!selectedProgramme) return [];

    const levels = new Set<string>();

    if (selectedProgramme.qualificationLevel) {
      levels.add(selectedProgramme.qualificationLevel);
    }
    if (selectedProgramme.level) {
      levels.add(selectedProgramme.level);
    }
    if (selectedProgramme.award) {
      if (selectedProgramme.award === 'Bachelor') levels.add("Bachelor's Degree");
      else if (selectedProgramme.award === 'Master') levels.add("Master's Degree");
      else if (selectedProgramme.award === 'Doctorate') levels.add('Doctorate (PhD)');
      else if (selectedProgramme.award === 'Diploma') levels.add('Diploma (Level 6)');
      else if (selectedProgramme.award === 'Certificate') levels.add('Certificate (Level 5)');
      else if (selectedProgramme.award === 'Artisan') levels.add('Artisan (Level 4)');
      else levels.add(selectedProgramme.award);
    }

    // If it's a TVET program, support competency-based levels (Level 4, 5, 6)
    const isTVET =
      selectedInstitution?.type.toLowerCase().includes('tvet') ||
      selectedInstitution?.type.toLowerCase().includes('polytechnic') ||
      selectedInstitution?.regulator === 'TVETA';

    if (isTVET && levels.size === 0) {
      levels.add('Diploma (Level 6)');
      levels.add('Certificate (Level 5)');
    }

    if (levels.size === 0) {
      levels.add("Bachelor's Degree");
    }

    return Array.from(levels);
  }, [selectedProgramme, selectedInstitution]);

  // Automatically determine available study modes
  const availableStudyModes = useMemo(() => {
    if (!selectedProgramme) return ['Full Time'];

    const modes = new Set<string>();
    if (Array.isArray(selectedProgramme.studyModes)) {
      selectedProgramme.studyModes.forEach((m) => modes.add(m));
    }
    if (Array.isArray(selectedProgramme.modeOfStudy)) {
      selectedProgramme.modeOfStudy.forEach((m) => modes.add(m));
    } else if (typeof selectedProgramme.modeOfStudy === 'string') {
      modes.add(selectedProgramme.modeOfStudy);
    }

    if (modes.size === 0) {
      modes.add('Full Time');
      modes.add('Part Time');
      modes.add('Evening');
      modes.add('Blended');
    }

    return Array.from(modes);
  }, [selectedProgramme]);

  // Automatically determine available campuses
  const availableCampuses = useMemo(() => {
    if (!selectedInstitution) return [];
    if (!selectedProgramme) return selectedInstitution.campuses || [];

    if (selectedProgramme.campusId) {
      const match = selectedInstitution.campuses.filter(
        (c) => c.id.toLowerCase() === selectedProgramme.campusId?.toLowerCase()
      );
      if (match.length > 0) return match;
    }

    if (selectedProgramme.campusIds && selectedProgramme.campusIds.length > 0) {
      const match = selectedInstitution.campuses.filter((c) =>
        selectedProgramme.campusIds?.includes(c.id)
      );
      if (match.length > 0) return match;
    }

    return selectedInstitution.campuses || [];
  }, [selectedInstitution, selectedProgramme]);

  // Handle auto-selection of single campus as per requirement:
  // "If there is only one campus, automatically select it and continue."
  useEffect(() => {
    if (currentStep === 5 && availableCampuses.length === 1 && !selectedCampus) {
      setSelectedCampus(availableCampuses[0]);
    }
  }, [currentStep, availableCampuses, selectedCampus]);

  // Available Intakes from programme or default institution calendar
  const availableIntakes = useMemo(() => {
    if (selectedProgramme?.intakes && selectedProgramme.intakes.length > 0) {
      return selectedProgramme.intakes;
    }
    return ['September 2026', 'January 2027', 'May 2027'];
  }, [selectedProgramme]);

  // Filter Institutions in Step 1
  const filteredInstitutions = useMemo(() => {
    let list = [...ALL_KENYAN_INSTITUTIONS];

    if (typeFilter !== 'All') {
      list = list.filter((inst) => {
        const t = inst.type.toLowerCase();
        const short = inst.shortName.toLowerCase();
        const id = inst.id.toLowerCase();

        if (typeFilter === 'KMTC') {
          return id.includes('kmtc') || short.includes('kmtc') || inst.name.toLowerCase().includes('medical training');
        }
        if (typeFilter === 'Polytechnic') {
          return t.includes('polytechnic') || inst.name.toLowerCase().includes('polytechnic');
        }
        if (typeFilter === 'University') {
          return t.includes('university') && !t.includes('college');
        }
        if (typeFilter === 'TVET') {
          return t.includes('tvet') || t.includes('technical') || inst.regulator === 'TVETA';
        }
        if (typeFilter === 'College') {
          return t.includes('college');
        }
        return true;
      });
    }

    if (countyFilter !== 'All') {
      list = list.filter((inst) =>
        inst.county.toLowerCase().includes(countyFilter.toLowerCase())
      );
    }

    if (institutionSearch.trim()) {
      const q = institutionSearch.trim().toLowerCase();
      list = list.filter(
        (inst) =>
          inst.name.toLowerCase().includes(q) ||
          inst.shortName.toLowerCase().includes(q) ||
          inst.county.toLowerCase().includes(q) ||
          inst.campuses.some(
            (c) => c.name.toLowerCase().includes(q) || (c.town && c.town.toLowerCase().includes(q))
          )
      );
    }

    return list;
  }, [institutionSearch, countyFilter, typeFilter]);

  // Filter Departments in Step 2
  const filteredDepartments = useMemo(() => {
    if (!departmentSearch.trim()) return departments;
    const q = departmentSearch.trim().toLowerCase();
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.schoolName && d.schoolName.toLowerCase().includes(q)) ||
        (d.description && d.description.toLowerCase().includes(q))
    );
  }, [departments, departmentSearch]);

  // Filter Programmes in Step 3
  const filteredProgrammes = useMemo(() => {
    if (!programmeSearch.trim()) return programmes;
    const q = programmeSearch.trim().toLowerCase();
    return programmes.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.level && p.level.toLowerCase().includes(q)) ||
        (p.overview && p.overview.toLowerCase().includes(q))
    );
  }, [programmes, programmeSearch]);

  // RESET INVARIANTS:
  // "Changing a parent selection resets child selections (e.g. changing institution resets department, programme, level, etc.)."
  const handleSelectInstitution = (inst: Institution) => {
    if (selectedInstitution?.id !== inst.id) {
      setSelectedInstitution(inst);
      setSelectedDepartment(null);
      setSelectedProgramme(null);
      setSelectedLevel(null);
      setSelectedStudyMode(null);
      setSelectedCampus(null);
      setSelectedIntake(null);
    }
    setCurrentStep(2);
  };

  const handleSelectDepartment = (dept: DepartmentItem) => {
    if (selectedDepartment?.id !== dept.id) {
      setSelectedDepartment(dept);
      setSelectedProgramme(null);
      setSelectedLevel(null);
      setSelectedStudyMode(null);
      setSelectedCampus(null);
      setSelectedIntake(null);
    }
    setCurrentStep(3);
  };

  const handleSelectProgramme = (prog: AcademicProgramme) => {
    if (selectedProgramme?.id !== prog.id) {
      setSelectedProgramme(prog);
      setSelectedLevel(null);
      setSelectedStudyMode(null);
      setSelectedCampus(null);
      setSelectedIntake(null);
    }
    setCurrentStep(4);
  };

  const handleSelectLevel = (level: string) => {
    setSelectedLevel(level);
    setCurrentStep(5);
  };

  const handleStudyDetailsComplete = () => {
    if (!selectedStudyMode && availableStudyModes.length > 0) {
      setSelectedStudyMode(availableStudyModes[0]);
    }
    if (!selectedCampus && availableCampuses.length > 0) {
      setSelectedCampus(availableCampuses[0]);
    }
    if (!selectedIntake && availableIntakes.length > 0) {
      setSelectedIntake(availableIntakes[0]);
    }
    setCurrentStep(6);
  };

  // Jump to specific step via [EDIT] button
  const handleEditStep = (step: StepKey) => {
    setCurrentStep(step);
  };

  // Finish and continue to Student Workplace
  const handleConfirmAndContinue = async () => {
    if (!selectedInstitution || !selectedProgramme) return;

    const academicSelection: StudentAcademicSelection = {
      institutionId: selectedInstitution.id,
      institutionName: selectedInstitution.name,
      institutionType: selectedInstitution.type,
      departmentId: selectedDepartment?.id || `${selectedInstitution.id}-dept`,
      departmentName: selectedDepartment?.name || selectedProgramme.department || 'Academic Department',
      programmeId: selectedProgramme.id,
      programmeName: selectedProgramme.name,
      programmeCode: selectedProgramme.code,
      courseLevel: selectedLevel || selectedProgramme.qualificationLevel || selectedProgramme.award || "Bachelor's Degree",
      studyMode: selectedStudyMode || 'Full Time',
      campusId: selectedCampus?.id,
      campusName: selectedCampus?.name || selectedInstitution.campuses[0]?.name || 'Main Campus',
      intake: selectedIntake || 'September 2026',
      duration: selectedProgramme.duration || `${selectedProgramme.durationYears} Years`,
      selectedAt: new Date().toISOString(),
    };

    // Save in localStorage for persistent session
    try {
      localStorage.setItem('learning_hub_selected_programme', JSON.stringify(academicSelection));
    } catch (e) {
      console.warn('Could not store to localStorage:', e);
    }

    // If authenticated, update user profile in Firestore directly
    if (currentUser && updateProfile) {
      try {
        await updateProfile({
          institutionId: academicSelection.institutionId,
          institutionName: academicSelection.institutionName,
          departmentId: academicSelection.departmentId,
          departmentName: academicSelection.departmentName,
          programmeId: academicSelection.programmeId,
          programmeName: academicSelection.programmeName,
          programmeCode: academicSelection.programmeCode,
          courseLevel: academicSelection.courseLevel,
          campusId: academicSelection.campusId,
          campusName: academicSelection.campusName,
        });
      } catch (err) {
        console.error('Failed to update user profile with programme:', err);
      }
    }

    // Call caller callback
    onContinueToWorkplace(academicSelection);
  };

  const countiesList = useMemo(() => ['All', ...getAllCounties()], []);

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-6 flex flex-col space-y-6">
      {/* 1. STUDENT START PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Guided Higher-Education Selection Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
            Find Your Programme
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Select your institution and academic programme to continue.
          </p>
        </div>

        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            className="self-start sm:self-auto px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-medium transition-all flex items-center space-x-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        )}
      </div>

      {/* VISUAL STEPPER (01 Institution -> 02 Department -> 03 Programme -> 04 Level -> 05 Study Details -> 06 Confirm) */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="flex items-center justify-between min-w-[700px] p-2 glass-panel rounded-2xl border border-white/10">
          {STEP_DEFINITIONS.map((s, idx) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            const canNavigate =
              s.step === 1 ||
              (s.step === 2 && selectedInstitution) ||
              (s.step === 3 && selectedDepartment) ||
              (s.step === 4 && selectedProgramme) ||
              (s.step === 5 && selectedLevel) ||
              (s.step === 6 && selectedStudyMode);

            return (
              <React.Fragment key={s.step}>
                <button
                  type="button"
                  disabled={!canNavigate}
                  onClick={() => canNavigate && setCurrentStep(s.step as StepKey)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-sky-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                      : isCompleted
                      ? 'text-emerald-400 hover:bg-white/5'
                      : 'text-slate-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono transition-all ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : isCompleted
                        ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
                        : 'bg-white/5 border border-white/10 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.number}
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Step {s.number}
                    </span>
                    <span
                      className={`text-xs font-bold block ${
                        isActive ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-400'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                </button>

                {idx < STEP_DEFINITIONS.length - 1 && (
                  <div className="w-6 h-[1px] bg-white/10 shrink-0 mx-1" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* MAIN WORKSPACE GRID: Left: Step Content, Right: Live Selection Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ACTIVE STEP CONTENT (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          {/* STEP 1: SELECT INSTITUTION */}
          {currentStep === 1 && (
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white font-heading">
                    Select Your Institution
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Filter by county or type to select from verified Universities, TVETs, KMTCs & Polytechnics.
                  </p>
                </div>

                <div className="text-xs text-cyan-400 font-mono">
                  {filteredInstitutions.length} institutions available
                </div>
              </div>

              {/* Filters Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Search */}
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={institutionSearch}
                    onChange={(e) => setInstitutionSearch(e.target.value)}
                    placeholder="Search by name, county, town..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs sm:text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                {/* County Filter */}
                <div className="sm:col-span-3">
                  <select
                    value={countyFilter}
                    onChange={(e) => setCountyFilter(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-slate-200 text-xs focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="All">All Counties (47)</option>
                    {countiesList
                      .filter((c) => c !== 'All')
                      .map((c) => (
                        <option key={c} value={c} className="bg-slate-900 text-white">
                          {c}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div className="sm:col-span-3">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-slate-200 text-xs focus:border-cyan-400 focus:outline-none"
                  >
                    {INSTITUTION_TYPE_CATEGORIES.map((t) => (
                      <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Institution Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[560px] overflow-y-auto pr-1">
                {filteredInstitutions.map((inst) => {
                  const isSelected = selectedInstitution?.id === inst.id;
                  const deptsCount =
                    inst.schools?.reduce((acc, s) => acc + (s.departments?.length || 0), 0) ||
                    inst.schools?.length ||
                    0;
                  const progsCount = inst.programmes?.length || 0;

                  return (
                    <div
                      key={inst.id}
                      onClick={() => handleSelectInstitution(inst)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400'
                          : 'bg-slate-900/60 border-white/10 hover:border-cyan-400/40 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <img
                          src={inst.logo}
                          alt={inst.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-white/10 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-cyan-300">
                              {inst.shortName || inst.type}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{inst.regulator || 'Verified'}</span>
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-white mt-1 leading-snug truncate">
                            {inst.name}
                          </h3>
                          <div className="flex items-center space-x-1.5 text-[11px] text-slate-300 mt-1">
                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                            <span className="truncate">{inst.county} County • {inst.campuses[0]?.town || inst.campuses[0]?.name || 'Main Campus'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <div className="text-[11px] text-slate-400">
                          <span className="text-slate-200 font-semibold">{deptsCount}</span> Departments • <span className="text-slate-200 font-semibold">{progsCount}</span> Programmes
                        </div>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950'
                              : 'bg-white/10 text-white hover:bg-cyan-500 hover:text-slate-950'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredInstitutions.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm font-semibold">No institutions match your search criteria.</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting the county or type filter.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT DEPARTMENT */}
          {currentStep === 2 && selectedInstitution && (
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2 text-xs text-cyan-400 mb-1">
                    <span>{selectedInstitution.name}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-slate-300">Departments Directory</span>
                  </div>
                  <h2 className="text-xl font-bold text-white font-heading">
                    Select Your Department
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Showing official departments registered strictly under {selectedInstitution.name}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAdminModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold transition-all flex items-center space-x-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Department (Admin)</span>
                </button>
              </div>

              {/* Search Departments */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={departmentSearch}
                  onChange={(e) => setDepartmentSearch(e.target.value)}
                  placeholder={`Search departments in ${selectedInstitution.shortName || selectedInstitution.name}...`}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs sm:text-sm focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Loading State */}
              {loadingDepartments && (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                  <p className="text-xs text-slate-400">Loading verified departments...</p>
                </div>
              )}

              {/* Departments Cards */}
              {!loadingDepartments && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[540px] overflow-y-auto pr-1">
                  {filteredDepartments.map((dept) => {
                    const isSelected = selectedDepartment?.id === dept.id;

                    return (
                      <div
                        key={dept.id}
                        onClick={() => handleSelectDepartment(dept)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400'
                            : 'bg-slate-900/60 border-white/10 hover:border-cyan-400/40 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            {dept.schoolName && (
                              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block truncate">
                                {dept.schoolName}
                              </span>
                            )}
                            <h3 className="text-sm font-bold text-white mt-0.5 leading-snug">
                              {dept.name}
                            </h3>
                            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                              {dept.description || 'Academic department with approved courses.'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                          <span className="text-xs font-semibold text-emerald-400">
                            Programmes available: {dept.programmesCount}
                          </span>
                          <button
                            type="button"
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-cyan-500 text-slate-950'
                                : 'bg-white/10 text-white hover:bg-cyan-500 hover:text-slate-950'
                            }`}
                          >
                            Select Department
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {filteredDepartments.length === 0 && (
                    <div className="col-span-full p-8 rounded-2xl bg-slate-900/40 border border-white/10 text-center space-y-4">
                      <School className="w-10 h-10 mx-auto text-slate-600" />
                      <div>
                        <h4 className="text-sm font-bold text-white">No departments currently configured in database</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                          There are no department records yet for {selectedInstitution.name}. Authorized administrators can add departments and programmes to the registry.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAdminModalOpen(true)}
                        className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all"
                      >
                        + Add Department as Administrator
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Back */}
              <div className="pt-2 flex justify-between items-center border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5 flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Institution</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SELECT PROGRAMME */}
          {currentStep === 3 && selectedInstitution && selectedDepartment && (
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2 text-xs text-cyan-400 mb-1">
                    <span>{selectedInstitution.name}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>{selectedDepartment.name}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white font-heading">
                    Select Your Programme
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Showing programmes linked strictly to {selectedDepartment.name}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAdminModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold transition-all flex items-center space-x-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Programme (Admin)</span>
                </button>
              </div>

              {/* Search Programme */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={programmeSearch}
                  onChange={(e) => setProgrammeSearch(e.target.value)}
                  placeholder="Search programmes by name or code..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs sm:text-sm focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Loading */}
              {loadingProgrammes && (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                  <p className="text-xs text-slate-400">Loading programmes for this department...</p>
                </div>
              )}

              {/* Programme Cards */}
              {!loadingProgrammes && (
                <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
                  {filteredProgrammes.map((prog) => {
                    const isSelected = selectedProgramme?.id === prog.id;
                    const reqStr =
                      typeof prog.entryRequirements === 'string'
                        ? prog.entryRequirements
                        : prog.entryRequirements?.minimumMeanGrade || 'Approved by Senate';

                    return (
                      <div
                        key={prog.id}
                        onClick={() => handleSelectProgramme(prog)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400'
                            : 'bg-slate-900/60 border-white/10 hover:border-cyan-400/40 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                                {prog.code || prog.programmeCode || 'COURSE'}
                              </span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                                {prog.level || prog.qualificationLevel || prog.award}
                              </span>
                              <span className="text-xs text-emerald-400 font-medium">
                                Active / Accredited
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-white mt-1.5">
                              {prog.name}
                            </h3>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-mono text-cyan-300 block">
                              Duration: {prog.duration || `${prog.durationYears} Years`}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {prog.academicPeriod || 'Semester'} system
                            </span>
                          </div>
                        </div>

                        {prog.overview && (
                          <p className="text-xs text-slate-300 mt-2.5 leading-relaxed line-clamp-2">
                            {prog.overview}
                          </p>
                        )}

                        <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
                          <div>
                            <span className="text-slate-500 block text-[11px]">Entry Requirements:</span>
                            <span className="text-slate-200 text-xs font-medium line-clamp-1">
                              {reqStr}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[11px]">Study Modes:</span>
                            <span className="text-slate-200 text-xs font-medium truncate">
                              {Array.isArray(prog.studyModes)
                                ? prog.studyModes.join(', ')
                                : Array.isArray(prog.modeOfStudy)
                                ? prog.modeOfStudy.join(', ')
                                : 'Full-time, Evening'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            Examining Body: <strong className="text-slate-200">{prog.examiningBody || 'Senate'}</strong>
                          </span>
                          <button
                            type="button"
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-cyan-500 text-slate-950'
                                : 'bg-white/10 text-white hover:bg-cyan-500 hover:text-slate-950'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select Programme'}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {filteredProgrammes.length === 0 && (
                    <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/10 text-center space-y-4">
                      <GraduationCap className="w-10 h-10 mx-auto text-slate-600" />
                      <div>
                        <h4 className="text-sm font-bold text-white">No programmes linked to this department</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                          There are no courses registered under {selectedDepartment.name} in the database yet. Authorized administrators can add new programmes now.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAdminModalOpen(true)}
                        className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all"
                      >
                        + Add Programme as Administrator
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Back */}
              <div className="pt-2 flex justify-between items-center border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5 flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Departments</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SELECT COURSE / PROGRAMME LEVEL */}
          {currentStep === 4 && selectedProgramme && (
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-6">
              <div>
                <div className="flex items-center space-x-2 text-xs text-cyan-400 mb-1">
                  <span>{selectedProgramme.name}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>Qualification Level</span>
                </div>
                <h2 className="text-xl font-bold text-white font-heading">
                  Select Your Course Level
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Only levels actually offered for {selectedProgramme.name} from database configuration are shown.
                </p>
              </div>

              {/* Course Level Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableLevels.map((lvl) => {
                  const isSelected = selectedLevel === lvl;
                  return (
                    <div
                      key={lvl}
                      onClick={() => handleSelectLevel(lvl)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400'
                          : 'bg-slate-900/60 border-white/10 hover:border-cyan-400/40 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 flex items-center justify-center shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{lvl}</h3>
                          <p className="text-xs text-slate-400 mt-1">
                            Accredited qualification tier for {selectedProgramme.code}.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          Duration: {selectedProgramme.duration || `${selectedProgramme.durationYears} Years`}
                        </span>
                        <button
                          type="button"
                          className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950'
                              : 'bg-white/10 text-white hover:bg-cyan-500 hover:text-slate-950'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select Level'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Back */}
              <div className="pt-2 flex justify-between items-center border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5 flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Programme</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: STUDY MODE, CAMPUS & INTAKE */}
          {currentStep === 5 && selectedProgramme && selectedLevel && (
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white font-heading">
                  Study Details & Campus
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Select your campus location, preferred study mode, and academic intake period.
                </p>
              </div>

              {/* Study Mode Section */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                  1. Select Study Mode
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableStudyModes.map((mode) => {
                    const isSelected = selectedStudyMode === mode;
                    return (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => setSelectedStudyMode(mode)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                            : 'bg-slate-950/60 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{mode}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Offered by programme</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campus Selection Section */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                    2. Select Campus
                  </label>
                  {availableCampuses.length === 1 && (
                    <span className="text-[11px] text-emerald-400 font-mono">
                      (Auto-selected: Sole Campus)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableCampuses.map((camp) => {
                    const isSelected = selectedCampus?.id === camp.id;
                    return (
                      <button
                        type="button"
                        key={camp.id}
                        onClick={() => setSelectedCampus(camp)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                            : 'bg-slate-950/60 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">{camp.name}</span>
                            <span className="text-[11px] text-slate-400 flex items-center space-x-1 mt-1">
                              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                              <span>{camp.town || camp.county} • {camp.address}</span>
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Intake Period Section */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                  3. Select Intake
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {availableIntakes.map((intake) => {
                    const isSelected = selectedIntake === intake;
                    return (
                      <button
                        type="button"
                        key={intake}
                        onClick={() => setSelectedIntake(intake)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                            : 'bg-slate-950/60 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{intake}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">Open for Enrollment</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Back & Next */}
              <div className="pt-4 flex justify-between items-center border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5 flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Level</span>
                </button>

                <button
                  type="button"
                  onClick={handleStudyDetailsComplete}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all flex items-center space-x-2"
                >
                  <span>Review & Confirm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: CONFIRM & CONTINUE TO STUDENT WORKPLACE */}
          {currentStep === 6 && selectedInstitution && selectedProgramme && (
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-6">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ready for Student Workplace</span>
                </div>
                <h2 className="text-xl font-bold text-white font-heading">
                  Confirm Your Academic Enrolment
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Confirm the academic path below to configure your learning hub dashboard, timetable, syllabus, and study resources.
                </p>
              </div>

              {/* Big Summary Card */}
              <div className="p-6 rounded-2xl bg-slate-950/70 border border-cyan-500/30 space-y-4">
                <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
                  <img
                    src={selectedInstitution.logo}
                    alt={selectedInstitution.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-white/10 bg-slate-800"
                  />
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                      {selectedInstitution.type} • {selectedInstitution.county} County
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {selectedInstitution.name}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Academic Department:</span>
                    <strong className="text-white font-semibold text-sm">
                      {selectedDepartment?.name || selectedProgramme.department}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Programme Name & Code:</span>
                    <strong className="text-white font-semibold text-sm">
                      {selectedProgramme.name} ({selectedProgramme.code})
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Qualification Level:</span>
                    <strong className="text-cyan-300 font-semibold text-sm">
                      {selectedLevel}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Study Mode:</span>
                    <strong className="text-white font-semibold text-sm">
                      {selectedStudyMode || 'Full Time'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Campus:</span>
                    <strong className="text-white font-semibold text-sm">
                      {selectedCampus?.name || selectedInstitution.campuses[0]?.name || 'Main Campus'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Enrolment Intake:</span>
                    <strong className="text-emerald-400 font-semibold text-sm">
                      {selectedIntake || 'September 2026'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5 flex items-center justify-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Modify Details</span>
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  {!currentUser && onSelectForRegister && (
                    <button
                      type="button"
                      onClick={() => {
                        const sel: StudentAcademicSelection = {
                          institutionId: selectedInstitution.id,
                          institutionName: selectedInstitution.name,
                          institutionType: selectedInstitution.type,
                          departmentId: selectedDepartment?.id || `${selectedInstitution.id}-dept`,
                          departmentName: selectedDepartment?.name || selectedProgramme.department,
                          programmeId: selectedProgramme.id,
                          programmeName: selectedProgramme.name,
                          programmeCode: selectedProgramme.code,
                          courseLevel: selectedLevel || "Bachelor's Degree",
                          studyMode: selectedStudyMode || 'Full Time',
                          campusId: selectedCampus?.id,
                          campusName: selectedCampus?.name || selectedInstitution.campuses[0]?.name,
                          intake: selectedIntake || 'September 2026',
                          duration: selectedProgramme.duration,
                          selectedAt: new Date().toISOString(),
                        };
                        onSelectForRegister(sel);
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs transition-all"
                    >
                      Register Account with this Programme
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleConfirmAndContinue}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(34,211,238,0.35)] transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Continue to Student Workplace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: 9. LIVE SELECTION SUMMARY PANEL (4 COLS) */}
        <div className="lg:col-span-4 sticky top-20 flex flex-col space-y-4">
          <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                YOUR SELECTION
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Live Hierarchy</span>
            </div>

            <div className="mt-4 space-y-4 divide-y divide-white/5">
              {/* Institution Row */}
              <div className="pt-2 first:pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Institution:</span>
                  {selectedInstitution && (
                    <button
                      type="button"
                      onClick={() => handleEditStep(1)}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>[EDIT]</span>
                    </button>
                  )}
                </div>
                <div className="text-xs font-bold text-white mt-1">
                  {selectedInstitution ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-cyan-300 truncate">{selectedInstitution.name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-500 italic">Not selected yet</span>
                  )}
                </div>
              </div>

              {/* Department Row */}
              <div className="pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Department:</span>
                  {selectedDepartment && (
                    <button
                      type="button"
                      onClick={() => handleEditStep(2)}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>[EDIT]</span>
                    </button>
                  )}
                </div>
                <div className="text-xs font-bold text-white mt-1">
                  {selectedDepartment ? (
                    <span className="text-cyan-300">{selectedDepartment.name}</span>
                  ) : (
                    <span className="text-slate-500 italic">
                      {selectedInstitution ? 'Pending choice' : 'Select institution first'}
                    </span>
                  )}
                </div>
              </div>

              {/* Programme Row */}
              <div className="pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Programme:</span>
                  {selectedProgramme && (
                    <button
                      type="button"
                      onClick={() => handleEditStep(3)}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>[EDIT]</span>
                    </button>
                  )}
                </div>
                <div className="text-xs font-bold text-white mt-1">
                  {selectedProgramme ? (
                    <span className="text-cyan-300">{selectedProgramme.name} ({selectedProgramme.code})</span>
                  ) : (
                    <span className="text-slate-500 italic">
                      {selectedDepartment ? 'Pending choice' : 'Select department first'}
                    </span>
                  )}
                </div>
              </div>

              {/* Level Row */}
              <div className="pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Level:</span>
                  {selectedLevel && (
                    <button
                      type="button"
                      onClick={() => handleEditStep(4)}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>[EDIT]</span>
                    </button>
                  )}
                </div>
                <div className="text-xs font-bold text-white mt-1">
                  {selectedLevel ? (
                    <span className="text-emerald-300">{selectedLevel}</span>
                  ) : (
                    <span className="text-slate-500 italic">Pending level</span>
                  )}
                </div>
              </div>

              {/* Study Mode Row */}
              <div className="pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Study Mode:</span>
                  {selectedStudyMode && (
                    <button
                      type="button"
                      onClick={() => handleEditStep(5)}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>[EDIT]</span>
                    </button>
                  )}
                </div>
                <div className="text-xs font-bold text-white mt-1">
                  {selectedStudyMode ? (
                    <span className="text-white">{selectedStudyMode}</span>
                  ) : (
                    <span className="text-slate-500 italic">Pending selection</span>
                  )}
                </div>
              </div>

              {/* Campus Row */}
              <div className="pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Campus:</span>
                  {selectedCampus && (
                    <button
                      type="button"
                      onClick={() => handleEditStep(5)}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>[EDIT]</span>
                    </button>
                  )}
                </div>
                <div className="text-xs font-bold text-white mt-1">
                  {selectedCampus ? (
                    <span className="text-white">{selectedCampus.name}</span>
                  ) : (
                    <span className="text-slate-500 italic">Pending selection</span>
                  )}
                </div>
              </div>

              {/* Intake Row */}
              <div className="pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Intake:</span>
                  {selectedIntake && (
                    <button
                      type="button"
                      onClick={() => handleEditStep(5)}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>[EDIT]</span>
                    </button>
                  )}
                </div>
                <div className="text-xs font-bold text-white mt-1">
                  {selectedIntake ? (
                    <span className="text-emerald-400 font-semibold">{selectedIntake}</span>
                  ) : (
                    <span className="text-slate-500 italic">Pending intake</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Button in Summary */}
            {selectedInstitution && selectedProgramme && currentStep < 6 && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center space-x-2"
                >
                  <span>Review Complete Selection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Real Database Guarantee Callout */}
          <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-400/20 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Real Database Verified Data</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every department, programme, and course level in this portal is linked strictly to the official database registry of accredited Kenyan institutions.
            </p>
          </div>
        </div>
      </div>

      {/* Admin Modal for adding departments / programmes */}
      {selectedInstitution && (
        <AddAcademicDataModal
          isOpen={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
          institution={selectedInstitution}
          preselectedDepartment={selectedDepartment}
          onDepartmentAdded={(newDept) => {
            setDepartments((prev) => [newDept, ...prev]);
            setSelectedDepartment(newDept);
            setCurrentStep(3);
          }}
          onProgrammeAdded={(newProg) => {
            setProgrammes((prev) => [newProg, ...prev]);
            setSelectedProgramme(newProg);
            setCurrentStep(4);
          }}
        />
      )}
    </div>
  );
};
