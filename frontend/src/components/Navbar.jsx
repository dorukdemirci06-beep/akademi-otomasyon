import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserPlus, UserCheck, ClipboardCheck, Wallet, GraduationCap, UserCog, LogOut, Shield, Sun, Moon, Users, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ currentUser, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const roleLower = (currentUser?.rol || '').toLowerCase();
  const isAdmin = roleLower.includes('yönetici') || roleLower.includes('yonetici') || roleLower.includes('admin') || roleLower.includes('super') || roleLower.includes('süper');
  const navItems = [
    { path: '/', label: 'Ana Panel', icon: LayoutDashboard },
    { path: '/kayit', label: 'Kayıt', icon: UserPlus },
    { path: '/on-kayit', label: 'Ön Kayıtlar', icon: UserCheck },
    { path: '/siniflar', label: 'Sınıflar', icon: BookOpen },
    { path: '/yoklama', label: 'Yoklama', icon: ClipboardCheck },
    { path: '/finans', label: 'Ödemeler', icon: Wallet },
  ];
  if (isAdmin) {
    navItems.push({ path: '/kullanicilar', label: 'Yönetim', icon: Users });
  }
  const displayName = currentUser?.ad_soyad || currentUser?.kullanici_adi || 'Kullanıcı';
  const displayRole = currentUser?.rol || 'Personel';

  return (
    <header className="neo-card sticky top-0 z-50 mb-6 !rounded-none !border-x-0 !border-t-0 border-b border-[rgba(255,255,255,0.1)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 neo-card !rounded-xl flex items-center justify-center text-[#2eb82e] shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="hidden xs:flex sm:flex items-center gap-2">
              <div className="flex flex-col justify-center">
                <span className="text-xl font-bold tracking-tight leading-none text-slate-800 dark:text-slate-100">
                  Kurum<span className="neo-text-primary">SaaS</span>
                </span>
                <span className="block text-[10px] font-bold text-[#ff8c1a] uppercase tracking-wider mt-1">
                  Yönetim Platformu
                </span>
              </div>
              {currentUser?.akademi_adi && (
                <span className="neo-input text-xs font-semibold text-slate-500 dark:text-slate-400 border-l pl-2 ml-2">
                  {currentUser.akademi_adi}
                </span>
              )}
            </div>
          </div>
          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 shrink-0 ${
                      isActive ? 'neo-button-primary font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 neo-button'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="whitespace-nowrap overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2">
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </nav>
          {/* Profile, Theme Switch & Logout */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Switch (Icon Only) */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-xl neo-button transition-all duration-300 cursor-pointer flex items-center justify-center`}
              title={theme === 'light' ? 'Koyu Temaya Geç (Gece)' : 'Açık Temaya Geç (Gündüz)'}
            >
              {theme === 'light' ? (
                <Sun className="w-5 h-5 text-amber-500 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-400 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>
            <div className="hidden sm:flex items-center gap-2 neo-input px-3 py-1.5 !rounded-xl">
              {isAdmin ? (
                <Shield className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-[#2eb82e]" />
              )}
              <div className="text-left leading-none">
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">{displayName}</span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{displayRole}</span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-10 h-10 sm:w-auto sm:px-3 sm:py-2 rounded-xl neo-button text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold"
              title="Oturumu Kapat"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
