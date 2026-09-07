import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RotateCcw, X, Check } from 'lucide-react';

const AYLAR = [
 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const GUN_ISIMLERI = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const CustomDatePicker = ({ 
 value, 
 onChange, 
 label, 
 prefix = '',
 buttonClassName = '',
 icon: IconComponent = CalendarIcon,
 placeholder = 'Tarih Seçin', 
 className = '',
 align = 'left' 
}) => {
 const [isOpen, setIsOpen] = useState(false);

 // Parse YYYY-MM-DD safely
 const parseDateStr = (dateStr) => {
 if (!dateStr) return new Date();
 const parts = dateStr.split('-');
 if (parts.length === 3) {
 const year = parseInt(parts[0], 10);
 const month = parseInt(parts[1], 10) - 1;
 const day = parseInt(parts[2], 10);
 return new Date(year, month, day);
 }
 return new Date();
 };

 const selectedDate = value ? parseDateStr(value) : null;
 const [viewDate, setViewDate] = useState(() => selectedDate || new Date());
 
 const containerRef = useRef(null);
 const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

 // Update viewDate when value changes
 useEffect(() => {
 if (value) {
 setViewDate(parseDateStr(value));
 }
 }, [value]);

 const updatePosition = () => {
   if (containerRef.current) {
     const rect = containerRef.current.getBoundingClientRect();
     const spaceBelow = window.innerHeight - rect.bottom;
     const spaceAbove = rect.top;
      const popupHeight = 440;
      let finalTop = rect.bottom + window.scrollY + 8; // Default to opening below
      
      // If there's more space above than below, and below is not enough
      if (spaceBelow < popupHeight && spaceAbove > spaceBelow) {
        finalTop = rect.top + window.scrollY - popupHeight - 8;
      }

      // Clamp to screen bounds to prevent cutoff
      const maxTop = window.innerHeight + window.scrollY - popupHeight - 16;
      const minTop = window.scrollY + 16;
      
      if (finalTop > maxTop) finalTop = maxTop;
      if (finalTop < minTop) finalTop = minTop;
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
       if (e.target.closest && e.target.closest('.date-picker-popup')) return;
       updatePosition();
     };
     const handleClickOutside = (event) => {
       if (containerRef.current && !containerRef.current.contains(event.target) && (!event.target.closest || !event.target.closest('.date-picker-popup'))) {
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
 }, [isOpen]);

 const viewYear = viewDate.getFullYear();
 const viewMonth = viewDate.getMonth();

 // Navigation handlers
 const handlePrevMonth = (e) => {
 e.stopPropagation();
 setViewDate(new Date(viewYear, viewMonth - 1, 1));
 };

 const handleNextMonth = (e) => {
 e.stopPropagation();
 setViewDate(new Date(viewYear, viewMonth + 1, 1));
 };

 const handleToday = (e) => {
 e.stopPropagation();
 const today = new Date();
 setViewDate(today);
 const todayStr = formatDateToYYYYMMDD(today);
 onChange(todayStr);
 setIsOpen(false);
 };

 const formatDateToYYYYMMDD = (dateObj) => {
 const y = dateObj.getFullYear();
 const m = String(dateObj.getMonth() + 1).padStart(2, '0');
 const d = String(dateObj.getDate()).padStart(2, '0');
 return `${y}-${m}-${d}`;
 };

 const handleSelectDay = (day) => {
 const newDate = new Date(viewYear, viewMonth, day);
 const dateStr = formatDateToYYYYMMDD(newDate);
 onChange(dateStr);
 setIsOpen(false);
 };

 // Generate calendar grid
 const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
 const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Pazartesi = 0

 const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
 const prevMonthDays = [];
 for (let i = firstDayIndex - 1; i >= 0; i--) {
 prevMonthDays.push(daysInPrevMonth - i);
 }

 const currentMonthDays = [];
 for (let d = 1; d <= daysInMonth; d++) {
 currentMonthDays.push(d);
 }

 const totalCellsSoFar = prevMonthDays.length + currentMonthDays.length;
 const nextMonthDaysCount = (7 - (totalCellsSoFar % 7)) % 7;
 const nextMonthDays = [];
 for (let d = 1; d <= nextMonthDaysCount; d++) {
 nextMonthDays.push(d);
 }

 // Format Turkish display string
 const getFormattedDisplay = () => {
 if (!value || !selectedDate) return placeholder;
 try {
 const dayName = selectedDate.toLocaleDateString('tr-TR', { weekday: 'short' });
 const monthName = AYLAR[selectedDate.getMonth()];
 return `${selectedDate.getDate()} ${monthName} ${selectedDate.getFullYear()} (${dayName})`;
 } catch {
 return value;
 }
 };

 const isToday = (day) => {
 const today = new Date();
 return (
 today.getDate() === day &&
 today.getMonth() === viewMonth &&
 today.getFullYear() === viewYear
 );
 };

 const isSelected = (day) => {
 if (!selectedDate) return false;
 return (
 selectedDate.getDate() === day &&
 selectedDate.getMonth() === viewMonth &&
 selectedDate.getFullYear() === viewYear
 );
 };

 return (
 <div className={`relative w-full ${className}`} ref={containerRef}>
 {label && (
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
 <span>{label}</span>
 </label>
 )}

 {/* Trigger Button */}
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 if (!isOpen) updatePosition();
 setIsOpen(!isOpen);
 }}
 className={`w-full flex flex-nowrap items-center justify-between gap-2 transition cursor-pointer min-w-0 overflow-hidden ${buttonClassName || 'px-3 py-2 border rounded-lg text-sm text-slate-900 dark:text-slate-100 h-[38px]'}`}
 >
 <div className="flex items-center gap-2 truncate min-w-0 flex-1 text-left">
 <IconComponent className="w-4 h-4 text-[#2eb82e] shrink-0" />
 <span className="truncate">{prefix}{getFormattedDisplay()}</span>
 </div>
 <ChevronRight className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-90 text-[#2eb82e]' : 'text-slate-400'}`} />
 </button>

 {/* STANDARD SIZE POPUP CALENDAR MODAL */}
 {isOpen && createPortal(
 <div 
 className={`absolute z-[99999] date-picker-popup neo-card p-4 w-[280px] sm:w-[320px] animate-scale-in text-slate-100`}
 style={{ 
   top: `${dropdownPosition.top}px`, 
   left: align === 'right' ? `${dropdownPosition.left + dropdownPosition.width - 280}px` : `${dropdownPosition.left}px`,
   minWidth: '280px',
   transitionProperty: 'opacity, transform'
 }}
 >
 {/* Header Bar */}
 <div className="flex justify-between items-center border-b pb-3 mb-4">
 <div className="flex items-center gap-2">
 <select 
 value={viewMonth}
 onChange={(e) => setViewDate(new Date(viewYear, parseInt(e.target.value), 1))}
 className="text-slate-100 font-bold rounded-full px-2 py-1 outline-none focus:border-emerald-500 cursor-pointer text-sm hover: transition neo-input"
 >
 {AYLAR.map((ay, idx) => (
 <option key={ay} value={idx}>{ay}</option>
 ))}
 </select>
 <select 
 value={viewYear}
 onChange={(e) => setViewDate(new Date(parseInt(e.target.value), viewMonth, 1))}
 className="text-slate-100 font-bold rounded-full px-2 py-1 outline-none focus:border-emerald-500 cursor-pointer text-sm hover: transition neo-input"
 >
 {Array.from({length: 100}, (_, i) => new Date().getFullYear() - 80 + i).map(yil => (
 <option key={yil} value={yil}>{yil}</option>
 ))}
 </select>
 </div>

 <div className="flex items-center gap-1">
 <button
 type="button"
 onClick={handlePrevMonth}
 className="p-2 rounded-full hover: text-slate-200 transition cursor-pointer neo-button"
 title="Önceki Ay"
 >
 <ChevronLeft className="w-5 h-5" />
 </button>
 <button
 type="button"
 onClick={handleNextMonth}
 className="p-2 rounded-full hover: text-slate-200 transition cursor-pointer neo-button"
 title="Sonraki Ay"
 >
 <ChevronRight className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* Days of Week Header */}
 <div className="grid grid-cols-7 gap-1 text-center mb-2">
 {GUN_ISIMLERI.map((g) => (
 <div key={g} className="text-xs font-black uppercase text-emerald-400 py-1 tracking-wider">
 {g}
 </div>
 ))}
 </div>

 {/* Days Grid */}
 <div className="grid grid-cols-7 gap-1 text-center">
 {/* Prev month days */}
 {prevMonthDays.map((d, idx) => (
 <div
 key={`prev-${idx}`}
 className="h-8 sm:h-9 flex items-center justify-center text-xs font-semibold text-slate-600 opacity-40 select-none"
 >
 {d}
 </div>
 ))}

 {/* Current month days */}
 {currentMonthDays.map((d) => {
 const selected = isSelected(d);
 const today = isToday(d);

 return (
 <button
 key={`curr-${d}`}
 type="button"
 onClick={() => handleSelectDay(d)}
 className={`h-8 sm:h-9 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center relative transition transform hover:scale-105 cursor-pointer ${
 selected
 ? 'neo-button-primary font-extrabold'
 : today
 ? 'text-emerald-500 font-extrabold border border-emerald-500/30'
 : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
 }`}
 >
 <span>{d}</span>
 {today && !selected && (
 <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full neo-button-primarymerald-400"></span>
 )}
 </button>
 );
 })}

 {/* Next month days */}
 {nextMonthDays.map((d, idx) => (
 <div
 key={`next-${idx}`}
 className="h-8 sm:h-9 flex items-center justify-center text-xs font-semibold text-slate-600 opacity-40 select-none"
 >
 {d}
 </div>
 ))}
 </div>

 {/* Footer Bar */}
 <div className="flex justify-between items-center border-t pt-3 mt-4 text-xs font-bold">
 <button
 type="button"
 onClick={handleToday}
 className="flex items-center gap-1.5 px-3 py-1.5 neo-button-primarymerald-950/80 hover:neo-button-primarymerald-900 text-emerald-300 border-emerald-700/60 rounded-full transition cursor-pointer neo-button"
 >
 <RotateCcw className="w-3.5 h-3.5" />
 <span>Bugün</span>
 </button>

 <button
 type="button"
 onClick={() => setIsOpen(false)}
 className="flex items-center gap-1 px-3 py-1.5 hover: text-slate-400 hover:text-white rounded-full transition cursor-pointer"
 >
 <X className="w-3.5 h-3.5" />
 <span>Kapat</span>
 </button>
 </div>
 </div>
 , document.body)}
 </div>
 );
};

export default CustomDatePicker;
