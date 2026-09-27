import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchUserAssignments,
  fetchUserNotes,
  fetchUserExams,
  fetchUserKnowledgeItems,
  fetchUserRevisionTopics,
  fetchUserDocuments,
} from '../../services/workplaceService';
import { fetchUserTimetable } from '../../services/timetableService';
import {
  getUnitsForStudent,
  getCampusFacilities,
  getCampusEvents,
  getCampusAnnouncements,
  getCampusServices,
  getCampusClubs,
} from '../../services/institutionService';
import { AcademicDocument, ProgrammeUnit, CampusFacility, CampusEvent, CampusAnnouncement, CampusStudentService, StudentClub } from '../../types';
import {
  Search,
  X,
  Calendar,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Library,
  BookmarkCheck,
  FolderArchive,
  ArrowRight,
  Sparkles,
  Building2,
  Compass,
  MapPin,
  Bell,
  Users,
  HeartHandshake,
  BookOpen,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [queryText, setQueryText] = useState('');
  const [loading, setLoading] = useState(false);

  // Search datasets
  const [timetable, setTimetable] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [documents, setDocuments] = useState<AcademicDocument[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [revision, setRevision] = useState<any[]>([]);
  const [units, setUnits] = useState<ProgrammeUnit[]>([]);
  const [facilities, setFacilities] = useState<CampusFacility[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>([]);
  const [services, setServices] = useState<CampusStudentService[]>([]);
  const [clubs, setClubs] = useState<StudentClub[]>([]);

  useEffect(() => {
    const activeUid = currentUser?.uid || userProfile?.uid;
    if (!isOpen || !activeUid) return;

    const loadIndex = async () => {
      setLoading(true);
      try {
        const instId = userProfile?.institutionId || 'uon';
        const campusId = userProfile?.campusId;
        const progId = userProfile?.programmeId || 'uon-bsc-cs';
        const yr = userProfile?.yearOfStudy || 'Year 1';
        const sm = userProfile?.semester || 'Semester 1';

        const [tt, asg, nts, ex, kn, rev, docs, uList, fList, eList, aList, sList, cList] =
          await Promise.all([
            fetchUserTimetable(activeUid),
            fetchUserAssignments(activeUid),
            fetchUserNotes(activeUid),
            fetchUserExams(activeUid),
            fetchUserKnowledgeItems(activeUid),
            fetchUserRevisionTopics(activeUid),
            fetchUserDocuments(activeUid),
            getUnitsForStudent(instId, progId, yr, sm),
            getCampusFacilities(instId, campusId),
            getCampusEvents(instId, campusId),
            getCampusAnnouncements(instId, campusId),
            getCampusServices(instId, campusId),
            getCampusClubs(instId, campusId),
          ]);

        setTimetable(tt);
        setAssignments(asg);
        setNotes(nts);
        setExams(ex);
        setKnowledge(kn);
        setRevision(rev);
        setDocuments(docs);
        setUnits(uList);
        setFacilities(fList);
        setEvents(eList);
        setAnnouncements(aList);
        setServices(sList);
        setClubs(cList);
      } catch (err) {
        console.warn('Notice loading global search index:', err);
      } finally {
        setLoading(false);
      }
    };

    loadIndex();
  }, [isOpen, currentUser?.uid, userProfile?.uid, userProfile?.institutionId, userProfile?.campusId]);

  // Keyboard shortcut handler for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const q = queryText.trim().toLowerCase();

  // Search results
  const results: Array<{
    id: string;
    category: string;
    title: string;
    subtitle: string;
    route: string;
    icon: any;
  }> = [];

  if (q) {
    // 1. Units
    units.forEach((u) => {
      if (
        u.code.toLowerCase().includes(q) ||
        u.title.toLowerCase().includes(q) ||
        u.description?.toLowerCase().includes(q) ||
        u.lecturerName?.toLowerCase().includes(q)
      ) {
        results.push({
          id: `unit-${u.id}`,
          category: 'Curriculum Unit',
          title: `${u.code} • ${u.title}`,
          subtitle: `${u.credits} Credits • ${u.lecturerName || 'Lecturer TBA'}`,
          route: '/units',
          icon: BookOpen,
        });
      }
    });

    // 2. Facilities & Buildings
    facilities.forEach((f) => {
      if (
        f.name.toLowerCase().includes(q) ||
        f.building.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q) ||
        f.availableServices.some((s) => s.toLowerCase().includes(q))
      ) {
        results.push({
          id: `fac-${f.id}`,
          category: 'Campus Facility',
          title: f.name,
          subtitle: `${f.building} • ${f.location} (${f.category})`,
          route: '/facilities',
          icon: Compass,
        });
      }
    });

    // 3. Campus Map Locations
    facilities.forEach((f) => {
      if (
        q.includes('map') ||
        q.includes('direction') ||
        f.building.toLowerCase().includes(q)
      ) {
        if (!results.some((r) => r.id === `map-${f.id}`)) {
          results.push({
            id: `map-${f.id}`,
            category: 'Campus Map',
            title: `Map Marker: ${f.name}`,
            subtitle: `Building ${f.building}, Floor ${f.floor || 'G'}`,
            route: '/campus-map',
            icon: MapPin,
          });
        }
      }
    });

    // 4. Assignments
    assignments.forEach((a) => {
      if (
        a.title?.toLowerCase().includes(q) ||
        a.course?.toLowerCase().includes(q) ||
        a.unit?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
      ) {
        results.push({
          id: `asg-${a.id}`,
          category: 'Assignment',
          title: a.title,
          subtitle: `Unit: ${a.course || a.unit} • Due: ${a.dueDate} (${a.status})`,
          route: '/assignments',
          icon: ClipboardCheck,
        });
      }
    });

    // 5. Notes
    notes.forEach((n) => {
      if (
        n.title?.toLowerCase().includes(q) ||
        n.summary?.toLowerCase().includes(q) ||
        n.course?.toLowerCase().includes(q) ||
        (n.tags && n.tags.some((t: string) => t.toLowerCase().includes(q)))
      ) {
        results.push({
          id: `note-${n.id}`,
          category: 'Academic Note',
          title: n.title,
          subtitle: `${n.course || 'General'} • ${n.summary?.substring(0, 60)}...`,
          route: '/notes',
          icon: FileText,
        });
      }
    });

    // 6. Documents & Library Resources
    documents.forEach((d) => {
      if (
        d.title?.toLowerCase().includes(q) ||
        d.courseCode?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q)
      ) {
        results.push({
          id: `doc-${d.documentId}`,
          category: 'Digital Library',
          title: d.title,
          subtitle: `${d.category} • ${d.courseCode || 'Resource'}`,
          route: '/documents',
          icon: FolderArchive,
        });
      }
    });

    // 7. Campus Events
    events.forEach((e) => {
      if (
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      ) {
        results.push({
          id: `ev-${e.id}`,
          category: 'Campus Event',
          title: e.title,
          subtitle: `${e.date} at ${e.time} • ${e.venue}`,
          route: '/events',
          icon: Calendar,
        });
      }
    });

    // 8. Student Services
    services.forEach((s) => {
      if (
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.building.toLowerCase().includes(q)
      ) {
        results.push({
          id: `srv-${s.id}`,
          category: 'Student Service',
          title: s.name,
          subtitle: `${s.building} • ${s.contact} (${s.hours})`,
          route: '/services',
          icon: HeartHandshake,
        });
      }
    });

    // 9. Clubs & Societies
    clubs.forEach((c) => {
      if (
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      ) {
        results.push({
          id: `club-${c.id}`,
          category: 'Club & Society',
          title: c.name,
          subtitle: `${c.meetingSchedule} • ${c.venue}`,
          route: '/clubs',
          icon: Users,
        });
      }
    });

    // 10. Campus Announcements
    announcements.forEach((a) => {
      if (
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.issuedBy.toLowerCase().includes(q)
      ) {
        results.push({
          id: `ann-${a.id}`,
          category: 'Announcement',
          title: a.title,
          subtitle: `Issued by: ${a.issuedBy} • ${a.date}`,
          route: '/campus',
          icon: Bell,
        });
      }
    });

    // 11. Timetable classes
    timetable.forEach((c) => {
      if (
        c.unitCode?.toLowerCase().includes(q) ||
        c.unitName?.toLowerCase().includes(q) ||
        c.lecturerName?.toLowerCase().includes(q) ||
        c.roomNumber?.toLowerCase().includes(q)
      ) {
        results.push({
          id: `tt-${c.eventId}`,
          category: 'Timetable Class',
          title: `${c.unitCode} • ${c.unitName}`,
          subtitle: `${c.day} ${c.startTime}-${c.endTime} • ${c.building} ${c.roomNumber}`,
          route: '/timetable',
          icon: Calendar,
        });
      }
    });
  }

  const handleSelect = (route: string) => {
    onClose();
    onNavigate(route);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-20 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel rounded-2xl w-full max-w-2xl border border-cyan-500/30 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar with Section 9 placeholder: "What do you need?" */}
        <div className="p-4 border-b border-white/10 flex items-center space-x-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="What do you need?"
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {queryText && (
            <button
              type="button"
              onClick={() => setQueryText('')}
              className="text-slate-500 hover:text-white text-xs px-2 py-1 rounded-md bg-white/5"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Category Suggestion Chips when query is empty */}
        {!queryText && (
          <div className="p-4 border-b border-white/5 bg-slate-950/30">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-2">
              Quick Suggestions for {userProfile?.campusName || 'Your Campus'}
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { label: 'Library', query: 'library' },
                { label: 'Health Centre', query: 'health' },
                { label: 'Next Class', query: 'next' },
                { label: 'ICT Labs', query: 'ict' },
                { label: 'Assignments', query: 'assignment' },
                { label: 'Campus Map', query: 'map' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => setQueryText(chip.query)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300 border border-white/10 transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-white/5">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Indexing academic workspace and campus database...
            </div>
          ) : q && results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No results found for "<span className="text-white font-semibold">{queryText}</span>".
            </div>
          ) : !q ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Type to search units, notes, assignments, facilities, buildings, events, clubs, announcements, or campus locations.
            </div>
          ) : (
            results.map((res) => {
              const Icon = res.icon;
              return (
                <div
                  key={res.id}
                  onClick={() => handleSelect(res.route)}
                  className="p-3 rounded-xl hover:bg-cyan-500/10 cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-cyan-300 shrink-0 group-hover:border-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-white group-hover:text-cyan-300 truncate">
                          {res.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono shrink-0">
                          {res.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                        {res.subtitle}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2 transition-transform group-hover:translate-x-1" />
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-white/10 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Search shortcut: <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">Ctrl+K</kbd></span>
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">Esc</kbd> to dismiss</span>
        </div>
      </div>
    </div>
  );
};
