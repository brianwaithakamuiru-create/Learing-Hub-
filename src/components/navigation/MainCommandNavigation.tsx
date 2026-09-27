import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  BookOpen,
  FolderArchive,
  ClipboardList,
  CalendarDays,
  Building2,
  Compass,
  MapPin,
  Calendar,
  Users,
  Trophy,
  HeartHandshake,
  Bell,
  Target,
  HelpCircle,
  Award,
  FileText,
  Search,
  User,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface MainCommandNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
  onOpenDiscovery?: () => void;
  onOpenProgrammeDiscovery?: () => void;
  unreadNotifications?: number;
}

export const MainCommandNavigation: React.FC<MainCommandNavProps> = ({
  currentRoute,
  onNavigate,
  onOpenSearch,
  onOpenDiscovery,
  onOpenProgrammeDiscovery,
  unreadNotifications = 0,
}) => {
  const { userProfile } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Navigation items including Directory and Programmes
  const navItems = [
    { id: 'home', label: 'HOME', route: '/dashboard', icon: Home },
    { id: 'units', label: 'MY UNITS', route: '/units', icon: BookOpen },
    { id: 'programmes', label: 'COURSE CATALOGUE', route: 'open-programmes', icon: Award },
    { id: 'directory', label: 'ALL INSTITUTIONS', route: 'open-discovery', icon: Building2 },
    { id: 'library', label: 'LIBRARY', route: '/documents', icon: FolderArchive },
    { id: 'assignments', label: 'ASSIGNMENTS', route: '/assignments', icon: ClipboardList },
    { id: 'timetable', label: 'TIMETABLE', route: '/timetable', icon: CalendarDays },
    { id: 'campus', label: 'MY CAMPUS', route: '/campus', icon: Building2 },
    { id: 'facilities', label: 'FACILITIES', route: '/facilities', icon: Compass },
    { id: 'map', label: 'CAMPUS MAP', route: '/campus-map', icon: MapPin },
    { id: 'events', label: 'EVENTS', route: '/events', icon: Calendar },
    { id: 'clubs', label: 'CLUBS & SOCIETIES', route: '/clubs', icon: Users },
    { id: 'sports', label: 'SPORTS', route: '/sports', icon: Trophy },
    { id: 'services', label: 'STUDENT SERVICES', route: '/services', icon: HeartHandshake },
    {
      id: 'notifications',
      label: 'NOTIFICATIONS',
      route: '/notifications',
      icon: Bell,
      badge: unreadNotifications > 0 ? String(unreadNotifications) : undefined,
    },
    { id: 'planner', label: 'STUDY PLANNER', route: '/goals', icon: Target },
    { id: 'quizzes', label: 'QUIZZES', route: '/quizzes', icon: HelpCircle },
    { id: 'results', label: 'RESULTS', route: '/results', icon: Award },
    { id: 'notes', label: 'NOTES', route: '/notes', icon: FileText },
    { id: 'search', label: 'SEARCH', route: 'search-modal', icon: Search },
    { id: 'profile', label: 'PROFILE', route: '/profile', icon: User },
    { id: 'settings', label: 'SETTINGS', route: '/settings', icon: Settings },
  ];

  const handleItemClick = (route: string) => {
    if (route === 'search-modal') {
      onOpenSearch();
    } else if (route === 'open-discovery') {
      if (onOpenDiscovery) {
        onOpenDiscovery();
      } else {
        onNavigate('/campus');
      }
    } else if (route === 'open-programmes') {
      if (onOpenProgrammeDiscovery) {
        onOpenProgrammeDiscovery();
      } else if (onOpenDiscovery) {
        onOpenDiscovery();
      } else {
        onNavigate('/units');
      }
    } else {
      onNavigate(route);
    }
    setMobileDrawerOpen(false);
  };

  const institutionName = userProfile?.institutionName || 'Kenyan University';
  const campusName = userProfile?.campusName || 'Main Campus';
  const programmeName = userProfile?.programmeName || 'Academic Workspace';

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP VERTICAL COMMAND NAVIGATION (EXPANDABLE/COLLAPSIBLE)            */}
      {/* ========================================================================= */}
      <aside
        className={`hidden lg:flex flex-col border-r border-white/10 glass-panel z-30 transition-all duration-300 relative shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header / Student Institution Pill */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3 truncate">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-xs shrink-0 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
                {userProfile?.institutionName?.[0] || 'K'}
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-white block truncate font-heading">
                  {institutionName}
                </span>
                <span className="text-[10px] text-cyan-400 block truncate font-mono">
                  {campusName}
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
              {userProfile?.institutionName?.[0] || 'K'}
            </div>
          )}

          {/* Collapse / Expand Toggle Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
            title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* CUE Accreditation Tag (when expanded) */}
        {!isCollapsed && (
          <div className="px-4 py-2 bg-cyan-950/30 border-b border-white/5 flex items-center space-x-2 text-[10px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">CUE Verified Academic Hub</span>
          </div>
        )}

        {/* Navigation Items List */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.route !== 'search-modal' &&
              (currentRoute === item.route ||
                (item.route === '/dashboard' && currentRoute === '/') ||
                (item.route === '/timetable' && currentRoute === '/classes') ||
                (item.route === '/goals' && currentRoute === '/planner'));

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.route)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-sky-500/10 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.15)] font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="relative shrink-0">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                    }`}
                  />
                  {item.badge && isCollapsed && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  )}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between truncate text-left">
                    <span className="truncate tracking-wide text-[11px]">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[9px] border border-cyan-400/30 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Student Profile Summary (when expanded) */}
        {!isCollapsed && (
          <div className="p-3 border-t border-white/10 bg-slate-950/40">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-xs text-cyan-300 font-bold">
                {userProfile?.fullName?.[0] || 'S'}
              </div>
              <div className="truncate">
                <span className="text-xs font-semibold text-slate-200 block truncate">
                  {userProfile?.fullName || 'Scholar'}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {userProfile?.registrationNumber || programmeName}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE FLOATING COMMAND DRAWER TRIGGER & BOTTOM BAR                      */}
      {/* ========================================================================= */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-bold text-xs shadow-[0_0_25px_rgba(34,211,238,0.5)] cursor-pointer"
        >
          <Menu className="w-4 h-4" />
          <span>Menu</span>
        </button>
      </div>

      {/* Mobile Command Drawer Modal / Backdrop */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200">
          <div className="w-full max-h-[85vh] glass-panel border-t border-white/20 rounded-t-3xl p-5 flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
                  {userProfile?.institutionName?.[0] || 'K'}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {institutionName}
                  </span>
                  <span className="text-[10px] text-cyan-400 block">
                    {campusName} • {userProfile?.yearOfStudy || 'Year 1'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Command Search Button */}
            <button
              type="button"
              onClick={() => {
                setMobileDrawerOpen(false);
                onOpenSearch();
              }}
              className="mt-3 w-full py-2.5 px-3 rounded-xl glass-input text-xs text-slate-300 flex items-center justify-between border border-cyan-400/30"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <span>Search campus facilities, units, events...</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono font-bold">Ctrl+K</span>
            </button>

            {/* Drawer 20 Navigation Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4 overflow-y-auto max-h-[55vh] p-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.route !== 'search-modal' &&
                  (currentRoute === item.route ||
                    (item.route === '/dashboard' && currentRoute === '/') ||
                    (item.route === '/timetable' && currentRoute === '/classes'));

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.route)}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="truncate text-[11px] tracking-wide">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
