import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, X } from 'lucide-react';

const SearchableSelect = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = "Seçiniz...", 
  searchPlaceholder = "Ara...",
  icon: Icon = Search,
  isMulti = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const updatePosition = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const popupHeight = 224;
      let finalTop = rect.bottom + window.scrollY + 4;
      if (spaceBelow < popupHeight && spaceAbove > spaceBelow) {
        finalTop = rect.top + window.scrollY - Math.min(popupHeight, options.length * 40) - 10;
      }
      setDropdownPosition({
        top: finalTop,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      const handleScroll = (e) => {
        if (e.target.closest && e.target.closest('.searchable-select-popup')) return;
        updatePosition();
      };
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          (!event.target.closest || !event.target.closest('.searchable-select-popup'))
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, options.length]);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    String(opt.value).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOptionClick = (e, o, isSelected) => {
    e.stopPropagation();
    if (isMulti) {
      const valArray = Array.isArray(value) ? value : [];
      if (isSelected) {
        onChange(valArray.filter(v => String(v) !== String(o.value)));
      } else {
        onChange([...valArray, o.value]);
      }
    } else {
      onChange(o.value);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const selectedOptions = isMulti 
    ? options.filter(opt => Array.isArray(value) && value.map(v => String(v)).includes(String(opt.value)))
    : options.filter(opt => String(opt.value) === String(value));

  const selectedOption = !isMulti ? selectedOptions[0] : null;

  return (
    <div className={`relative ${isOpen ? 'z-50' : ''}`} ref={dropdownRef}>
      <div 
        onClick={() => {
          if (!isOpen) updatePosition();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center justify-between gap-2 px-3.5 py-2 min-h-[42px] border rounded-xl cursor-pointer transition ${
          isOpen 
            ? 'border-sky-500 ring-1 ring-sky-500/50 neo-input' 
            : (selectedOption?.color ? selectedOption.color : 'neo-input border-transparent')
        }`}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Icon className="w-4 h-4 text-slate-400 shrink-0" />
          {isOpen ? (
            <input
              type="text"
              autoFocus
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 min-w-[100px] bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            />
          ) : isMulti ? (
            selectedOptions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 py-0.5">
                {selectedOptions.map(opt => (
                  <span key={opt.value} className="flex items-center gap-1 bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400 px-2 py-1 rounded-md text-[10px] font-bold">
                    <span className="max-w-[100px] truncate">{opt.label}</span>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(value.filter(v => String(v) !== String(opt.value)));
                      }}
                      className="hover:bg-sky-500/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs font-semibold text-slate-400 truncate">{placeholder}</span>
            )
          ) : selectedOption ? (
            <span className={`text-xs font-bold truncate ${selectedOption.color ? '' : 'text-slate-900 dark:text-slate-100'}`}>
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-400 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isMulti && Array.isArray(value) && value.length > 0 && !isOpen && (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-sky-500' : ''}`} />
        </div>
      </div>

      {isOpen && createPortal(
        <div 
          className="absolute z-[99999] searchable-select-popup bg-white/40 dark:bg-black/20 backdrop-blur-md border border-slate-200/50 dark:border-white/10 shadow-xl rounded-2xl max-h-56 overflow-y-auto p-1.5 space-y-0.5 animate-in fade-in duration-150 custom-scrollbar"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            transitionProperty: 'opacity, transform'
          }}
        >
          {filteredOptions.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-900 dark:text-slate-400 italic">
              Sonuç bulunamadı.
            </div>
          ) : (
            filteredOptions.map((o) => {
              const isSelected = isMulti 
                ? (Array.isArray(value) && value.map(v => String(v)).includes(String(o.value)))
                : String(o.value) === String(value);

              return (
                <div
                  key={o.value}
                  onClick={(e) => handleOptionClick(e, o, isSelected)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-full text-xs font-bold cursor-pointer transition ${
                    isSelected 
                      ? (o.color ? `${o.color} text-white shadow-sm` : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-transparent shadow-sm')
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-white/10 dark:hover:text-white'
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  {isMulti && (
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-300 dark:border-slate-500 bg-white/50 dark:bg-black/20'}`}>
                      {isSelected && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      , document.body)}
    </div>
  );
};

export default SearchableSelect;
