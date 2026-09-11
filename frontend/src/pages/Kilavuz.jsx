import React from 'react';
import { 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  Wallet, 
  UserPlus, 
  Info, 
  Settings, 
  History, 
  Shield, 
  CalendarDays,
  CheckCircle2,
  Phone
} from 'lucide-react';

const Kilavuz = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Başlık ve Açıklama */}
      <div className="neo-card p-6 md:p-8 rounded-3xl border-l-4 border-l-[#2eb82e] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2eb82e]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-[#2eb82e]" />
            Sistem Kullanım Kılavuzu & İpuçları
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm md:text-base leading-relaxed max-w-4xl">
            Akademi Otomasyon sistemine hoş geldiniz! Bu kılavuz, sistemin temel modüllerini, kritik özelliklerini ve nasıl kullanılacağını adım adım açıklamaktadır. 
            Sol menüdeki veya üst bölümdeki sekmeleri kullanarak ilgili alanlara hızlıca ulaşabilirsiniz.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Dashboard */}
        <div className="neo-card p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-3 text-[#2eb82e] border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-2.5 rounded-2xl bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white shadow-lg shadow-[#2eb82e]/20">
              <Info className="w-5 h-5" />
            </div>
            <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Ana Panel (Dashboard)</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Kurumunuzun anlık performansını ve genel özetini tek bakışta görebileceğiniz yönetim merkezidir.
          </p>
          <ul className="space-y-2 mt-2">
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-[#2eb82e] shrink-0 mt-0.5" />
              <span>Toplam öğrenci, sınıf ve ön kayıt sayılarına anlık erişim.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-[#2eb82e] shrink-0 mt-0.5" />
              <span>Haftalık ve günlük detaylı ders programı çizelgesi.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-[#2eb82e] shrink-0 mt-0.5" />
              <span>Son eklenen öğrencilerin hızlı listesi.</span>
            </li>
          </ul>
        </div>

        {/* Öğrenci Kayıt & Ön Kayıt */}
        <div className="neo-card p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-3 text-sky-500 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 transition-colors text-white shadow-lg shadow-sky-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Öğrenci & Ön Kayıt</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Yeni öğrencilerin ve potansiyel adayların sisteme dahil edilip, takip edildiği süreçtir.
          </p>
          <ul className="space-y-2 mt-2">
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <span>Kimlik, iletişim ve veli bilgileri ile detaylı öğrenci kaydı.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <span>Ön kayıt adayları için 'Aranacak', 'Olumsuz', 'Kesin Kayıt' durum takibi.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <span>Öğrenciye özel finansal ödeme planı (peşin, taksitli) oluşturma.</span>
            </li>
          </ul>
        </div>

        {/* Sınıf Yönetimi */}
        <div className="neo-card p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-3 text-indigo-500 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 transition-colors text-white shadow-lg shadow-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Sınıf & Ders Yönetimi</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Kurumdaki tüm eğitim faaliyetlerinin, branşların ve öğretmen atamalarının planlandığı alandır.
          </p>
          <ul className="space-y-2 mt-2">
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>Yeni sınıf/branş oluşturma ve kapasite sınırları belirleme.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>Sınıflara öğretmen atama ve ders saatleri (Pazartesi 10:00 - 11:30 vb.) tanımlama.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>Hangi sınıfta kaç öğrenci olduğunu görüp hızlıca düzenleme.</span>
            </li>
          </ul>
        </div>

        {/* Yoklama Alma */}
        <div className="neo-card p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-3 text-rose-500 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 transition-colors text-white shadow-lg shadow-rose-500/20">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Yoklama İşlemleri</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Öğrencilerin derse devamlılık durumlarının takip edildiği ve paket haklarının düşüldüğü modüldür.
          </p>
          <ul className="space-y-2 mt-2">
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>Sınıf veya belirli bir güne göre listeleme yaparak toplu yoklama alma.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>'Derse Girdi', 'Gelmedi', 'İzinli/Raporlu' durumlarının hızlıca işlenmesi.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>Devamsızlık yapıldığında ders paketinden otomatik hak düşümü sistemi.</span>
            </li>
          </ul>
        </div>

        {/* Ödemeler ve Finans */}
        <div className="neo-card p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-3 text-amber-500 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 transition-colors text-white shadow-lg shadow-amber-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Ödemeler & Finans</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Kurumun tüm finansal akışının, taksitlerin ve tahsilatların yönetildiği muhasebe bölümüdür.
          </p>
          <ul className="space-y-2 mt-2">
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Öğrencilerin aylık taksitlerini, kalan borçlarını ve yaklaşan ödemelerini takip etme.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Nakit, Kredi Kartı veya Havale/EFT yöntemleriyle sisteme tahsilat girme.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Geciken ödemeler için uyarılar ve genel finansal durum analizi.</span>
            </li>
          </ul>
        </div>

        {/* Kullanıcılar & Yetkiler */}
        <div className="neo-card p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-3 text-fuchsia-500 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-2.5 rounded-2xl bg-fuchsia-500 hover:bg-fuchsia-600 transition-colors text-white shadow-lg shadow-fuchsia-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Kullanıcı Yönetimi</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Sisteme giriş yapacak diğer personellerin hesaplarının ve erişim yetkilerinin ayarlandığı kısımdır.
          </p>
          <ul className="space-y-2 mt-2">
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-fuchsia-500 shrink-0 mt-0.5" />
              <span>Yönetici veya Personel (Sekreter, Öğretmen vb.) rollerinde alt kullanıcı oluşturma.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-fuchsia-500 shrink-0 mt-0.5" />
              <span>Personelin sadece kendi yetki alanındaki modülleri görmesini sağlama.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-fuchsia-500 shrink-0 mt-0.5" />
              <span>Hesap şifrelerini sıfırlama, duraklatma veya tamamen sistemden silme.</span>
            </li>
          </ul>
        </div>

        {/* Geçmiş Sezonlar (Arşiv) */}
        <div className="neo-card p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-3 text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-2.5 rounded-2xl bg-slate-500 hover:bg-slate-600 transition-colors text-white shadow-lg shadow-slate-500/20">
              <History className="w-5 h-5" />
            </div>
            <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Geçmiş Sezonlar</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Eski eğitim dönemlerinin arşivlendiği ve veri kaybını önleyen geriye dönük sorgulama sistemidir.
          </p>
          <ul className="space-y-2 mt-2">
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>Kapanan dönemlere ait öğrenci, finans ve yoklama verilerinin güvenli saklanması.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>Eski öğrencilerin borç-alacak durumlarını geçmişe yönelik kontrol etme.</span>
            </li>
          </ul>
        </div>

        {/* Ayarlar */}
        <div className="neo-card p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-3 text-teal-500 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-2.5 rounded-2xl bg-teal-500 hover:bg-teal-600 transition-colors text-white shadow-lg shadow-teal-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Sistem Ayarları</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Sistemin temel yapıtaşlarının ve kurum profilinin özelleştirildiği kontrol panelidir.
          </p>
          <ul className="space-y-2 mt-2">
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <span>Kurum bilgileri, logo ve iletişim detaylarını güncelleme.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <span>Karanlık Mod (Dark Mode) gibi kişisel arayüz tercihlerini yönetme.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Destek Bölümü */}
      <div className="neo-card p-6 md:p-8 mt-4 rounded-3xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-black/50 border border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
            <Phone className="w-5 h-5 text-indigo-500" />
            Yardıma mı ihtiyacınız var?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Sistem kullanımı sırasında karşılaştığınız teknik problemler, ek özellik talepleriniz veya genel danışmanlık hizmetleri için kurum yöneticiniz aracılığıyla veya direkt olarak teknik destek birimimizle iletişime geçebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Kilavuz;
