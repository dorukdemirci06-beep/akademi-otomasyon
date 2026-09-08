import os

file_path = "frontend/src/components/Navbar.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "import { useTheme } from '../context/ThemeContext';",
    "import { useTheme } from '../context/ThemeContext';\nimport { isArchiveMode, getArchiveSezonAdi, clearArchiveData } from '../services/archiveMode';"
)

content = content.replace(
    "import { LayoutDashboard, UserPlus, UserCheck, ClipboardCheck, Wallet, GraduationCap, UserCog, LogOut, Shield, Sun, Moon, Users, BookOpen, HelpCircle, Menu, X, Archive } from 'lucide-react';",
    "import { LayoutDashboard, UserPlus, UserCheck, ClipboardCheck, Wallet, GraduationCap, UserCog, LogOut, Shield, Sun, Moon, Users, BookOpen, HelpCircle, Menu, X, Archive, AlertTriangle } from 'lucide-react';"
)

# 2. Add Archive State
state_hook = """  const [archiveModeActive, setArchiveModeActive] = useState(isArchiveMode());

  React.useEffect(() => {
    const handleArchiveChange = () => {
      setArchiveModeActive(isArchiveMode());
    };
    window.addEventListener('archiveModeChanged', handleArchiveChange);
    return () => window.removeEventListener('archiveModeChanged', handleArchiveChange);
  }, []);

  const handleExitArchive = () => {
    clearArchiveData();
    window.location.href = '/gecmis-sezonlar';
  };
"""
content = content.replace("  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);", "  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);\n" + state_hook)

# 3. Add Banner before <header>
banner_code = """
      {archiveModeActive && (
        <div className="bg-rose-600 text-white px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg relative z-[60]">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            ŞU AN ARŞİV MODUNDASINIZ ({getArchiveSezonAdi()}). Sadece okuma yapılabilir.
          </div>
          <button
            onClick={handleExitArchive}
            className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Arşiv Modundan Çık
          </button>
        </div>
      )}
"""
content = content.replace("<header className=\"neo-card sticky", banner_code + "\n    <header className=\"neo-card sticky")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Navbar.jsx updated with Archive Banner.")
