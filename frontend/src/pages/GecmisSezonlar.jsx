import React, { useState, useEffect, useRef } from 'react';
import { getGecmisSezonlar, getSezonDetay, arsivleSezonSonu, geriAlSezon } from '../services/api';
import { setArchiveData } from '../services/archiveMode';
import ConfirmModal from '../components/ConfirmModal';
import { Archive, Calendar, Users, BookOpen, CreditCard, CheckCircle, AlertCircle, RefreshCw, ChevronRight, Eye, Plus, Database, AlertTriangle, X } from 'lucide-react';

export default function GecmisSezonlar({ showToast }) {
  const [sezonlar, setSezonlar] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSezonId, setSelectedSezonId] = useState(null);
  const [detayLoading, setDetayLoading] = useState(false);

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const roleLower = (currentUser?.rol || '').toLowerCase();
  const isAdmin = roleLower.includes('yönetici') || roleLower.includes('yonetici') || roleLower.includes('admin');

  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdIntervalRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(holdIntervalRef.current);
  }, []);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    confirmText: 'Evet',
    requireHold: false,
    onConfirm: () => {}
  });

  const openConfirm = ({ title, message, type = 'danger', confirmText = 'Evet, Onayla', requireHold = false, onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      requireHold,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        await onConfirm();
      }
    });
  };

  const handleArchiveMode = async (sezon) => {
    try {
      showToast('Arşiv yükleniyor...');
      const res = await getSezonDetay(sezon.id);
      const parsedData = JSON.parse(res.data.veri_dump);
      setArchiveData(sezon.sezon_adi, parsedData);
      window.location.href = '/';
    } catch (err) {
      showToast('Arşiv verisi alınamadı.', 'error');
    }
  };

  const [restoring, setRestoring] = useState(false);

  const handleRestore = (id) => {
    openConfirm({
      title: 'Arşivi Geri Yükle',
      message: 'DİKKAT: Bu işlem şu anki AKTİF sezon verilerinizi (Sınıflar, Ödemeler, Yoklamalar vb.) TAMAMEN SİLECEK ve yerlerine bu arşivdeki verileri geri yükleyecektir. İşlemden sonra bu arşiv kaydı da silinecektir. Emin misiniz?',
      type: 'danger',
      confirmText: 'Evet, Geri Yükle',
      requireHold: true,
      onConfirm: async () => {
        setRestoring(true);
        try {
          const res = await geriAlSezon(id);
          showToast(res.data.message);
          setSelectedSezonId(null);
          setTimeout(() => { window.location.reload(); }, 2000);
        } catch (err) {
          showToast(err.response?.data?.detail || 'Geri yükleme sırasında hata oluştu', 'error');
        } finally {
          setRestoring(false);
        }
      }
    });
  };


  // Tabs for detail view
  const [activeTab, setActiveTab] = useState('ogrenciler');

  // Arşiv Oluşturma State
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveSeasonName, setArchiveSeasonName] = useState('');
  const [archiving, setArchiving] = useState(false);

  const handleArchive = (e) => {
    e.preventDefault();
  };

  const startHoldArchive = () => {
    if (!archiveSeasonName.trim() || archiving) return;
    setIsHolding(true);
    let currentProgress = 0;
    const UPDATE_INTERVAL = 50;
    const HOLD_DURATION = 3000;
    
    holdIntervalRef.current = setInterval(() => {
      currentProgress += (UPDATE_INTERVAL / HOLD_DURATION) * 100;
      if (currentProgress >= 100) {
        clearInterval(holdIntervalRef.current);
        setHoldProgress(100);
        setIsHolding(false);
        executeArchive();
      } else {
        setHoldProgress(currentProgress);
      }
    }, UPDATE_INTERVAL);
  };

  const endHoldArchive = () => {
    clearInterval(holdIntervalRef.current);
    setIsHolding(false);
    if (holdProgress < 100) {
      setHoldProgress(0);
    }
  };

  const executeArchive = async () => {
    setArchiving(true);
    try {
      const res = await arsivleSezonSonu({ sezon_adi: archiveSeasonName });
      showToast(res.data.message);
      setArchiveSeasonName('');
      setIsArchiveModalOpen(false);
      setHoldProgress(0);
      setTimeout(() => { window.location.reload(); }, 2000);
    } catch (err) {
      showToast('Arşivleme sırasında hata oluştu.', 'error');
      setHoldProgress(0);
    } finally {
      setArchiving(false);
    }
  };


  useEffect(() => {
    fetchSezonlar();
  }, []);

  const fetchSezonlar = async () => {
    setLoading(true);
    try {
      const res = await getGecmisSezonlar();
      setSezonlar(res.data);
    } catch (err) {
      showToast('Geçmiş sezonlar yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSezon = async (id) => {
    setSelectedSezonId(id);
    setDetayLoading(true);
    try {
      const res = await getSezonDetay(id);
      const parsedData = JSON.parse(res.data.veri_dump);
      setSezonDetay({ ...res.data, parsedData });
      setActiveTab('ogrenciler');
    } catch (err) {
      showToast('Sezon detayı yüklenemedi', 'error');
      setSelectedSezonId(null);
    } finally {
      setDetayLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Yükleniyor...</div>;
  }

  // --- RENDERING DETAIL VIEW ---
  if (selectedSezonId && sezonDetay && !detayLoading) {
    const data = sezonDetay.parsedData;
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 neo-card p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <span 
                  className="cursor-pointer hover:text-blue-500 transition-colors"
                  onClick={() => setSelectedSezonId(null)}
                >Geçmiş Sezonlar</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                {sezonDetay.sezon_adi}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Oluşturulma: {new Date(sezonDetay.olusturulma_tarihi).toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <button
                onClick={() => handleRestore(sezonDetay.id)}
                disabled={restoring}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition disabled:opacity-50"
              >
                {restoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {restoring ? 'Geri Yükleniyor...' : 'Bu Arşivi Geri Yükle'}
              </button>
            )}
            <button
              onClick={() => setSelectedSezonId(null)}
              className="neo-button px-4 py-2 rounded-xl text-sm font-bold text-slate-600"
            >
              Sezon Listesine Dön
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <TabButton active={activeTab === 'ogrenciler'} onClick={() => setActiveTab('ogrenciler')} icon={Users} label={`Öğrenciler (${data.ogrenciler?.length || 0})`} />
          <TabButton active={activeTab === 'siniflar'} onClick={() => setActiveTab('siniflar')} icon={BookOpen} label={`Sınıflar (${data.siniflar?.length || 0})`} />
          <TabButton active={activeTab === 'odemeler'} onClick={() => setActiveTab('odemeler')} icon={CreditCard} label={`Ödemeler (${data.odemeler?.length || 0})`} />
          <TabButton active={activeTab === 'yoklamalar'} onClick={() => setActiveTab('yoklamalar')} icon={CheckCircle} label={`Yoklamalar (${data.yoklamalar?.length || 0})`} />
        </div>

        {/* Tab Content */}
        <div className="neo-card p-6 rounded-3xl">
          {activeTab === 'ogrenciler' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500">
                    <th className="pb-3 font-semibold">Öğrenci Adı Soyadı</th>
                    <th className="pb-3 font-semibold">TC / Telefon</th>
                    <th className="pb-3 font-semibold">Kayıt Tarihi</th>
                    <th className="pb-3 font-semibold">Arşiv Anı Bakiye</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {data.ogrenciler?.map((o, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 font-bold">{o.isim} {o.soyisim}</td>
                      <td className="py-3 text-slate-500">{o.tc || '-'} / {o.telefon || '-'}</td>
                      <td className="py-3 text-slate-500">{o.kayit_tarihi ? new Date(o.kayit_tarihi).toLocaleDateString('tr-TR') : '-'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${o.bakiye < 0 ? 'bg-rose-100 text-rose-700' : o.bakiye > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                          {o.bakiye} ₺
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!data.ogrenciler || data.ogrenciler.length === 0) && (
                    <tr><td colSpan="4" className="py-8 text-center text-slate-400">Öğrenci bulunamadı.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'siniflar' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500">
                    <th className="pb-3 font-semibold">Sınıf Adı</th>
                    <th className="pb-3 font-semibold">Kayıtlı Öğrenci Sayısı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {data.siniflar?.map((s, i) => {
                    const ogrSayisi = data.ogrenci_siniflar?.filter(os => os.sinif_id === s.id).length || 0;
                    return (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 font-bold">{s.sinif_adi}</td>
                        <td className="py-3 text-slate-500">{ogrSayisi} Öğrenci</td>
                      </tr>
                    );
                  })}
                  {(!data.siniflar || data.siniflar.length === 0) && (
                    <tr><td colSpan="2" className="py-8 text-center text-slate-400">Sınıf bulunamadı.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'odemeler' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500">
                    <th className="pb-3 font-semibold">Öğrenci</th>
                    <th className="pb-3 font-semibold">Tarih</th>
                    <th className="pb-3 font-semibold">Tutar</th>
                    <th className="pb-3 font-semibold">Yöntem / Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {data.odemeler?.map((od, i) => {
                    const ogr = data.ogrenciler?.find(o => o.id === od.ogrenci_id);
                    return (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 font-bold">{ogr ? `${ogr.isim} ${ogr.soyisim}` : 'Bilinmeyen'}</td>
                        <td className="py-3 text-slate-500">{od.tarih ? new Date(od.tarih).toLocaleDateString('tr-TR') : '-'}</td>
                        <td className="py-3 font-bold">{od.tutar} ₺</td>
                        <td className="py-3 text-xs">
                          <span className={`px-2 py-1 rounded-md mr-2 ${od.durum === 'Ödendi' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{od.durum}</span>
                          <span className="text-slate-500">{od.odeme_yontemi || '-'}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {(!data.odemeler || data.odemeler.length === 0) && (
                    <tr><td colSpan="4" className="py-8 text-center text-slate-400">Ödeme bulunamadı.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'yoklamalar' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500">
                    <th className="pb-3 font-semibold">Tarih</th>
                    <th className="pb-3 font-semibold">Sınıf</th>
                    <th className="pb-3 font-semibold">Öğrenci</th>
                    <th className="pb-3 font-semibold">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {data.yoklamalar?.map((y, i) => {
                    const ogr = data.ogrenciler?.find(o => o.id === y.ogrenci_id);
                    const snf = data.siniflar?.find(s => s.id === y.sinif_id);
                    return (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 text-slate-500">{y.tarih ? new Date(y.tarih).toLocaleDateString('tr-TR') : '-'}</td>
                        <td className="py-3 text-slate-500">{snf ? snf.sinif_adi : '-'}</td>
                        <td className="py-3 font-bold">{ogr ? `${ogr.isim} ${ogr.soyisim}` : 'Bilinmeyen'}</td>
                        <td className="py-3 text-xs">
                          <span className={`px-2 py-1 rounded-md ${y.durum === 'Geldi' ? 'bg-emerald-100 text-emerald-700' : y.durum === 'Gelmedi' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                            {y.durum}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {(!data.yoklamalar || data.yoklamalar.length === 0) && (
                    <tr><td colSpan="4" className="py-8 text-center text-slate-400">Yoklama bulunamadı.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDERING LIST VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 neo-card p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white">Geçmiş Sezonlar Arşivi</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sene sonu devri yapılan geçmiş sezonların salt okunur kayıtları.</p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsArchiveModalOpen(true)}
            className="relative z-10 neo-button-primary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shrink-0 bg-rose-500 hover:bg-rose-600 text-white border-transparent"
          >
            <Database className="w-4 h-4" />
            Sene Sonu Devri Yap
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sezonlar.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl">
            <Archive className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Henüz arşivlenmiş bir sezon bulunmuyor.</p>
          </div>
        ) : (
          sezonlar.map((sezon) => (
            <div key={sezon.id} className="neo-card p-6 rounded-3xl flex flex-col justify-between group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {new Date(sezon.olusturulma_tarihi).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-500 transition-colors">
                  {sezon.sezon_adi}
                </h3>
                <p className="text-xs text-slate-500">
                  Bu sezon ait tüm öğrenciler, sınıflar, yoklamalar ve ödemeler donduruldu.
                </p>
              </div>
              
              <div className="mt-6 flex flex-col gap-2 w-full">
                <button
                  onClick={() => handleArchiveMode(sezon)}
                  className="w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" /> Sistemi Bu Arşiv Modunda İncele
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleRestore(sezon.id)}
                    disabled={restoring}
                    className="w-full px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {restoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {restoring ? 'Geri Yükleniyor...' : 'Sistemi Bu Arşive Geri Döndür'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {/* Sene Sonu Devri Modal */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="neo-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-rose-500" />
                Sene Sonu Devri (Sezon Arşivi)
              </h2>
              <button onClick={() => setIsArchiveModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="neo-card !border-l-4 !border-l-rose-500 !bg-transparent p-4 rounded-2xl flex gap-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-rose-600 dark:text-rose-400 text-sm mb-1">DİKKAT EDİLMESİ GEREKENLER</h3>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc pl-4">
                    <li>Bu işlem aktif <strong>sınıfları, ders programlarını, yoklamaları ve ödemeleri tamamen siler.</strong></li>
                    <li>Öğrenci bakiyeleri sıfırlanır. Öğrenciler sistemde kalır.</li>
                    <li>Silinen veriler belirteceğiniz sezon adıyla salt okunur bir arşive taşınır.</li>
                    <li><strong>Not:</strong> Bu işlem, ihtiyaç halinde bu arşiv kaydından geri yüklenebilir. Ancak o zamana kadar gireceğiniz yeni veriler kaybolacaktır.</li>
                  </ul>
                </div>
              </div>

              <form onSubmit={handleArchive} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Arşivlenecek Sezon Adı</label>
                  <input
                    type="text"
                    value={archiveSeasonName}
                    onChange={(e) => setArchiveSeasonName(e.target.value)}
                    placeholder="Örn: 2023-2024 Eğitim Dönemi"
                    className="w-full rounded-2xl px-4 py-3 text-sm bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition"
                  />
                </div>
                <div className="pt-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <p className="text-xs font-bold text-rose-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Onaylamak için butona 3 sn. basılı tutun.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button type="button" onClick={() => setIsArchiveModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                      İptal
                    </button>
                    <button
                      type="button"
                      onMouseDown={startHoldArchive}
                      onMouseUp={endHoldArchive}
                      onMouseLeave={endHoldArchive}
                      onTouchStart={startHoldArchive}
                      onTouchEnd={endHoldArchive}
                      disabled={archiving || !archiveSeasonName.trim()}
                      className="relative overflow-hidden px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-rose-500/20 select-none"
                    >
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-black/30 pointer-events-none"
                        style={{ width: `${holdProgress}%`, transition: isHolding ? 'none' : 'width 0.3s ease' }}
                      />
                      <span className="relative z-10">
                        {archiving ? 'Arşivleniyor...' : (isHolding ? 'Onaylanıyor...' : 'Sezonu Arşivle ve Sıfırla')}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        requireHold={confirmModal.requireHold}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

// Tab Button Component
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
      active 
        ? 'bg-white dark:bg-slate-800 text-blue-500 shadow-sm border border-blue-100 dark:border-blue-900/50' 
        : 'text-slate-500 hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);
