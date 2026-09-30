import React, { useState } from 'react';
import {
  Institution,
  DepartmentItem,
  AcademicProgramme,
  CourseLevel,
  StudyMode,
} from '../../types';
import {
  addCustomDepartment,
  addCustomProgramme,
} from '../../services/institutionService';
import {
  X,
  Building2,
  BookOpen,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

interface AddAcademicDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  institution: Institution;
  preselectedDepartment?: DepartmentItem | null;
  onDepartmentAdded?: (dept: DepartmentItem) => void;
  onProgrammeAdded?: (prog: AcademicProgramme) => void;
}

const AVAILABLE_COURSE_LEVELS: CourseLevel[] = [
  'Doctorate (PhD)',
  'Master Degree',
  'Postgraduate Diploma',
  'Bachelor Degree',
  'Higher Diploma',
  'Diploma (Level 6)',
  'Certificate (Level 5)',
  'Artisan (Level 4)',
  'Grade III / Vocational',
];

const AVAILABLE_STUDY_MODES: StudyMode[] = [
  'Full-time',
  'Part-time',
  'Evening',
  'Weekend',
  'Distance / Online',
  'Blended Learning',
];

export const AddAcademicDataModal: React.FC<AddAcademicDataModalProps> = ({
  isOpen,
  onClose,
  institution,
  preselectedDepartment,
  onDepartmentAdded,
  onProgrammeAdded,
}) => {
  const [activeTab, setActiveTab] = useState<'department' | 'programme'>(
    preselectedDepartment ? 'programme' : 'department'
  );

  // Department Form State
  const [deptName, setDeptName] = useState('');
  const [schoolName, setSchoolName] = useState(
    preselectedDepartment?.schoolName ||
      (institution.schools?.[0]?.name ? institution.schools[0].name : '')
  );
  const [deptDescription, setDeptDescription] = useState('');

  // Programme Form State
  const [progName, setProgName] = useState('');
  const [progCode, setProgCode] = useState('');
  const [targetDeptName, setTargetDeptName] = useState(
    preselectedDepartment?.name || ''
  );
  const [targetSchoolName, setTargetSchoolName] = useState(
    preselectedDepartment?.schoolName || institution.schools?.[0]?.name || ''
  );
  const [progLevel, setProgLevel] = useState<CourseLevel>('Bachelor Degree');
  const [durationYears, setDurationYears] = useState(4);
  const [selectedModes, setSelectedModes] = useState<StudyMode[]>([
    'Full-time',
    'Evening',
  ]);
  const [entryRequirements, setEntryRequirements] = useState('');
  const [progDescription, setProgDescription] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleMode = (m: StudyMode) => {
    setSelectedModes((prev) =>
      prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]
    );
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) {
      setErrorMsg('Please enter a department name.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const newDept = await addCustomDepartment(institution.id, {
        name: deptName.trim(),
        schoolName: schoolName.trim() || 'Faculty of Academic Affairs',
        description: deptDescription.trim(),
      });

      setSuccessMsg(`Department "${newDept.name}" added successfully.`);
      if (onDepartmentAdded) {
        onDepartmentAdded(newDept);
      }

      setDeptName('');
      setDeptDescription('');

      setTimeout(() => {
        setSuccessMsg(null);
        setActiveTab('programme');
        setTargetDeptName(newDept.name);
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save department. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progName.trim()) {
      setErrorMsg('Please enter programme name.');
      return;
    }
    if (!progCode.trim()) {
      setErrorMsg('Please enter programme code (e.g. BIT, BCOM, DIT).');
      return;
    }
    if (!targetDeptName.trim()) {
      setErrorMsg('Please enter or select a parent department.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const pId = `${institution.id}-${progCode.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

      const award = progLevel.includes('Doctor')
        ? 'Doctorate'
        : progLevel.includes('Master')
        ? 'Master'
        : progLevel.includes('Bachelor')
        ? 'Bachelor'
        : progLevel.includes('Higher')
        ? 'Higher Diploma'
        : progLevel.includes('Diploma')
        ? 'Diploma'
        : progLevel.includes('Certificate')
        ? 'Certificate'
        : progLevel.includes('Artisan')
        ? 'Artisan'
        : 'Vocational';

      const newProg: AcademicProgramme = {
        id: pId,
        programmeId: pId,
        institutionId: institution.id,
        institutionName: institution.name,
        name: progName.trim(),
        programmeName: progName.trim(),
        code: progCode.trim().toUpperCase(),
        programmeCode: progCode.trim().toUpperCase(),
        award,
        level: progLevel,
        qualificationLevel: progLevel,
        schoolId: `${institution.id}-school`,
        schoolName: targetSchoolName.trim() || 'Faculty of Academic Affairs',
        department: targetDeptName.trim(),
        duration: `${durationYears} Academic Years`,
        durationYears: durationYears,
        durationTermsOrSemesters: durationYears * 2,
        academicPeriod: 'Semester',
        modeOfStudy: selectedModes,
        studyModes: selectedModes,
        entryRequirements: entryRequirements.trim() || 'Institution Senate / Board verified minimum requirements',
        overview: progDescription.trim() || `Official academic programme offering registered under ${institution.name}.`,
        intakes: ['January', 'May', 'September'],
        cueAccredited: institution.regulator === 'CUE',
        tvetaAccredited: institution.regulator === 'TVETA',
      };

      await addCustomProgramme(newProg);

      setSuccessMsg(`Programme "${newProg.name}" configured and added to database.`);
      if (onProgrammeAdded) {
        onProgrammeAdded(newProg);
      }

      setProgName('');
      setProgCode('');
      setProgDescription('');
      setEntryRequirements('');

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save programme. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900/95 border border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.25)] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-heading">
                Registry Management & Custom Entries
              </h2>
              <p className="text-xs text-slate-300">
                Configure real academic database entries for <span className="text-cyan-400 font-semibold">{institution.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-slate-950/40">
          <button
            type="button"
            onClick={() => {
              setActiveTab('department');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 border-b-2 ${
              activeTab === 'department'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Add Department</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('programme');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 border-b-2 ${
              activeTab === 'programme'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Add Academic Programme</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/40 flex items-center space-x-3 text-emerald-300 text-xs">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-400/40 flex items-center space-x-3 text-rose-300 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'department' ? (
            <form onSubmit={handleSaveDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Department Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Department of Information Technology"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Parent Faculty / School
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. School of Computing and Applied Sciences"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Department Description
                </label>
                <textarea
                  value={deptDescription}
                  onChange={(e) => setDeptDescription(e.target.value)}
                  rows={3}
                  placeholder="Brief description of the department's mandate and disciplines..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none placeholder-slate-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Save Department</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSaveProgramme} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Programme Name <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={progName}
                    onChange={(e) => setProgName(e.target.value)}
                    placeholder="e.g. Bachelor of Information Technology"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none placeholder-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Programme Code <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={progCode}
                    onChange={(e) => setProgCode(e.target.value)}
                    placeholder="e.g. BIT or CS-201"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none placeholder-slate-500 uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Parent Department <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={targetDeptName}
                    onChange={(e) => setTargetDeptName(e.target.value)}
                    placeholder="e.g. Department of Information Technology"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none placeholder-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Course Level <span className="text-cyan-400">*</span>
                  </label>
                  <select
                    value={progLevel}
                    onChange={(e) => setProgLevel(e.target.value as CourseLevel)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none"
                  >
                    {AVAILABLE_COURSE_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl} className="bg-slate-900 text-white">
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Duration (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={durationYears}
                    onChange={(e) => setDurationYears(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    School / Faculty
                  </label>
                  <input
                    type="text"
                    value={targetSchoolName}
                    onChange={(e) => setTargetSchoolName(e.target.value)}
                    placeholder="e.g. School of Computing"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Available Study Modes
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_STUDY_MODES.map((mode) => {
                    const isSelected = selectedModes.includes(mode);
                    return (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => toggleMode(mode)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Entry Requirements
                </label>
                <input
                  type="text"
                  value={entryRequirements}
                  onChange={(e) => setEntryRequirements(e.target.value)}
                  placeholder="e.g. KCSE Mean Grade C+ with C+ in Mathematics & English"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Programme Description / Overview
                </label>
                <textarea
                  value={progDescription}
                  onChange={(e) => setProgDescription(e.target.value)}
                  rows={2}
                  placeholder="Overview of course curriculum and learning outcomes..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none placeholder-slate-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Save Programme</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
