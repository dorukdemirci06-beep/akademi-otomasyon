import os

file_path = r"c:\Users\doruk\OneDrive\Masaüstü\Akademi Otomasyon\frontend\src\components\SearchableSelect.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';",
    "import React, { useState, useRef, useEffect } from 'react';\nimport { createPortal } from 'react-dom';"
)
content = content.replace(
    "import React, { useState, useRef, useEffect } from 'react';",
    "import React, { useState, useRef, useEffect } from 'react';\nimport { createPortal } from 'react-dom';"
)

# 2. Add logic
old_logic = """  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  useLayoutEffect(() => {
    const updatePosition = () => {
      if (isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        
        // Calculate space above and below
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const popupHeight = 224; // max-h-56 is 224px
        
        let finalTop = rect.bottom + window.scrollY + 4; // mt-1 + border spacing
        
        // If not enough space below, and more space above, open upwards
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

    if (isOpen) {
      updatePosition();
      
      const handleScroll = (e) => {
        // Check if scrolling inside the select popup itself
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
  }, [isOpen, options.length]);"""

new_logic = """  const dropdownRef = useRef(null);
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
  }, [isOpen, options.length]);"""

content = content.replace(old_logic, new_logic)

# 3. Button
old_btn = """      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3.5 py-2.5 border rounded-xl cursor-pointer transition ${"""
new_btn = """      <div 
        onClick={() => {
          if (!isOpen) updatePosition();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center justify-between gap-2 px-3.5 py-2.5 border rounded-xl cursor-pointer transition ${"""
content = content.replace(old_btn, new_btn)

# 4. Portal style
old_style = """          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}"""
new_style = """          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            transitionProperty: 'opacity, transform'
          }}"""
content = content.replace(old_style, new_style)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated SearchableSelect.jsx")
