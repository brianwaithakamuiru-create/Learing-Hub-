import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getInstitutionById,
  getCampusFacilities,
  getCampusServices,
  getCampusEvents,
  getCampusAnnouncements,
  getCampusClubs,
  getCampusSports,
} from '../../services/institutionService';
import {
  Campus,
  CampusFacility,
  CampusStudentService,
  CampusEvent,
  CampusAnnouncement,
  StudentClub,
  StudentSport,
  Institution,
} from '../../types';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Compass,
  Calendar,
  Users,
  Trophy,
  HeartHandshake,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

interface CampusHubProps {
  onNavigate: (route: string) => void;
}

export const CampusHubView: React.FC<CampusHubProps> = ({ onNavigate }) => {
  const { userProfile } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [currentCampus, setCurrentCampus] = useState<Campus | null>(null);
  const [facilities, setFacilities] = useState<CampusFacility[]>([]);
  const [services, setServices] = useState<CampusStudentService[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>([]);
  const [clubs, setClubs] = useState<StudentClub[]>([]);
  const [sports, setSports] = useState<StudentSport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCampusData = async () => {
      setLoading(true);
      try {
        const instId = userProfile?.institutionId || 'uon';
        const inst = await getInstitutionById(instId);
        setInstitution(inst);

        if (inst) {
          const userCampusId = userProfile?.campusId || inst.campuses[0]?.id;
          const campus = inst.campuses.find((c) => c.id === userCampusId) || inst.campuses[0] || null;
          setCurrentCampus(campus);

          const [facs, srvs, evts, anns, clbs, sprts] = await Promise.all([
            getCampusFacilities(instId, campus?.id),
            getCampusServices(instId, campus?.id),
            getCampusEvents(instId, campus?.id),
            getCampusAnnouncements(instId, campus?.id),
            getCampusClubs(instId, campus?.id),
            getCampusSports(instId, campus?.id),
          ]);

          setFacilities(facs);
          setServices(srvs);
          setEvents(evts);
          setAnnouncements(anns);
          setClubs(clbs);
          setSports(sprts);
        }
      } catch (err) {
        console.warn('Notice loading campus hub data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCampusData();
  }, [userProfile]);

  return (
    <div className="space-y-6">
      {/* Campus Hero Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{institution?.accreditation || 'Chartered Kenyan University'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-tight">
              {currentCampus?.name || 'Campus Hub'}
            </h1>
            <p className="text-slate-300 text-sm mt-1 flex items-center space-x-2">
              <span>{institution?.name}</span>
              <span>•</span>
              <span className="text-cyan-400">{currentCampus?.county} County</span>
            </p>
            <p className="text-slate-400 text-xs mt-2 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{currentCampus?.address || 'Official University Location'}</span>
            </p>
          </div>

          {/* Emergency & Official Contacts Pill */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col space-y-2 text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">
              Campus Direct Contacts
            </span>
            <div className="flex items-center space-x-2 text-slate-200">
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentCampus?.contacts.phone || '+254 20 491 0000'}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-200">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentCampus?.contacts.email || 'info@university.ac.ke'}</span>
            </div>
            {currentCampus?.contacts.emergency && (
              <div className="flex items-center space-x-2 text-rose-300 font-semibold pt-1 border-t border-white/10">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Emergency: {currentCampus.contacts.emergency}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Nav Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => onNavigate('/facilities')}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-400/30 text-left transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-cyan-300">{facilities.length}</span>
            </div>
            <span className="text-xs font-bold text-white block mt-2">Campus Facilities</span>
            <span className="text-[10px] text-slate-400 block">Libraries, Labs, Hubs</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/campus-map')}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-400/30 text-left transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-amber-300">Live</span>
            </div>
            <span className="text-xs font-bold text-white block mt-2">Interactive Map</span>
            <span className="text-[10px] text-slate-400 block">Buildings & Navigation</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/services')}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-400/30 text-left transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-emerald-300">{services.length}</span>
            </div>
            <span className="text-xs font-bold text-white block mt-2">Student Services</span>
            <span className="text-[10px] text-slate-400 block">Dean, Health, HELB</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/events')}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-400/30 text-left transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-mono font-bold text-sky-300">{events.length}</span>
            </div>
            <span className="text-xs font-bold text-white block mt-2">Campus Events</span>
            <span className="text-[10px] text-slate-400 block">Academic & Activities</span>
          </button>
        </div>
      </div>

      {/* Grid: Official Announcements & Important Offices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Official Campus Notices */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-heading">
              Official Campus Announcements
            </h3>
            <span className="text-[11px] text-cyan-400 font-mono">
              {announcements.length} Verified Notices
            </span>
          </div>

          {announcements.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-2xl border border-white/10">
              <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400">
                No active announcements published for this campus today.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="glass-panel p-4 rounded-xl border border-white/10 hover:border-cyan-400/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-400/30">
                      {ann.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{ann.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{ann.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{ann.content}</p>
                  <div className="mt-2 text-[10px] text-slate-400 font-mono">
                    Issued by: {ann.issuedBy}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Important Campus Offices & Support */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white font-heading">
            Important Offices & Desks
          </h3>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
            {services.slice(0, 4).map((s) => (
              <div key={s.id} className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs font-bold text-white block">{s.name}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Building: {s.building} {s.room ? `• ${s.room}` : ''}
                </span>
                <div className="mt-2 flex items-center justify-between text-[10px] text-cyan-300">
                  <span>{s.hours}</span>
                  <a href={`tel:${s.contact}`} className="hover:underline">
                    {s.contact}
                  </a>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => onNavigate('/services')}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-cyan-400 text-center block cursor-pointer transition-colors"
            >
              View All Campus Services →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
