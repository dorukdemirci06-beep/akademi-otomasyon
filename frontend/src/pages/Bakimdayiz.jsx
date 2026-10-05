import React, { useState, useEffect } from 'react';
import Login from './Login';
import { Wrench, ShieldAlert, Clock, RefreshCw, LogIn, CheckCircle2, Sun, Moon } from 'lucide-react';
import { getPublicSystemStatus } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function Bakimdayiz({ maintenanceInfo, onLoginSuccess }) {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMousePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await getPublicSystemStatus();
        if (res.data && !res.data.is_maintenance_mode) {
           setRefreshing(true);
           setTimeout(() => {
             window.location.reload();
           }, 5000);
           clearInterval(interval);
        }
      } catch (err) {
        // ignore
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const message = maintenanceInfo?.maintenance_message || "Sistemimizde bakım ve güncelleme çalışmaları yapılmaktadır. En kısa sürede tekrar hizmetinizde olacağız.";
  const endTime = maintenanceInfo?.maintenance_end_time;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans duration-300">
      
      {/* 1. Mouse Tracking Spotlight Gradient */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
        style={{
          background: theme === 'light'
            ? `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(245, 158, 11, 0.16), rgba(234, 88, 12, 0.10) 45%, transparent 75%)`
            : `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(245, 158, 11, 0.20), rgba(234, 88, 12, 0.14) 45%, transparent 80%)`
        }}
      />

      {/* 2. Lagged Neon Amber Blob Following Mouse */}
      <div
        className="absolute w-[320px] h-[320px] rounded-full blur-[70px] pointer-events-none transition-all duration-700 ease-out z-0 opacity-70 dark:opacity-80"
        style={{
          left: `${mousePos.x - 160}px`,
          top: `${mousePos.y - 160}px`,
          background: theme === 'light'
            ? 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0) 70%)'
            : 'radial-gradient(circle, rgba(245, 158, 11, 0.30) 0%, rgba(245, 158, 11, 0) 70%)'
        }}
      />

      {/* 3. Lagged Neon Orange Blob Following Mouse */}
      <div
        className="absolute w-[280px] h-[280px] rounded-full blur-[65px] pointer-events-none transition-all duration-1000 ease-out z-0 opacity-60 dark:opacity-75"
        style={{
          left: `${mousePos.x - 120}px`,
          top: `${mousePos.y - 120}px`,
          background: theme === 'light'
            ? 'radial-gradient(circle, rgba(234, 88, 12, 0.22) 0%, rgba(234, 88, 12, 0) 70%)'
            : 'radial-gradient(circle, rgba(234, 88, 12, 0.25) 0%, rgba(234, 88, 12, 0) 70%)'
        }}
      />

      {/* Top Right Theme Toggle Switch */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center ${theme === 'light'
            ? 'border-amber-300 text-amber-900 hover:bg-amber-100'
            : 'text-slate-200 hover:border-slate-600 hover:bg-slate-800'
            }`}
          title={theme === 'light' ? 'Koyu Temaya Geç (Gece)' : 'Açık Temaya Geç (Gündüz)'}
        >
          {theme === 'light' ? (
            <Sun className="w-4 h-4 text-amber-600 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:-rotate-12" />
          )}
        </button>
      </div>

      <div className="max-w-sm w-full space-y-4 z-10">

        {/* Header Branding */}
        <div className="text-center space-y-2 mb-2 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-[#f59e0b] to-[#ea580c] text-white shadow-lg shadow-amber-500/20 mb-1">
            <Wrench className="w-9 h-9 animate-bounce" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest mt-1 mb-1">
            <ShieldAlert className="w-3 h-3" />
            <span>Sistem Bakımda</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter leading-none mt-2">
            Daha İyi Bir <span className="text-amber-500">Deneyim</span> İçin
          </h1>
          <div className="text-xs font-black text-amber-500 uppercase tracking-widest leading-none mt-1.5">
            Bakımdayız
          </div>
          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-2">
            Güncelleme ve İyileştirme Çalışmaları Yapılıyor.
          </p>
        </div>

        {/* Maintenance Card */}
        <div className="neo-card p-5 sm:p-6 space-y-4">

          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-relaxed neo-input rounded-xl p-4 text-center">
            {message}
          </p>

          {endTime && (
            <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 neo-input rounded-xl p-3 border border-amber-500/20">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Tahmini Bitiş Süresi: <strong className="text-amber-600 dark:text-amber-400">{endTime}</strong></span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-left text-[10px] font-bold text-slate-600 dark:text-slate-400 mt-2 mb-2">
            <div className="flex items-center gap-1.5 neo-input rounded-lg p-2.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Veri Güvenliği Sağlandı</span>
            </div>
            <div className="flex items-center gap-1.5 neo-input rounded-lg p-2.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Sistem İyileştirmeleri</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 disabled:opacity-70 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Kontrol Ediliyor...' : 'Yenile & Tekrar Dene'}</span>
            </button>

            <button
              onClick={() => setShowAdminLogin(true)}
              className="w-full py-2.5 px-4 neo-button rounded-full text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Yönetici Girişi</span>
            </button>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 font-medium mt-6">
          © {new Date().getFullYear()} KUYO Kurum Yönetim Sistemi - Tüm Hakları Saklıdır
        </div>

      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="max-w-sm w-full relative">
            <Login
              kurulumOnly={true}
              onCancelKurulum={() => setShowAdminLogin(false)}
              onLoginSuccess={(user) => {
                setShowAdminLogin(false);
                if (onLoginSuccess) onLoginSuccess(user);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
