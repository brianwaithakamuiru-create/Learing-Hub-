import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCampusFacilities } from '../../services/institutionService';
import { CampusFacility } from '../../types';
import {
  MapPin,
  Search,
  Navigation,
  Compass,
  Layers,
  Building,
  Info,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface CampusMapProps {
  onNavigate?: (route: string) => void;
}

export const CampusMapView: React.FC<CampusMapProps> = ({ onNavigate }) => {
  const { userProfile } = useAuth();
  const [facilities, setFacilities] = useState<CampusFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<CampusFacility | null>(null);

  useEffect(() => {
    const loadFacilities = async () => {
      setLoading(true);
      try {
        const instId = userProfile?.institutionId || 'uon';
        const campusId = userProfile?.campusId;
        const list = await getCampusFacilities(instId, campusId);
        setFacilities(list);
        if (list.length > 0) {
          setSelectedFacility(list[0]);
        }
      } catch (err) {
        console.warn('Notice loading map facilities:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFacilities();
  }, [userProfile]);

  const filtered = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Map Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
            <MapPin className="w-4 h-4" />
            <span>{userProfile?.campusName || 'Campus'} Spatial Navigation</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
            Interactive Campus Map
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Geographic buildings, lecture halls, laboratories, and student service locations.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 'Library', 'ICT', 'Health'..."
            className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Main Map & Location Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Visual Interactive Campus Schematic Map */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between min-h-[450px] relative overflow-hidden">
          {/* Top Map Controls Overlay */}
          <div className="flex items-center justify-between z-10 mb-4">
            <span className="text-xs font-bold text-white flex items-center space-x-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Campus Grid & Building Markers</span>
            </span>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 font-mono">
              EAT (UTC+3) GPS Coords
            </span>
          </div>

          {/* Interactive Schematic Visual Canvas */}
          <div className="flex-1 rounded-xl bg-slate-950/80 border border-white/10 relative p-6 flex flex-col justify-between overflow-hidden shadow-inner">
            {/* Grid Lines Pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

            {/* Campus Center Landmark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-40">
              <div className="w-24 h-24 rounded-full border border-dashed border-cyan-400/40 flex items-center justify-center mx-auto mb-1">
                <Building className="w-8 h-8 text-cyan-400" />
              </div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                {userProfile?.campusName || 'Main Quadrangle'}
              </span>
            </div>

            {/* Interactive Facility Pins distributed across the map */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 z-10 my-auto">
              {filtered.map((facility, index) => {
                const isSelected = selectedFacility?.id === facility.id;

                return (
                  <button
                    key={facility.id}
                    type="button"
                    onClick={() => setSelectedFacility(facility)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.25)] scale-105'
                        : 'bg-slate-900/80 border-white/10 hover:border-white/30 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-white/10 text-cyan-300'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-xs font-bold truncate block">{facility.name}</span>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-400 truncate flex items-center space-x-1">
                      <Building className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{facility.building}</span>
                    </div>

                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Coordinates Status */}
            <div className="z-10 flex items-center justify-between text-[11px] text-slate-400 pt-4 border-t border-white/10">
              <span>Interactive Campus Spatial View</span>
              {selectedFacility && (
                <span className="font-mono text-cyan-300">
                  Lat: {selectedFacility.coordinates.lat.toFixed(4)} | Lng: {selectedFacility.coordinates.lng.toFixed(4)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Selected Facility Details & Navigation */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white font-heading">
            Selected Location Inspector
          </h3>

          {selectedFacility ? (
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase tracking-wider">
                  {selectedFacility.category}
                </span>
                <h4 className="text-lg font-bold text-white mt-1.5 font-heading">
                  {selectedFacility.name}
                </h4>
                <div className="text-xs text-slate-300 flex items-center space-x-1.5 mt-1">
                  <Building className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Building: {selectedFacility.building}</span>
                  {selectedFacility.floor && <span>• Floor: {selectedFacility.floor}</span>}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-300 leading-relaxed">
                {selectedFacility.description}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-slate-400">Opening Hours</span>
                  <span className="font-semibold text-slate-200">
                    {selectedFacility.openingHours || 'Opening hours not provided.'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-slate-400">Direct Contact</span>
                  <span className="font-semibold text-slate-200">
                    {selectedFacility.contact || 'Campus Administration'}
                  </span>
                </div>
              </div>

              {selectedFacility.availableServices.length > 0 && (
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                    Available Services at this Location:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedFacility.availableServices.map((svc, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-slate-200 border border-white/5"
                      >
                        ✓ {svc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center space-x-2">
                <a
                  href={`https://maps.google.com/?q=${selectedFacility.coordinates.lat},${selectedFacility.coordinates.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Live Directions</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 text-center rounded-2xl border border-white/10 text-slate-400 text-xs">
              Select any building marker on the map to inspect location details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
