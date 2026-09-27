import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth, mapFirebaseAuthError } from '../../context/AuthContext';
import {
  ALL_KENYAN_INSTITUTIONS,
  searchInstitutions,
  getUnitsForStudent,
} from '../../services/institutionService';
import { COMPREHENSIVE_KENYAN_PROGRAMMES } from '../../services/programmesCatalogueData';
import {
  Institution,
  InstitutionType,
  Campus,
  SchoolFaculty,
  AcademicProgramme,
  ProgrammeUnit,
  CourseLevel,
  ExaminingBody,
} from '../../types';
import {
  Building2,
  MapPin,
  GraduationCap,
  BookOpen,
  Calendar,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ShieldCheck,
  Check,
  Hash,
  Phone,
  Sparkles,
  School,
  Layers,
  Award,
  Scale,
} from 'lucide-react';

interface RegisterFormProps {
  initialEmail?: string;
  initialInstitution?: Institution | null;
  initialProgramme?: AcademicProgramme | null;
  onSuccess: (fullName: string) => void;
  onSwitchToLogin: (email?: string) => void;
  onForgotPassword?: (email?: string) => void;
  onOpenDiscovery?: () => void;
  onOpenProgrammeDiscovery?: () => void;
}

const INSTITUTION_TYPES: Array<InstitutionType | 'All'> = [
  'All',
  'University',
  'University College',
  'TVET / Technical College',
  'National Polytechnic',
  'Vocational Training Centre',
  'Other Accredited Institution',
];

export const RegisterForm: React.FC<RegisterFormProps> = ({
  initialEmail = '',
  initialInstitution = null,
  initialProgramme = null,
  onSuccess,
  onSwitchToLogin,
  onOpenDiscovery,
  onOpenProgrammeDiscovery,
}) => {
  const { registerUser } = useAuth();

  // Wizard Stage: 1 = Institution & Campus, 2 = Academic Course & Stage, 3 = Student Credentials
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // STEP 1: Institution Search & Filters
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<InstitutionType | 'All'>('All');
  const [institutionQuery, setInstitutionQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(initialInstitution);
  const [showInstDropdown, setShowInstDropdown] = useState(false);
  const instInputRef = useRef<HTMLInputElement>(null);

  // Campus Selection
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);

  // STEP 2: Academic Department, Course & Stage
  const [selectedSchool, setSelectedSchool] = useState<SchoolFaculty | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [courseQuery, setCourseQuery] = useState('');
  const [selectedProgramme, setSelectedProgramme] = useState<AcademicProgramme | null>(null);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

  // Auto-populated fields
  const [courseLevel, setCourseLevel] = useState<string>('Diploma (Level 6)');
  const [examiningBody, setExaminingBody] = useState<string>('KNEC');
  const [stageOrYear, setStageOrYear] = useState<string>('Year 1 / Module 1');
  const [termOrSemester, setTermOrSemester] = useState<string>('Term 1');
  const [academicYear, setAcademicYear] = useState('2026/2027');

  // Preview of automatically loaded units
  const [loadedUnits, setLoadedUnits] = useState<ProgrammeUnit[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);

  // STEP 3: Student Credentials
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [studentEmail, setStudentEmail] = useState(initialEmail);
  const [personalEmail, setPersonalEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Detect whether selected institution is TVET / Polytechnic / Vocational or University
  const isTVET = useMemo(() => {
    if (!selectedInstitution) return false;
    const t = selectedInstitution.type.toLowerCase();
    return (
      t.includes('tvet') ||
      t.includes('polytechnic') ||
      t.includes('technical') ||
      t.includes('vocational') ||
      selectedInstitution.regulator === 'TVETA'
    );
  }, [selectedInstitution]);

  // Initial institution setup if provided via props
  useEffect(() => {
    if (initialInstitution) {
      handleSelectInstitution(initialInstitution);
    }
  }, [initialInstitution]);

  // Initial programme setup if provided via props
  useEffect(() => {
    if (initialProgramme) {
      const inst = ALL_KENYAN_INSTITUTIONS.find(
        (i) => i.id.toLowerCase() === initialProgramme.institutionId.toLowerCase()
      );
      if (inst) {
        handleSelectInstitution(inst);
        handleSelectProgramme(initialProgramme);
        setCurrentStep(2);
      }
    }
  }, [initialProgramme]);

  // Filter institutions based on search query and type filter
  const matchingInstitutions = useMemo(() => {
    let list = ALL_KENYAN_INSTITUTIONS;

    if (selectedTypeFilter !== 'All') {
      list = list.filter((inst) => {
        if (selectedTypeFilter === 'University') {
          return inst.type === 'University' || (inst.type.includes('University') && inst.type !== 'University College');
        }
        return inst.type.toLowerCase() === selectedTypeFilter.toLowerCase();
      });
    }

    if (!institutionQuery.trim()) {
      return list;
    }

    const q = institutionQuery.toLowerCase().trim();
    return list.filter(
      (inst) =>
        inst.name.toLowerCase().includes(q) ||
        inst.shortName.toLowerCase().includes(q) ||
        inst.county.toLowerCase().includes(q) ||
        inst.type.toLowerCase().includes(q) ||
        inst.campuses.some((c) => c.name.toLowerCase().includes(q) || (c.town && c.town.toLowerCase().includes(q)))
    );
  }, [institutionQuery, selectedTypeFilter]);

  // When an institution is chosen
  const handleSelectInstitution = (inst: Institution) => {
    setSelectedInstitution(inst);
    setInstitutionQuery(inst.name);
    setShowInstDropdown(false);

    // Auto-select main campus
    const mainCampus = inst.campuses.find((c) => c.isMainCampus) || inst.campuses[0] || null;
    setSelectedCampus(mainCampus);

    // Auto-select first school/department if available
    const firstSchool = inst.schools[0] || null;
    setSelectedSchool(firstSchool);
    if (firstSchool && firstSchool.departments.length > 0) {
      setSelectedDepartment(firstSchool.departments[0]);
    } else {
      setSelectedDepartment('');
    }

    // Reset programme
    setSelectedProgramme(null);
    setCourseQuery('');
    setLoadedUnits([]);

    // Set sensible default periods based on institution type
    const isTvetInst =
      inst.type.includes('TVET') ||
      inst.type.includes('Polytechnic') ||
      inst.type.includes('Vocational') ||
      inst.regulator === 'TVETA';

    if (isTvetInst) {
      setStageOrYear('Module 1');
      setTermOrSemester('Term 1');
      setCourseLevel('Diploma (Level 6)');
      setExaminingBody('KNEC');
    } else {
      setStageOrYear('Year 1');
      setTermOrSemester('Semester 1');
      setCourseLevel('Bachelor Degree');
      setExaminingBody('University Senate');
    }
  };

  // Filter programmes for the selected institution (Strict isolation: only this institution's courses)
  const matchingProgrammes = useMemo(() => {
    if (!selectedInstitution) return [];

    // Combine verified programmes and enriched master catalogue records for this institution
    const catalogProgs = COMPREHENSIVE_KENYAN_PROGRAMMES.filter(
      (p) => p.institutionId.toLowerCase() === selectedInstitution.id.toLowerCase()
    );
    const map = new Map<string, AcademicProgramme>();
    selectedInstitution.programmes.forEach((p) => map.set(p.id, p));
    catalogProgs.forEach((cp) => map.set(cp.id, { ...map.get(cp.id), ...cp }));
    let progs = Array.from(map.values());

    // Filter by School / Faculty
    if (selectedSchool) {
      progs = progs.filter((p) => p.schoolId === selectedSchool.id);
    }

    // Filter by Department if selected
    if (selectedDepartment) {
      progs = progs.filter(
        (p) =>
          !p.department ||
          p.department.toLowerCase() === selectedDepartment.toLowerCase() ||
          p.department.toLowerCase().includes(selectedDepartment.toLowerCase())
      );
    }

    if (!courseQuery.trim()) {
      return progs;
    }
    const q = courseQuery.toLowerCase().trim();
    return progs.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.programmeName && p.programmeName.toLowerCase().includes(q)) ||
        (p.field && p.field.toLowerCase().includes(q)) ||
        p.department.toLowerCase().includes(q)
    );
  }, [selectedInstitution, selectedSchool, selectedDepartment, courseQuery]);

  // When course / programme is chosen
  const handleSelectProgramme = (prog: AcademicProgramme) => {
    setSelectedProgramme(prog);
    setCourseQuery(prog.name);
    setShowCourseDropdown(false);

    // Smart autofill department
    if (prog.department) {
      setSelectedDepartment(prog.department);
    }

    // Smart autofill level and examining body
    if (prog.level) {
      setCourseLevel(prog.level);
    } else if (prog.qualificationLevel) {
      setCourseLevel(prog.qualificationLevel);
    } else if (prog.award) {
      setCourseLevel(prog.award);
    }

    if (prog.examiningBody) {
      setExaminingBody(prog.examiningBody);
    }

    // Smart autofill academic calendar structure
    if (prog.academicPeriod === 'Term' || prog.academicPeriod === 'Modular CBET') {
      setStageOrYear('Module 1');
      setTermOrSemester('Term 1');
    } else if (prog.academicPeriod === 'Semester') {
      setStageOrYear('Year 1');
      setTermOrSemester('Semester 1');
    }

    // Auto-load curriculum units
    loadUnits(prog.id, stageOrYear, termOrSemester);
  };

  // Load units for the selected combination
  const loadUnits = async (progId: string, stage: string, term: string) => {
    if (!selectedInstitution || !progId) return;
    setIsLoadingUnits(true);
    try {
      const units = await getUnitsForStudent(
        selectedInstitution.id,
        progId,
        stage,
        term
      );
      setLoadedUnits(units);
    } catch (err) {
      console.warn('Notice loading units:', err);
    } finally {
      setIsLoadingUnits(false);
    }
  };

  // Re-fetch units when stage or term changes
  useEffect(() => {
    if (selectedProgramme) {
      loadUnits(selectedProgramme.id, stageOrYear, termOrSemester);
    }
  }, [stageOrYear, termOrSemester]);

  // Validation
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!selectedInstitution) {
      errors.institution = 'Please search and select your Kenyan institution.';
    }
    if (!selectedCampus) {
      errors.campus = 'Please select your campus or centre of study.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!selectedDepartment && !selectedSchool) {
      errors.department = isTVET ? 'Please select your department.' : 'Please select your school / faculty.';
    }
    if (!selectedProgramme) {
      errors.programme = isTVET ? 'Please select your TVET course.' : 'Please select your academic programme.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!registrationNumber.trim()) {
      errors.registrationNumber = 'Registration Number is required (e.g. DICT/2024/042 or P15/1234/2023).';
    }
    if (!fullName.trim() || fullName.trim().length < 3) {
      errors.fullName = 'Full legal student name is required.';
    }
    if (!username.trim() || username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    } else if (!/^[a-z0-9_]+$/.test(username.toLowerCase())) {
      errors.username = 'Username can only contain lowercase letters, numbers, and underscores.';
    }
    if (!studentEmail.trim()) {
      errors.studentEmail = 'Student email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail.trim())) {
      errors.studentEmail = 'Please enter a valid email format.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;
    if (!selectedInstitution || !selectedCampus || !selectedProgramme) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      await registerUser({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: studentEmail.trim().toLowerCase(),
        password,
        country: 'Kenya',
        institutionId: selectedInstitution.id,
        institutionName: selectedInstitution.name,
        institutionType: selectedInstitution.type,
        regulator: selectedInstitution.regulator || 'CUE',
        campusId: selectedCampus.id,
        campusName: selectedCampus.name,
        schoolId: selectedSchool?.id || '',
        schoolName: selectedSchool?.name || '',
        departmentId: selectedDepartment || '',
        departmentName: selectedDepartment || '',
        programmeId: selectedProgramme.id,
        programmeName: selectedProgramme.name,
        programmeCode: selectedProgramme.code,
        courseLevel,
        examiningBody,
        stageOrYear,
        yearOfStudy: stageOrYear,
        academicYear,
        semester: termOrSemester,
        registrationNumber: registrationNumber.trim(),
        studentEmail: studentEmail.trim().toLowerCase(),
        personalEmail: personalEmail.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
      });

      onSuccess(fullName.trim());
    } catch (err: any) {
      console.error('Registration failed:', err);
      setFormError(mapFirebaseAuthError(err));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Wizard Header Progress */}
      <div className="mb-6">
        <div className="text-center mb-4">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold block mb-1">
            MY LEARNING HUB • KENYA TERTIARY WORKSPACE
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
            {currentStep === 1 && 'Where do you study?'}
            {currentStep === 2 && (isTVET ? 'Your TVET Course & Stage' : 'Your Academic Programme & Year')}
            {currentStep === 3 && 'Student Credentials & Access'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {currentStep === 1 && 'Select your university, polytechnic, technical college, or vocational centre'}
            {currentStep === 2 && 'Automatically loads verified curriculum units and campus facilities'}
            {currentStep === 3 && 'Create your secure account to access your digital workspace'}
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center space-x-2">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : selectedInstitution
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-400/30'
                : 'bg-white/5 text-slate-400 border border-white/10'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[11px]">
              1
            </span>
            <span>Institution</span>
          </button>

          <div className="w-4 h-0.5 bg-white/10" />

          <button
            type="button"
            onClick={() => {
              if (validateStep1()) setCurrentStep(2);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : selectedProgramme
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-400/30'
                : 'bg-white/5 text-slate-400 border border-white/10'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[11px]">
              2
            </span>
            <span>{isTVET ? 'Course & Stage' : 'Programme'}</span>
          </button>

          <div className="w-4 h-0.5 bg-white/10" />

          <button
            type="button"
            onClick={() => {
              if (validateStep1() && validateStep2()) setCurrentStep(3);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentStep === 3
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'bg-white/5 text-slate-400 border border-white/10'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[11px]">
              3
            </span>
            <span>Credentials</span>
          </button>
        </div>
      </div>

      {formError && (
        <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{formError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: INSTITUTION & CAMPUS (UNIVERSITIES & TVETS ACROSS KENYA)          */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Search Box */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Search Your Institution <span className="text-cyan-400">*</span>
              </label>
              {onOpenDiscovery && (
                <button
                  type="button"
                  onClick={onOpenDiscovery}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
                >
                  <Search className="w-3 h-3" />
                  <span>Browse Full Directory</span>
                </button>
              )}
            </div>

            <div className="relative">
              <Building2 className="w-4 h-4 text-cyan-400 absolute left-3 top-3.5" />
              <input
                ref={instInputRef}
                type="text"
                value={institutionQuery}
                onChange={(e) => {
                  setInstitutionQuery(e.target.value);
                  setShowInstDropdown(true);
                  if (selectedInstitution && selectedInstitution.name !== e.target.value) {
                    setSelectedInstitution(null);
                    setSelectedCampus(null);
                  }
                }}
                onFocus={() => setShowInstDropdown(true)}
                placeholder="Search your institution e.g. 'Kenyatta', 'Thika', 'Kisumu', 'Kabete'..."
                className="w-full pl-9 pr-8 py-3 rounded-xl glass-input text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>

            {/* Dropdown Results */}
            {showInstDropdown && matchingInstitutions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto glass-panel border border-white/20 rounded-xl z-50 shadow-2xl p-1.5 divide-y divide-white/5 bg-slate-950">
                {matchingInstitutions.map((inst) => (
                  <div
                    key={inst.id}
                    onClick={() => handleSelectInstitution(inst)}
                    className="p-2.5 rounded-lg hover:bg-cyan-500/10 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-cyan-300">
                        {inst.shortName}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {inst.name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                          <span>{inst.type}</span>
                          <span>•</span>
                          <span>{inst.county} County</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 shrink-0">
                      {inst.regulator || 'Verified'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {fieldErrors.institution && (
              <p className="text-rose-400 text-[11px] mt-1">{fieldErrors.institution}</p>
            )}
          </div>

          {/* Institution Type Filter Buttons / Radios */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Filter By Institution Type:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {INSTITUTION_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTypeFilter(t)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedTypeFilter === t
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Institution Card */}
          {selectedInstitution && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-base">
                  {selectedInstitution.shortName}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-heading">
                    {selectedInstitution.name}
                  </h4>
                  <div className="text-xs text-cyan-300 flex items-center space-x-1.5 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedInstitution.licensingStatus || 'Registered and Licensed'}</span>
                    <span>•</span>
                    <span className="text-slate-300">{selectedInstitution.regulator} Accredited</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Main County</span>
                <span className="text-xs font-semibold text-slate-200">{selectedInstitution.county}</span>
              </div>
            </div>
          )}

          {/* Campus / Centre Selection */}
          {selectedInstitution && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Your Campus or Centre <span className="text-cyan-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedInstitution.campuses.map((campus) => (
                  <button
                    key={campus.id}
                    type="button"
                    onClick={() => setSelectedCampus(campus)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedCampus?.id === campus.id
                        ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-lg'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{campus.name}</span>
                      {selectedCampus?.id === campus.id && (
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{campus.address}</p>
                  </button>
                ))}
              </div>
              {fieldErrors.campus && (
                <p className="text-rose-400 text-[11px] mt-1">{fieldErrors.campus}</p>
              )}
            </div>
          )}

          {/* Next Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setCurrentStep(2);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Continue to Course & Academic Level</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: ACADEMIC PROGRAMME / TVET COURSE, LEVEL, EXAMINING BODY & STAGE   */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* School / Faculty Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {isTVET ? '1. Select Department / Section' : '1. Select School / Faculty'} <span className="text-cyan-400">*</span>
              </label>
              {onOpenProgrammeDiscovery && (
                <button
                  type="button"
                  onClick={onOpenProgrammeDiscovery}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 underline cursor-pointer"
                >
                  <Search className="w-3 h-3" />
                  <span>Browse National Course Catalogue</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedInstitution?.schools.map((school) => (
                <button
                  key={school.id}
                  type="button"
                  onClick={() => {
                    setSelectedSchool(school);
                    if (school.departments.length > 0) {
                      setSelectedDepartment(school.departments[0]);
                    } else {
                      setSelectedDepartment('');
                    }
                    setSelectedProgramme(null);
                    setCourseQuery('');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedSchool?.id === school.id
                      ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-md'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-bold">{school.name}</div>
                  {school.departments.length > 0 && (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {school.departments.length} department(s)
                    </div>
                  )}
                </button>
              ))}
            </div>
            {fieldErrors.department && (
              <p className="text-rose-400 text-[11px] mt-1">{fieldErrors.department}</p>
            )}
          </div>

          {/* Department Selection (if school has multiple departments) */}
          {selectedSchool && selectedSchool.departments.length > 1 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                2. Select Specific Department <span className="text-cyan-400">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDepartment('');
                    setSelectedProgramme(null);
                    setCourseQuery('');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    !selectedDepartment
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  All in {selectedSchool.code || 'Faculty'}
                </button>
                {selectedSchool.departments.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setSelectedProgramme(null);
                      setCourseQuery('');
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      selectedDepartment === dept
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Course Search & Autocomplete */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {isTVET ? '3. Select TVET Course' : '3. Select Academic Programme'}{' '}
                <span className="text-cyan-400">*</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {matchingProgrammes.length} available for {selectedInstitution?.shortName}
              </span>
            </div>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-emerald-400 absolute left-3 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={courseQuery}
                onChange={(e) => {
                  setCourseQuery(e.target.value);
                  setShowCourseDropdown(true);
                }}
                onFocus={() => setShowCourseDropdown(true)}
                placeholder={
                  isTVET
                    ? "Type to search e.g. 'Information Communication Technology', 'Electrical', 'Automotive'..."
                    : "Type to search e.g. 'Computer Science', 'Commerce', 'Civil Engineering', 'Law'..."
                }
                className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Course dropdown */}
            {showCourseDropdown && matchingProgrammes.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto glass-panel border border-white/20 rounded-xl z-50 shadow-2xl p-1.5 divide-y divide-white/5 bg-slate-950">
                {matchingProgrammes.map((prog) => (
                  <div
                    key={prog.id}
                    onClick={() => handleSelectProgramme(prog)}
                    className="p-2.5 rounded-lg hover:bg-emerald-500/10 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{prog.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span className="font-mono text-cyan-300">{prog.code}</span>
                        <span>•</span>
                        <span>{prog.department}</span>
                        {prog.duration && <span>• {prog.duration}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                        {prog.award || prog.level}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold">
                        {prog.examiningBody || 'Senate'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {fieldErrors.programme && (
              <p className="text-rose-400 text-[11px] mt-1">{fieldErrors.programme}</p>
            )}
          </div>

          {/* Auto-populated Course Attributes (Level & Examining Body) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                Course Level (Auto-populated):
              </label>
              <select
                value={courseLevel}
                onChange={(e) => setCourseLevel(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-white/15 text-slate-200 text-xs focus:border-cyan-400"
              >
                <option value="Diploma (Level 6)">Diploma (Level 6)</option>
                <option value="Certificate (Level 5)">Certificate (Level 5)</option>
                <option value="Artisan (Level 4)">Artisan (Level 4)</option>
                <option value="Bachelor Degree">Bachelor Degree</option>
                <option value="Master Degree">Master Degree</option>
                <option value="Doctorate (PhD)">Doctorate (PhD)</option>
                <option value="Higher Diploma">Higher Diploma</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                Examining Body (Auto-populated):
              </label>
              <select
                value={examiningBody}
                onChange={(e) => setExaminingBody(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-white/15 text-slate-200 text-xs focus:border-cyan-400"
              >
                <option value="KNEC">KNEC (Kenya National Examinations Council)</option>
                <option value="TVET-CDACC">TVET-CDACC (Curriculum Dev & Assessment)</option>
                <option value="University Senate">University Senate</option>
                <option value="NITA">NITA (National Industrial Training Authority)</option>
                <option value="KASNEB">KASNEB (Professional Accountants / ICT)</option>
                <option value="Other">Other Statutory Board</option>
              </select>
            </div>
          </div>

          {/* Stage / Year of Study and Term / Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isTVET ? '3. Stage / Module / Year' : '3. Year of Study'}
              </label>
              <select
                value={stageOrYear}
                onChange={(e) => setStageOrYear(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:border-cyan-400"
              >
                {isTVET ? (
                  <>
                    <option value="Module 1">Module 1 (First Stage)</option>
                    <option value="Module 2">Module 2 (Intermediate)</option>
                    <option value="Module 3">Module 3 (Final Stage)</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                  </>
                ) : (
                  <>
                    <option value="Year 1">Year 1 (Freshman)</option>
                    <option value="Year 2">Year 2 (Sophomore)</option>
                    <option value="Year 3">Year 3 (Junior)</option>
                    <option value="Year 4">Year 4 (Senior)</option>
                    <option value="Year 5">Year 5 (Professional / Engineering)</option>
                    <option value="Year 6">Year 6 (Medicine)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isTVET ? '4. Term / Period' : '4. Semester / Period'}
              </label>
              <select
                value={termOrSemester}
                onChange={(e) => setTermOrSemester(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:border-cyan-400"
              >
                {isTVET ? (
                  <>
                    <option value="Term 1">Term 1 (Jan - April)</option>
                    <option value="Term 2">Term 2 (May - August)</option>
                    <option value="Term 3">Term 3 (Sept - December)</option>
                  </>
                ) : (
                  <>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Trimester 1">Trimester 1</option>
                    <option value="Trimester 2">Trimester 2</option>
                    <option value="Trimester 3">Trimester 3</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Automatically loaded verified units preview */}
          {selectedProgramme && (
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-400/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Automatically Loaded Curriculum Units:</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {loadedUnits.length} verified units
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                {loadedUnits.map((u) => (
                  <div
                    key={u.id}
                    className="p-2 rounded-lg bg-black/40 border border-white/5 text-[11px] text-slate-200 truncate"
                  >
                    <span className="text-cyan-400 font-mono font-bold">{u.code}:</span>{' '}
                    <span>{u.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateStep2()) setCurrentStep(3);
              }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Continue to Student Credentials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: STUDENT REGISTRATION CREDENTIALS & SECURITY                       */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-200">
          {/* Summary Card */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-cyan-300 font-bold block">{selectedInstitution?.shortName} • {selectedCampus?.name}</span>
              <span className="text-slate-400 text-[11px]">{selectedProgramme?.name} ({courseLevel})</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
              {examiningBody}
            </span>
          </div>

          {/* Student Reg Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Student / Registration Number <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder={isTVET ? 'e.g. DICT/2024/0042' : 'e.g. P15/1234/2023'}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white focus:border-cyan-400"
                required
              />
            </div>
            {fieldErrors.registrationNumber && (
              <p className="text-rose-400 text-[11px] mt-1">{fieldErrors.registrationNumber}</p>
            )}
          </div>

          {/* Full Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Legal Name <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Brian Waithaka"
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white focus:border-cyan-400"
                required
              />
              {fieldErrors.fullName && (
                <p className="text-rose-400 text-[11px] mt-1">{fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Username <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="e.g. brian_w"
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white focus:border-cyan-400"
                required
              />
              {fieldErrors.username && (
                <p className="text-rose-400 text-[11px] mt-1">{fieldErrors.username}</p>
              )}
            </div>
          </div>

          {/* Student Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student / Primary Email <span className="text-cyan-400">*</span>
              </label>
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@institution.ac.ke"
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white focus:border-cyan-400"
                required
              />
              {fieldErrors.studentEmail && (
                <p className="text-rose-400 text-[11px] mt-1">{fieldErrors.studentEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+254 700 000 000"
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full pl-3 pr-8 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white focus:border-cyan-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-rose-400 text-[11px] mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm Password <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-3 pr-8 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white focus:border-cyan-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-3 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-rose-400 text-[11px] mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Setting Up Workspace...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Complete Registration & Open Hub</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Switch to login */}
      <div className="mt-5 text-center text-xs text-slate-400">
        Already registered with your Kenyan institution?{' '}
        <button
          type="button"
          onClick={() => onSwitchToLogin(studentEmail)}
          className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
        >
          Sign In Here
        </button>
      </div>
    </div>
  );
};
