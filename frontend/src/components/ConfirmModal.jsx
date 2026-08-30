import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Trash2, HelpCircle, X } from 'lucide-react';

const ConfirmModal = ({
 isOpen,
 title = 'İşlem Onayı',
 message = 'Bu işlemi gerçekleştirmek istediğinize emin misiniz?',
 confirmText = 'Evet, Onayla',
 cancelText = 'İptal',
 type = 'danger', // 'danger' | 'warning' | 'info'
 requireHold = false, // If true, requires 3 seconds hold
 onConfirm,
 onCancel
}) => {
 const [holdProgress, setHoldProgress] = useState(0);
 const [isHolding, setIsHolding] = useState(false);
 const holdIntervalRef = useRef(null);
 const HOLD_DURATION = 3000;
 const UPDATE_INTERVAL = 50;

 useEffect(() => {
   if (!isOpen) {
     setHoldProgress(0);
     setIsHolding(false);
     clearInterval(holdIntervalRef.current);
   }
 }, [isOpen]);

 useEffect(() => {
   return () => clearInterval(holdIntervalRef.current);
 }, []);

 const startHold = () => {
   if (!requireHold) return;
   setIsHolding(true);
   let currentProgress = 0;
   holdIntervalRef.current = setInterval(() => {
     currentProgress += (UPDATE_INTERVAL / HOLD_DURATION) * 100;
     if (currentProgress >= 100) {
       clearInterval(holdIntervalRef.current);
       setHoldProgress(100);
       setIsHolding(false);
       onConfirm();
     } else {
       setHoldProgress(currentProgress);
     }
   }, UPDATE_INTERVAL);
 };

 const endHold = () => {
   if (!requireHold) return;
   clearInterval(holdIntervalRef.current);
   setIsHolding(false);
   if (holdProgress < 100) {
     setHoldProgress(0);
   }
 };

 if (!isOpen) return null;

 const getIcon = () => {
 switch (type) {
 case 'danger':
 return <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />;
 case 'warning':
 return <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
 default:
 return <HelpCircle className="w-6 h-6 text-sky-600" />;
 }
 };

 const getHeaderBg = () => {
 switch (type) {
 case 'danger':
 return 'bg-red-100 border-red-200 dark:bg-red-950/50 dark:border-red-800/60';
 case 'warning':
 return 'bg-amber-100 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800/60';
 default:
 return 'bg-sky-100 border-sky-200 dark:bg-sky-950/50 dark:border-sky-800/60';
 }
 };

 const getHeaderTitleColor = () => {
 switch (type) {
 case 'danger':
 return 'text-red-900 dark:text-red-100';
 case 'warning':
 return 'text-amber-900 dark:text-amber-100';
 default:
 return 'text-sky-900 dark:text-sky-100';
 }
 };

 const getButtonBg = () => {
 switch (type) {
 case 'danger':
 return 'bg-red-600 hover:bg-red-500 text-white';
 case 'warning':
 return 'bg-amber-600 hover:bg-amber-500 text-white';
 default:
 return 'bg-sky-600 hover:bg-sky-500 text-white';
 }
 };

 return (
 <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
 <div className="neo-card rounded-2xl w-full max-w-md overflow-hidden animate-scale-in">
 {/* Header */}
 <div className={`p-4 border-b flex items-center justify-between ${getHeaderBg()}`}>
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-full border dark:border-white/10">
 {getIcon()}
 </div>
 <h3 className={`text-base font-extrabold ${getHeaderTitleColor()}`}>{title}</h3>
 </div>
 <button
 type="button"
 onClick={onCancel}
 className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white p-1 rounded-full transition cursor-pointer neo-button"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Content */}
 <div className="p-6">
 <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
 {message}
 </p>
 {requireHold && (
   <p className="text-xs font-bold text-red-500 mt-4 flex items-center gap-1">
     <AlertTriangle className="w-3 h-3" /> Onaylamak için butona 3 saniye basılı tutun.
   </p>
 )}
 </div>

 {/* Footer Actions */}
 <div className="p-4 border-t flex justify-end gap-3">
 <button
 type="button"
 onClick={onCancel}
 className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full transition cursor-pointer neo-button"
 >
 {cancelText}
 </button>
 <button
 type="button"
 onMouseDown={requireHold ? startHold : undefined}
 onMouseUp={requireHold ? endHold : undefined}
 onMouseLeave={requireHold ? endHold : undefined}
 onTouchStart={requireHold ? startHold : undefined}
 onTouchEnd={requireHold ? endHold : undefined}
 onClick={!requireHold ? onConfirm : undefined}
 className={`relative overflow-hidden px-5 py-2 text-white text-xs font-extrabold rounded-xl transition cursor-pointer select-none ${getButtonBg()}`}
 >
 {requireHold && (
   <div 
     className="absolute left-0 top-0 bottom-0 bg-black/30 pointer-events-none"
     style={{ width: `${holdProgress}%`, transition: isHolding ? 'none' : 'width 0.3s ease' }}
   />
 )}
 <span className="relative z-10">{requireHold ? (isHolding ? 'Onaylanıyor...' : confirmText) : confirmText}</span>
 </button>
 </div>
 </div>
 </div>
 );
};

export default ConfirmModal;
