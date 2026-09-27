import React, { useState } from 'react';
import { Institution, InstitutionType, InstitutionOwnership, RegulatorType, LicensingStatus } from '../../types';
import { addCustomInstitution, getAllCounties } from '../../services/institutionService';
import {
  X,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
  Save,
} from 'lucide-react';

interface InstitutionAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const InstitutionAdminModal: React.FC<InstitutionAdminModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [type, setType] = useState<InstitutionType>('TVET / Technical College');
  const [ownership, setOwnership] = useState<InstitutionOwnership>('Public');
  const [regulator, setRegulator] = useState<RegulatorType>('TVETA');
  const [licensingStatus, setLicensingStatus] = useState<LicensingStatus>('Registered and Licensed');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [county, setCounty] = useState('Nairobi');
  const [accreditation, setAccreditation] = useState('');
  const [source, setSource] = useState('TVET Authority Official Register');
  const [website, setWebsite] = useState('https://');
  const [phone, setPhone] = useState('+254 ');
  const [email, setEmail] = useState('');
  const [campusName, setCampusName] = useState('Main Campus');
  const [campusAddress, setCampusAddress] = useState('');
  const [departmentName, setDepartmentName] = useState('Department of Computing & ICT');
  const [courseName, setCourseName] = useState('Diploma in Information Communication Technology');
  const [courseLevel, setCourseLevel] = useState('Diploma (Level 6)');
  const [examiningBody, setExaminingBody] = useState('KNEC');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortName.trim()) {
      setError('Please provide institution name and short name.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const instId = shortName.toLowerCase().replace(/[^a-z0-9]/g, '') || `inst-${Date.now()}`;
    const campusId = `${instId}-main`;
    const schoolId = `${instId}-school-1`;
    const progId = `${instId}-prog-1`;

    const newInst: Institution = {
      id: instId,
      name: name.trim(),
      shortName: shortName.trim().toUpperCase(),
      type,
      ownership,
      regulator,
      licensingStatus,
      registrationNumber: registrationNumber.trim(),
      accreditation: accreditation.trim() || `${regulator} Licensed Tertiary Institution`,
      source: source.trim() || 'Administrator Verified Entry',
      lastVerifiedAt: new Date().toISOString(),
      logo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160&auto=format&fit=crop&q=80',
      badgeColor: 'border-cyan-400 bg-cyan-500/10 text-cyan-300',
      website: website.trim(),
      county: county.trim(),
      generalContacts: {
        phone: phone.trim(),
        email: email.trim(),
      },
      campuses: [
        {
          id: campusId,
          institutionId: instId,
          name: campusName.trim() || 'Main Campus',
          county: county.trim(),
          address: campusAddress.trim() || `${county}, Kenya`,
          coordinates: { lat: -1.286389, lng: 36.817223 },
          contacts: {
            phone: phone.trim(),
            email: email.trim(),
          },
          isMainCampus: true,
        },
      ],
      schools: [
        {
          id: schoolId,
          institutionId: instId,
          name: departmentName.trim(),
          departments: [departmentName.trim()],
        },
      ],
      programmes: [
        {
          id: progId,
          institutionId: instId,
          code: 'PROG-01',
          name: courseName.trim(),
          award: courseLevel.includes('Diploma') ? 'Diploma' : 'Certificate',
          level: courseLevel as any,
          examiningBody: examiningBody as any,
          schoolId,
          department: departmentName.trim(),
          durationYears: 3,
          tvetaAccredited: regulator === 'TVETA',
          cueAccredited: regulator === 'CUE',
        },
      ],
    };

    try {
      await addCustomInstitution(newInst);
      setSuccess(true);
      setTimeout(() => {
        if (onSaved) onSaved();
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Failed to add institution:', err);
      setError(err?.message || 'Failed to save institution record.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col glass-card border border-white/20 rounded-2xl shadow-2xl overflow-hidden bg-slate-950">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                Admin: Add & Verify Kenyan Tertiary Institution
              </h3>
              <p className="text-xs text-slate-400">
                Register a new TVET College, Polytechnic, or University into the platform directory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Institution successfully registered into the verified directory!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Full Institution Name <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kiambu National Polytechnic"
                className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Short Name / Acronym <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g. KNP"
                className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs focus:border-cyan-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Institution Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs"
              >
                <option value="TVET / Technical College">TVET / Technical College</option>
                <option value="National Polytechnic">National Polytechnic</option>
                <option value="University">University</option>
                <option value="University College">University College</option>
                <option value="Vocational Training Centre">Vocational Training Centre</option>
                <option value="Other Accredited Institution">Other Accredited Institution</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ownership</label>
              <select
                value={ownership}
                onChange={(e) => setOwnership(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs"
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Regulator</label>
              <select
                value={regulator}
                onChange={(e) => setRegulator(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs"
              >
                <option value="TVETA">TVETA</option>
                <option value="CUE">CUE</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Licensing Status</label>
              <select
                value={licensingStatus}
                onChange={(e) => setLicensingStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs"
              >
                <option value="Registered and Licensed">Registered and Licensed</option>
                <option value="Registered Only">Registered Only</option>
                <option value="Chartered">Chartered</option>
                <option value="Licensed">Licensed</option>
                <option value="Interim Authority">Interim Authority</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Registration / License Number
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g. TVETA/PUB/TVC/0055/2020"
                className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">County</label>
              <input
                type="text"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                placeholder="e.g. Kiambu, Kisumu, Nakuru"
                className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Data Source / Reference</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="TVET Authority Official Register"
                className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
              />
            </div>
          </div>

          {/* Initial Campus & Programme */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <span className="text-slate-300 font-bold block">Initial Campus & Academic Department</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Campus Name</label>
                <input
                  type="text"
                  value={campusName}
                  onChange={(e) => setCampusName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Department</label>
                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Sample Course Name</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Course Level</label>
                <select
                  value={courseLevel}
                  onChange={(e) => setCourseLevel(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-white/15 text-white text-xs"
                >
                  <option value="Diploma (Level 6)">Diploma (Level 6)</option>
                  <option value="Certificate (Level 5)">Certificate (Level 5)</option>
                  <option value="Artisan (Level 4)">Artisan (Level 4)</option>
                  <option value="Bachelor Degree">Bachelor Degree</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Examining Body</label>
                <select
                  value={examiningBody}
                  onChange={(e) => setExaminingBody(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-white/15 text-white text-xs"
                >
                  <option value="KNEC">KNEC</option>
                  <option value="TVET-CDACC">TVET-CDACC</option>
                  <option value="NITA">NITA</option>
                  <option value="KASNEB">KASNEB</option>
                  <option value="University Senate">University Senate</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save & Verify Institution</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
