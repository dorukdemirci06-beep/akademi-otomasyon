import React from 'react';
import { BookOpen, Users, ClipboardCheck, Wallet, UserPlus, Info } from 'lucide-react';

const Kilavuz = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="neo-card p-6 rounded-2xl border-l-4 border-l-[#2eb82e]">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#2eb82e]" />
          Sistem Kullanım Kılavuzu
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm leading-relaxed">
          Akademi Otomasyon sistemine hoş geldiniz! Bu kılavuz, sistemin temel modüllerini ve nasıl kullanılacağını adım adım açıklamaktadır.
          Sol menüdeki veya üst bardaki sekmeleri kullanarak ilgili bölümlere ulaşabilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Dashboard */}
        <div className="neo-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-[#2eb82e]">
            <div className="p-2 rounded-full bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">
              <Info className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Ana Panel (Dashboard)</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Kurumunuzun genel özetini görebileceğiniz alandır. Toplam öğrenci sayısı, yaklaşan ödemeler, genel devamsızlık durumu gibi kritik metrikler grafikler ve kısa listeler halinde burada yer alır.
          </p>
        </div>

        {/* Kayıt */}
        <div className="neo-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-sky-500">
            <div className="p-2 rounded-full bg-[#0284c7] hover:bg-[#026aa3] transition-colors text-white border-transparent shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Öğrenci Kayıt</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Yeni bir öğrencinin sisteme eklendiği bölümdür. Kimlik bilgileri, veli bilgileri ve atanacağı sınıflar buradan seçilir. Finansal ödeme planı (peşin, aylık vb.) oluşturulur.
          </p>
        </div>

        {/* Sınıflar */}
        <div className="neo-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-500">
            <div className="p-2 rounded-full bg-indigo-500 text-white border-transparent shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Sınıf Yönetimi</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Kurumdaki tüm sınıfları, kapasitelerini ve atanan öğrencileri yönetebilirsiniz. Hangi sınıfta kimin olduğunu görebilir, hızlıca öğrenci ekleyip çıkarabilirsiniz.
          </p>
        </div>

        {/* Yoklama */}
        <div className="neo-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-rose-500">
            <div className="p-2 rounded-full bg-rose-600 hover:bg-rose-700 transition-colors text-white border-transparent shadow-sm">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Yoklama Alma</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Öğretmen, Sınıf veya Ders bazlı yoklama alabileceğiniz ekrandır. Öğrencilerin derse katılıp katılmadığını işaretleyebilir ve gerektiğinde ders paketinden hak düşümü sağlayabilirsiniz.
          </p>
        </div>

        {/* Finans */}
        <div className="neo-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-500">
            <div className="p-2 rounded-full bg-amber-500 text-white border-transparent shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Ödemeler ve Finans</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Tüm öğrencilerin finansal hareketleri, gecikmiş ödemeleri, tahsilatlar ve yaklaşan taksitleri buradan takip edilir. Nakit, Kredi Kartı gibi ödeme yöntemleriyle tahsilat girebilirsiniz.
          </p>
        </div>

      </div>

      <div className="neo-card p-5 mt-6 rounded-2xl">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Destek Talebi</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Sistemle ilgili teknik bir problem yaşıyorsanız veya ek özellik talepleriniz varsa kurum yöneticiniz aracılığıyla teknik ekibimize ulaşabilirsiniz.
        </p>
      </div>
    </div>
  );
};

export default Kilavuz;
