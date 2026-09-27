import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getCampusEvents,
  getCampusClubs,
  getCampusSports,
  getCampusServices,
} from '../../services/institutionService';
import {
  CampusEvent,
  StudentClub,
  StudentSport,
  CampusStudentService,
} from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  HeartHandshake,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  Tag,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface SubPageProps {
  onNavigate?: (route: string) => void;
}

// =========================================================================
// 1. CAMPUS EVENTS VIEW
// =========================================================================
export const CampusEventsView: React.FC<SubPageProps> = () => {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const instId = userProfile?.institutionId || 'uon';
        const campusId = userProfile?.campusId;
        const list = await getCampusEvents(instId, campusId);
        setEvents(list);
      } catch (err) {
        console.warn('Notice loading campus events:', err);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, [userProfile]);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
          <Calendar className="w-4 h-4" />
          <span>{userProfile?.campusName || 'Campus'} Schedule</span>
        </div>
        <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
          Campus Events & Academic Calendar
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
          Official orientations, career fairs, faculty symposia, and university celebrations.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading campus events...</div>
      ) : events.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-white/10 text-slate-400 text-xs">
          No campus events published for your selected campus at this time.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 uppercase tracking-wider">
                    {event.category}
                  </span>
                  <span className="text-xs font-mono text-slate-300 flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-cyan-400" />
                    <span>{event.date}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-white font-heading mt-1">
                  {event.title}
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {event.description}
                </p>

                <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-slate-200">{event.venue}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400">
                Organized by: <span className="text-slate-300 font-semibold">{event.organizer}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 2. CLUBS & SOCIETIES VIEW
// =========================================================================
export const CampusClubsView: React.FC<SubPageProps> = () => {
  const { userProfile } = useAuth();
  const [clubs, setClubs] = useState<StudentClub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClubs = async () => {
      setLoading(true);
      try {
        const instId = userProfile?.institutionId || 'uon';
        const campusId = userProfile?.campusId;
        const list = await getCampusClubs(instId, campusId);
        setClubs(list);
      } catch (err) {
        console.warn('Notice loading clubs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadClubs();
  }, [userProfile]);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
          <Users className="w-4 h-4" />
          <span>Student Life & Leadership</span>
        </div>
        <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
          Clubs & Societies
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
          Join verified student organizations, tech communities, humanitarian chapters, and cultural bodies.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading student clubs...</div>
      ) : clubs.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-white/10 text-slate-400 text-xs">
          No clubs registered for your campus currently.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 uppercase tracking-wider">
                  {club.category}
                </span>

                <h3 className="text-base font-bold text-white font-heading mt-2">
                  {club.name}
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {club.description}
                </p>

                <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{club.meetingSchedule}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-slate-200">{club.venue}</span>
                  </div>
                </div>
              </div>

              {club.patron && (
                <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400">
                  Faculty Patron: <span className="text-slate-300">{club.patron}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 3. SPORTS & ATHLETICS VIEW
// =========================================================================
export const CampusSportsView: React.FC<SubPageProps> = () => {
  const { userProfile } = useAuth();
  const [sports, setSports] = useState<StudentSport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSports = async () => {
      setLoading(true);
      try {
        const instId = userProfile?.institutionId || 'uon';
        const campusId = userProfile?.campusId;
        const list = await getCampusSports(instId, campusId);
        setSports(list);
      } catch (err) {
        console.warn('Notice loading sports:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSports();
  }, [userProfile]);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
          <Trophy className="w-4 h-4" />
          <span>Varsity & Recreation</span>
        </div>
        <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
          Campus Sports & Athletics
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
          Varsity squads competing in KUSA Inter-University Games and national sports leagues.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading sports teams...</div>
      ) : sports.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-white/10 text-slate-400 text-xs">
          No sports teams registered for your selected campus currently.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sports.map((sport) => (
            <div
              key={sport.id}
              className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                    Varsity Team
                  </span>
                </div>

                <h3 className="text-base font-bold text-white font-heading mt-1">
                  {sport.name}
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {sport.description}
                </p>

                <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{sport.trainingSchedule}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-slate-200">{sport.venue}</span>
                  </div>
                </div>
              </div>

              {sport.coach && (
                <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400">
                  Head Coach: <span className="text-slate-300">{sport.coach}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 4. STUDENT SERVICES VIEW
// =========================================================================
export const CampusServicesView: React.FC<SubPageProps> = () => {
  const { userProfile } = useAuth();
  const [services, setServices] = useState<CampusStudentService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      try {
        const instId = userProfile?.institutionId || 'uon';
        const campusId = userProfile?.campusId;
        const list = await getCampusServices(instId, campusId);
        setServices(list);
      } catch (err) {
        console.warn('Notice loading services:', err);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, [userProfile]);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
          <HeartHandshake className="w-4 h-4" />
          <span>Student Affairs & Welfare</span>
        </div>
        <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
          Campus Student Services
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
          Access the Dean of Students, HELB / Financial Aid Liaison, Counseling, and Registrar desks.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading student services...</div>
      ) : services.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-white/10 text-slate-400 text-xs">
          No services published for this campus currently.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                  {svc.category}
                </span>

                <h3 className="text-base font-bold text-white font-heading mt-2">
                  {svc.name}
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {svc.description}
                </p>

                <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Building className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Building: {svc.building} {svc.room ? `• ${svc.room}` : ''}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{svc.hours}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <a
                  href={`tel:${svc.contact}`}
                  className="flex items-center space-x-1.5 text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{svc.contact}</span>
                </a>
                <a
                  href={`mailto:${svc.email}`}
                  className="flex items-center space-x-1.5 text-slate-400 hover:text-white"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[150px]">{svc.email}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
