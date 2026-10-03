import React, { useState } from 'react';
import { Wrench, ShieldAlert, Clock, RefreshCw, LogIn, Sparkles, CheckCircle2 } from 'lucide-react';
import Login from './Login';

export default function Bakimdayiz({ maintenanceInfo, onLoginSuccess }) {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const message = maintenanceInfo?.maintenance_message || "Sistemimizde bakım ve güncelleme çalışmaları yapılmaktadır. En kısa sürede tekrar hizmetinizde olacağız.";
  const endTime = maintenanceInfo?.maintenance_end_time;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-amber-500 selection:text-white">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-xl w-full relative z-10">
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/50 text-center">
          
          {/* Animated Icon Badge */}
          <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-6 text-amber-400 shadow-inner">
            <div className="relative">
              <Wrench className="w-12 h-12 animate-bounce" />
              <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Sistem Bakımda</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Daha İyi Bir Deneyim İçin Bakımdayız
          </h1>

          <p className="text-slate-300 text-base leading-relaxed mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700/40">
            {message}
          </p>

          {/* Estimated time if set */}
          {endTime && (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-300 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl mb-6">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Tahmini Bitiş Süresi: <strong className="text-amber-300">{endTime}</strong></span>
            </div>
          )}

          {/* Features list / Status */}
          <div className="grid grid-cols-2 gap-3 mb-8 text-left text-xs text-slate-400">
            <div className="flex items-center gap-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Veri Güvenliği Korunuyor</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sistem İyileştirmeleri</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-70"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Kontrol Ediliyor...' : 'Yenile & Tekrar Dene'}</span>
            </button>

            <button
              onClick={() => setShowAdminLogin(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-600/50 flex items-center justify-center gap-2 active:scale-95"
            >
              <LogIn className="w-4 h-4 text-slate-400" />
              <span>Yönetici Girişi</span>
            </button>
          </div>

        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Akademi Otomasyonu &copy; {new Date().getFullYear()} — Tüm Hakları Saklıdır.
        </p>
      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full relative">
            <button
              onClick={() => setShowAdminLogin(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white z-20 text-sm bg-slate-800 p-2 rounded-full border border-slate-700"
            >
              ✕
            </button>
            <Login
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
