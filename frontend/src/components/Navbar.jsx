import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserPlus, UserCheck, ClipboardCheck, Wallet, GraduationCap, UserCog, LogOut, Shield, Sun, Moon, Users, BookOpen, HelpCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const WhatsappIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

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
    navItems.push({ path: '/ayarlar', label: 'WhatsApp', icon: WhatsappIcon });
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
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 shrink-0 ${
                      isActive ? 'neo-button-primary font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'
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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Guide/Help Button */}
            <NavLink
              to="/kilavuz"
              className={({ isActive }) =>
                `w-10 h-10 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center ${isActive ? 'neo-button-primary' : 'neo-button text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`
              }
              title="Kullanım Kılavuzu"
            >
              <HelpCircle className="w-5 h-5" />
            </NavLink>
            
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
