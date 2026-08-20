import React from 'react';
import { AlertTriangle, Trash2, HelpCircle, X } from 'lucide-react';

const ConfirmModal = ({
 isOpen,
 title = 'İşlem Onayı',
 message = 'Bu işlemi gerçekleştirmek istediğinize emin misiniz?',
 confirmText = 'Evet, Onayla',
 cancelText = 'İptal',
 type = 'danger', // 'danger' | 'warning' | 'info'
 onConfirm,
 onCancel
}) => {
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
 return 'bg-red-600 hover:bg-red-500 text-white -red-500/20';
 case 'warning':
 return 'bg-amber-600 hover:bg-amber-500 text-white -amber-500/20';
 default:
 return 'bg-sky-600 hover:bg-sky-500 text-white -sky-500/20';
 }
 };

 return (
 <div className="fixed inset-0 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
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
 </div>

 {/* Footer Actions */}
 <div className="p-4 border-t flex justify-end gap-3">
 <button
 type="button"
 onClick={onCancel}
 className="px-4 py-2 hover: dark:hover: text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full transition cursor-pointer neo-button"
 >
 {cancelText}
 </button>
 <button
 type="button"
 onClick={onConfirm}
 className={`px-5 py-2 text-white text-xs font-extrabold rounded-xl transition cursor-pointer ${getButtonBg()}`}
 >
 {confirmText}
 </button>
 </div>
 </div>
 </div>
 );
};

export default ConfirmModal;
