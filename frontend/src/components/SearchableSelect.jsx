import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

const SearchableSelect = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = "Seçiniz...", 
  searchPlaceholder = "Ara..." 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    String(opt.value).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3.5 py-2.5 border rounded-xl cursor-pointer transition ${
          isOpen ? 'border-sky-500 ring-1 ring-sky-500/50 neo-input' : 'neo-input border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          {isOpen ? (
            <input
              type="text"
              autoFocus
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            />
          ) : selectedOption ? (
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-400">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && !isOpen && (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-sky-500' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-slate-200/50 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-xl z-50 max-h-56 overflow-y-auto p-1.5 space-y-0.5 shadow-xl animate-scale-in custom-scrollbar">
          {filteredOptions.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-900 dark:text-slate-400 italic">
              Sonuç bulunamadı.
            </div>
          ) : (
            filteredOptions.map((o) => {
              const isSelected = String(o.value) === String(value);
              return (
                <div
                  key={o.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(o.value);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                    isSelected 
                      ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' 
                      : 'text-slate-900 dark:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {o.label}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
