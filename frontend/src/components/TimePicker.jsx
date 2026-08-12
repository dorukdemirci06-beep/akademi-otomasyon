import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';

const TimePicker = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);
  const [dropUp, setDropUp] = useState(false);

  // Parse initial value (HH:MM)
  const initialHour = value ? value.split(':')[0] : '10';
  const initialMinute = value ? value.split(':')[1] : '00';

  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);

  useEffect(() => {
    if (value) {
      setHour(value.split(':')[0]);
      setMinute(value.split(':')[1]);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine drop direction based on available screen space
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Dropdown height is approx 280px.
      if (spaceBelow < 280 && rect.top > 280) {
        setDropUp(true);
      } else {
        setDropUp(false);
      }
    }
  }, [isOpen]);

  const handleTimeSelect = (h, m) => {
    setHour(h);
    setMinute(m);
    onChange(`${h}:${m}`);
    setIsOpen(false);
  };

  const generateHours = () => {
    const hours = [];
    for (let i = 8; i <= 22; i++) {
      hours.push(i.toString().padStart(2, '0'));
    }
    return hours;
  };

  const generateMinutes = () => ['00', '15', '30', '45'];

  return (
    <div className="relative" ref={dropdownRef}>
      {label && <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
      <div
        ref={containerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="neo-input w-full px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between cursor-pointer group hover:text-sky-500 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-500 group-hover:animate-pulse" />
          <span>{hour}:{minute}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {isOpen && (
        <div className={`neo-card absolute z-[100] left-0 w-64 p-4 animate-scale-in ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
          <div className="flex gap-4">
            {/* Hours Column */}
            <div className="flex-1">
              <div className="text-xs font-extrabold text-slate-400 mb-2 text-center tracking-widest">SAAT</div>
              <div className="h-48 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                {generateHours().map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => {
                      setHour(h);
                      onChange(`${h}:${minute}`);
                    }}
                    className={`w-full text-center py-2 rounded-lg text-sm font-bold transition-all ${
                      hour === h 
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 scale-105' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-900/30'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-slate-200 dark:bg-slate-700/50"></div>

            {/* Minutes Column */}
            <div className="flex-1">
              <div className="text-xs font-extrabold text-slate-400 mb-2 text-center tracking-widest">DAKİKA</div>
              <div className="space-y-1">
                {generateMinutes().map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMinute(m);
                      onChange(`${hour}:${m}`);
                      setIsOpen(false);
                    }}
                    className={`w-full text-center py-2 rounded-lg text-sm font-bold transition-all ${
                      minute === m 
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-900/30'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
