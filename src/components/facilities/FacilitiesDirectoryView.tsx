import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCampusFacilities } from '../../services/institutionService';
import { CampusFacility, FacilityCategory } from '../../types';
import {
  Compass,
  Search,
  Building,
  Clock,
  Phone,
  Mail,
  MapPin,
  Share2,
  Bookmark,
  Navigation,
  Check,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface FacilitiesDirectoryProps {
  onNavigate?: (route: string) => void;
}

export const FacilitiesDirectoryView: React.FC<FacilitiesDirectoryProps> = ({ onNavigate }) => {
  const { userProfile } = useAuth();
  const [facilities, setFacilities] = useState<CampusFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Selected Facility Modal
  const [activeFacility, setActiveFacility] = useState<CampusFacility | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('mlh_saved_facilities');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    const loadFacilities = async () => {
      setLoading(true);
      try {
        const instId = userProfile?.institutionId || 'uon';
        const campusId = userProfile?.campusId;
        const list = await getCampusFacilities(instId, campusId);
        setFacilities(list);
      } catch (err) {
        console.warn('Notice loading facilities:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFacilities();
  }, [userProfile]);

  // Section 15 principle: "Only display categories that contain actual institution data."
  const availableCategories = useMemo(() => {
    const cats = new Set<FacilityCategory>();
    facilities.forEach((f) => cats.add(f.category));
    return Array.from(cats);
  }, [facilities]);

  const toggleSaveFacility = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('mlh_saved_facilities', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const handleShare = (facility: CampusFacility) => {
    if (navigator.share) {
      navigator.share({
        title: facility.name,
        text: `${facility.name} at ${userProfile?.campusName || 'Campus'} - ${facility.location}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `${facility.name} • ${facility.building} • ${facility.location}`
      );
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const filteredFacilities = facilities.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.availableServices.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' || f.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Directory Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
              <Compass className="w-4 h-4" />
              <span>{userProfile?.campusName || 'Campus'} Directory</span>
            </div>
            <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
              Campus Facilities & Buildings
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Verified physical infrastructure and academic halls for {userProfile?.institutionName || 'your university'}.
            </p>
          </div>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('/campus-map')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 text-xs font-bold shadow-[0_0_15px_rgba(34,211,238,0.25)] cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Interactive Campus Map</span>
            </button>
          )}
        </div>

        {/* Search & Dynamic Category Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-white/10">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search library, computer lab, health clinic..."
              className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Only display categories that contain actual institution data */}
          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              ALL
            </button>

            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Facilities Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          Loading campus facilities directory...
        </div>
      ) : filteredFacilities.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-white/10">
          <Compass className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white font-heading">
            No Facilities Found
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            {searchQuery
              ? `No facilities match "${searchQuery}".`
              : 'No facilities published for this campus category yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacilities.map((facility) => {
            const isSaved = savedIds.has(facility.id);

            return (
              <div
                key={facility.id}
                className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-400/30">
                      {facility.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSaveFacility(facility.id)}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      title={isSaved ? 'Saved to Quick Access' : 'Save Facility'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors font-heading">
                    {facility.name}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center space-x-1.5 mt-1">
                    <Building className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{facility.building} {facility.floor ? `• ${facility.floor}` : ''}</span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                    {facility.description}
                  </p>

                  <div className="mt-3 text-[11px] text-slate-400 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">
                      {facility.openingHours || 'Opening hours not provided.'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span className="truncate max-w-[120px]">{facility.location}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveFacility(facility)}
                    className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    <span>Facility Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 16: FACILITY DETAILS MODAL                                        */}
      {/* ========================================================================= */}
      {activeFacility && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl glass-panel border border-white/20 rounded-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase tracking-wider">
                  {activeFacility.category}
                </span>
                <h2 className="text-xl font-bold text-white font-heading mt-1.5">
                  {activeFacility.name}
                </h2>
                <div className="text-xs text-slate-400 flex items-center space-x-2 mt-1">
                  <span>{userProfile?.campusName || 'Campus'}</span>
                  <span>•</span>
                  <span>Building: {activeFacility.building}</span>
                  {activeFacility.floor && <span>• {activeFacility.floor}</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveFacility(null)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <div className="my-4">
              <h4 className="text-xs font-semibold text-slate-300 mb-1">Description</h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                {activeFacility.description}
              </p>
            </div>

            {/* Opening Hours & Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Opening Hours</span>
                <span className="font-semibold text-slate-200">
                  {activeFacility.openingHours || 'Opening hours not provided.'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Direct Contact</span>
                <span className="font-semibold text-slate-200">
                  {activeFacility.contact || activeFacility.email || 'Contact Campus Registry'}
                </span>
              </div>
            </div>

            {/* Available Services */}
            {activeFacility.availableServices.length > 0 && (
              <div className="my-4">
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Available Services</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeFacility.availableServices.map((service, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-slate-200 border border-white/10"
                    >
                      ✓ {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location & Map Preview */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
              <span className="text-[11px] text-slate-400 block">Campus Location</span>
              <span className="text-xs font-bold text-white block mt-0.5">
                {activeFacility.location}
              </span>
              <div className="mt-2 text-[10px] text-cyan-300 font-mono">
                GPS: {activeFacility.coordinates.lat.toFixed(4)}, {activeFacility.coordinates.lng.toFixed(4)}
              </div>
            </div>

            {/* Section 16 Action Buttons: GET DIRECTIONS, CONTACT, SAVE, SHARE */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href={`https://maps.google.com/?q=${activeFacility.coordinates.lat},${activeFacility.coordinates.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 text-xs font-bold text-center"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Directions</span>
              </a>

              {activeFacility.contact ? (
                <a
                  href={`tel:${activeFacility.contact}`}
                  className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold text-center"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Contact</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="px-3 py-2 rounded-xl bg-white/5 text-slate-500 text-xs font-semibold text-center"
                >
                  Contact TBA
                </button>
              )}

              <button
                type="button"
                onClick={() => toggleSaveFacility(activeFacility.id)}
                className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  savedIds.has(activeFacility.id)
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{savedIds.has(activeFacility.id) ? 'Saved' : 'Save'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleShare(activeFacility)}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
              >
                {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedShare ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
