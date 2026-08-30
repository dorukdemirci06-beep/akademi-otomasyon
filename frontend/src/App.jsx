import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Kayit from "./pages/Kayit";
import OnKayit from "./pages/OnKayit";
import Siniflar from "./pages/Siniflar";
import Yoklama from "./pages/Yoklama";
import Finans from "./pages/Finans";
import Login from "./pages/Login";
import Kullanicilar from "./pages/Kullanicilar";
import Ayarlar from "./pages/Ayarlar";
import GecmisSezonlar from "./pages/GecmisSezonlar";
import Kilavuz from "./pages/Kilavuz";
import { ThemeProvider } from "./context/ThemeContext";
function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (!token) return null;
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed && parsed.kullanici_adi ? parsed : null;
    } catch {
      return null;
    }
  });
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
  };
  const roleLower = (currentUser?.rol || "").toLowerCase();
  const isAdmin =
    roleLower.includes("yönetici") ||
    roleLower.includes("yonetici") ||
    roleLower.includes("admin") ||
    roleLower.includes("super") ||
    roleLower.includes("süper");
  const isPersonel = roleLower.includes("personel");
  const canAccessSettings = isAdmin || isPersonel;
  return (
    <ThemeProvider>
      {" "}
      <Router>
        {" "}
        {!currentUser ? (
          <Routes>
            {" "}
            <Route
              path="/login"
              element={
                <Login onLoginSuccess={(user) => setCurrentUser(user)} />
              }
            />{" "}
            <Route
              path="*"
              element={
                <Login onLoginSuccess={(user) => setCurrentUser(user)} />
              }
            />{" "}
          </Routes>
        ) : (
          <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#2eb82e] selection:text-white duration-300">
            {" "}
            {/* Navigation Bar Component */}{" "}
            <Navbar currentUser={currentUser} onLogout={handleLogout} />{" "}
            {/* Page Body Routes */}{" "}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {" "}
              <Routes>
                {" "}
                <Route path="/" element={<Dashboard />} />{" "}
                <Route path="/siniflar" element={<Siniflar />} />{" "}
                <Route path="/kayit" element={<Kayit />} />{" "}
                <Route path="/on-kayit" element={<OnKayit />} />{" "}
                <Route path="/yoklama" element={<Yoklama />} />{" "}
                <Route path="/finans" element={<Finans />} />
                <Route path="/kilavuz" element={<Kilavuz />} />
                <Route path="/gecmis-sezonlar" element={<GecmisSezonlar showToast={() => {}} />} />
                <Route
                  path="/kullanicilar"
                  element={
                    isAdmin ? <Kullanicilar /> : <Navigate to="/" replace />
                  }
                />{" "}
                <Route
                  path="/ayarlar"
                  element={
                    canAccessSettings ? (
                      <Ayarlar showToast={() => {}} user={currentUser} />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />{" "}
                <Route path="/login" element={<Navigate to="/" replace />} />{" "}
                <Route path="*" element={<Navigate to="/" replace />} />{" "}
              </Routes>{" "}
            </main>{" "}
          </div>
        )}{" "}
      </Router>{" "}
    </ThemeProvider>
  );
}
export default App;
