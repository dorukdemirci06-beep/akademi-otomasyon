import os

file_path = r"c:\Users\doruk\OneDrive\Masaüstü\Akademi Otomasyon\frontend\src\components\CustomDatePicker.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import React, { useState, useEffect, useRef } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';\nimport { createPortal } from 'react-dom';"
)

# 2. Add dropdownPosition and update logic
old_logic = """ const selectedDate = value ? parseDateStr(value) : null;
 const [viewDate, setViewDate] = useState(() => selectedDate || new Date());
 
 const containerRef = useRef(null);

 // Update viewDate when value changes
 useEffect(() => {
 if (value) {
 setViewDate(parseDateStr(value));
 }
 }, [value]);

 // Handle click outside to close dropdown
 useEffect(() => {
 const handleClickOutside = (event) => {
 if (containerRef.current && !containerRef.current.contains(event.target)) {
 setIsOpen(false);
 }
 };
 if (isOpen) {
 document.addEventListener('mousedown', handleClickOutside);
 }
 return () => {
 document.removeEventListener('mousedown', handleClickOutside);
 };
 }, [isOpen]);"""

new_logic = """ const selectedDate = value ? parseDateStr(value) : null;
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
     const popupHeight = 350;
     let finalTop = rect.bottom + window.scrollY;
     if (spaceBelow < popupHeight && spaceAbove > spaceBelow) {
       finalTop = rect.top + window.scrollY - popupHeight;
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
 }, [isOpen]);"""

content = content.replace(old_logic, new_logic)

# 3. Modify button click
old_btn_click = """ onClick={(e) => {
 e.stopPropagation();
 setIsOpen(!isOpen);
 }}"""
new_btn_click = """ onClick={(e) => {
 e.stopPropagation();
 if (!isOpen) updatePosition();
 setIsOpen(!isOpen);
 }}"""
content = content.replace(old_btn_click, new_btn_click)

# 4. Wrap popup in createPortal and set styles
old_popup_start = """ {/* STANDARD SIZE POPUP CALENDAR MODAL */}
 {isOpen && (
 <div 
 className={`absolute top-full mt-2 z-50 neo-card p-4 w-[280px] sm:w-[320px] animate-scale-in text-slate-100 ${
 align === 'right' ? 'right-0' : 'left-0'
 }`}
 style={{ minWidth: '280px' }}
 >"""
new_popup_start = """ {/* STANDARD SIZE POPUP CALENDAR MODAL */}
 {isOpen && createPortal(
 <div 
 className={`absolute z-[99999] date-picker-popup neo-card p-4 w-[280px] sm:w-[320px] animate-scale-in text-slate-100`}
 style={{ 
   top: `${dropdownPosition.top + 8}px`, 
   left: align === 'right' ? `${dropdownPosition.left + dropdownPosition.width - 280}px` : `${dropdownPosition.left}px`,
   minWidth: '280px',
   transitionProperty: 'opacity, transform'
 }}
 >"""
content = content.replace(old_popup_start, new_popup_start)

# 5. Add document.body to end of portal
old_popup_end = """ </div>
 )}
 </div>"""
new_popup_end = """ </div>
 , document.body)}
 </div>"""
content = content.replace(old_popup_end, new_popup_end)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated CustomDatePicker.jsx")
