import React from 'react';
import { Calendar, Minimize2, Maximize2, Trash2, Clock, User } from 'lucide-react';

export const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export const getStyleForRenk = (renk) => {
  const styles = {
    indigo: 'bg-indigo-950/40 text-indigo-100 border-indigo-500/30 hover:border-indigo-400',
    emerald: 'bg-emerald-950/40 text-emerald-100 border-emerald-500/30 hover:border-emerald-400',
    amber: 'bg-amber-950/40 text-amber-100 border-amber-500/30 hover:border-amber-400',
    purple: 'bg-purple-950/40 text-purple-100 border-purple-500/30 hover:border-purple-400',
    sky: 'bg-sky-950/40 text-sky-100 border-sky-500/30 hover:border-sky-400',
    rose: 'bg-rose-950/40 text-rose-100 border-rose-500/30 hover:border-rose-400',
    green: 'bg-green-950/40 text-green-100 border-green-500/30 hover:border-green-400',
    yellow: 'bg-yellow-950/40 text-yellow-100 border-yellow-500/30 hover:border-yellow-400',
    red: 'bg-red-950/40 text-red-100 border-red-500/30 hover:border-red-400'
  };
  return styles[renk] || styles.indigo;
};

const HaftalikDersCizelgesi = ({
  dersProgrami,
  expandedGun,
  setExpandedGun,
  selectedSinifId,
  setSelectedSinifId,
  handleDeleteDers,
  readonly = false
}) => {
  return (
    <>
    {/* HAFTALIK DERS PROGRAMI SEKSİYONU */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-xl p-6 space-y-4 text-slate-800 dark:text-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0284c7]" />
            <span>Haftalık Ders Çizelgesi</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Güne tıklayarak sütunu yatayda genişletip tüm detayları okuyabilirsiniz.
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-2.5 pt-2 w-full items-stretch transition-all duration-500 ease-in-out">
          {GUNLER.map(gun => {
            const isExpanded = expandedGun === gun;
            const gunDersleri = dersProgrami.filter(d => d.gun === gun);
            gunDersleri.sort((a, b) => (a.baslangic_saati || '').localeCompare(b.baslangic_saati || ''));

            const timeGroups = {};
            gunDersleri.forEach(ders => {
              const key = ders.baslangic_saati || '00:00';
              if (!timeGroups[key]) timeGroups[key] = [];
              timeGroups[key].push(ders);
            });

            const hasDers = Object.keys(timeGroups).length > 0;

            return (
              <div
                key={gun}
                onClick={() => setExpandedGun(isExpanded ? null : gun)}
                className={`group rounded-2xl border p-2.5 min-h-[170px] flex flex-col space-y-2 cursor-pointer transition-all duration-500 ease-in-out min-w-0 ${
                  isExpanded
                    ? 'lg:flex-[3] bg-gradient-to-b from-sky-50/90 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-sky-400 dark:border-sky-500/80 ring-2 ring-[#0284c7]/50 shadow-2xl z-10'
                    : expandedGun !== null
                    ? 'lg:flex-[0.65] bg-slate-50/80 dark:bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100'
                    : 'lg:flex-1 bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/50 hover:border-sky-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-1.5">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isExpanded ? 'text-[#0284c7] dark:text-sky-400 font-extrabold text-sm' : 'text-slate-600 dark:text-slate-400'}`}>
                    {gun}
                  </span>
                  <div className="flex items-center gap-1">
                    {isExpanded ? (
                      <span className="text-[9px] font-extrabold bg-[#0284c7] text-white px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                        <Minimize2 className="w-3 h-3" /> Geniş
                      </span>
                    ) : (
                      <span className="text-slate-400 hover:text-[#0284c7] opacity-0 group-hover:opacity-100 transition p-0.5">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-2.5 pt-0.5">
                  {!hasDers ? (
                    <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-600 text-[11px] font-medium py-6 italic text-center">
                      Ders Yok
                    </div>
                  ) : (
                    Object.entries(timeGroups).map(([time, dersler]) => (
                      <div key={time} className="flex flex-row gap-1.5 w-full">
                        {dersler.map(ders => {
                          const isSelected = selectedSinifId === ders.sinif_id.toString();
                          const cardStyle = getStyleForRenk(ders.renk);
                          return (
                            <div
                              key={ders.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (setSelectedSinifId && ders.sinif_id) {
                                  setSelectedSinifId(ders.sinif_id.toString());
                                }
                                setExpandedGun(gun);
                              }}
                              className={`group/card relative rounded-xl border cursor-pointer transition-all duration-300 transform hover:scale-[1.02] shadow-md flex-1 min-w-0 ${
                                isExpanded ? 'p-3' : 'p-2'
                              } ${cardStyle} ${
                                isSelected ? 'ring-2 ring-emerald-500 ring-offset-1 ring-offset-slate-100 dark:ring-offset-slate-900' : ''
                              }`}
                            >
                              {!readonly && (
                                <button
                                  onClick={(e) => handleDeleteDers(e, ders.id)}
                                  className="absolute top-1 right-1 opacity-0 group-hover/card:opacity-100 text-red-500 dark:text-red-300 hover:text-red-700 dark:hover:text-red-100 p-0.5 rounded transition cursor-pointer z-10"
                                  title="Dersi Sil"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}

                              {/* Ders / Sınıf Adı */}
                              <div className={`font-extrabold tracking-tight pr-4 ${isExpanded ? 'text-sm whitespace-normal' : 'text-[11px] truncate'}`}>
                                {ders.ders_adi || ders.sinif_adi}
                              </div>

                              {/* Saat */}
                              <div className={`font-medium opacity-90 mt-1 flex items-center gap-1 ${isExpanded ? 'text-xs' : 'text-[10px]'}`}>
                                <Clock className="w-3 h-3 opacity-75 shrink-0" />
                                <span className={isExpanded ? 'whitespace-normal font-bold' : 'truncate'}>
                                  {isExpanded ? `${ders.baslangic_saati} - ${ders.bitis_saati}` : ders.baslangic_saati}
                                </span>
                              </div>

                              {/* Öğretmen */}
                              {ders.ogretmen_adi && (
                                <div className={`opacity-75 mt-0.5 flex items-center gap-1 ${isExpanded ? 'text-xs font-semibold' : 'text-[9px]'}`}>
                                  <User className="w-2.5 h-2.5 opacity-70 shrink-0" />
                                  <span className={isExpanded ? 'whitespace-normal' : 'truncate'}>{ders.ogretmen_adi}</span>
                                </div>
                              )}

                              {/* Sınıf Bilgisi & Seçili Rozeti */}
                              <div className="mt-1.5 flex justify-between items-center text-[10px] font-semibold opacity-80 pt-1 border-t border-slate-900/10 dark:border-white/10">
                                <span className={isExpanded ? 'whitespace-normal font-bold' : 'truncate'}>{ders.sinif_adi}</span>
                                {isSelected && (
                                  <span className="bg-emerald-500 text-white dark:text-slate-950 font-black px-1.5 py-0.5 rounded text-[8px] shrink-0 ml-1 shadow-sm">
                                    SEÇİLİ
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default HaftalikDersCizelgesi;
