import re

with open("frontend/src/pages/Ayarlar.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the form with the new layout
old_form_start = '<form onSubmit={handleBulkSend} className="max-w-4xl mx-auto neo-card rounded-3xl p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">'
new_layout_start = """<div className="flex flex-col md:flex-row gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
        <form onSubmit={handleBulkSend} className="neo-card md:w-2/3 rounded-3xl p-6 sm:p-8 flex flex-col h-fit">"""

content = content.replace(old_form_start, new_layout_start)

# Add the right column
old_form_end = """              </button>
            </div>
          </div>
        </form>
      )}

    </div>"""

new_right_col = """              </button>
            </div>
          </div>
        </form>

        {/* SAĞ KOLON: Seçilenler Listesi */}
        <div className="neo-card md:w-1/3 rounded-3xl p-6 flex flex-col h-fit max-h-[600px]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10 dark:border-white/5 shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-500/10 text-sky-500">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Seçilen Alıcılar</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {targetType === 'tumu' ? 'Tüm liste hedefleniyor' : `${selectedTarget.length} alıcı seçildi`}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
            {targetType === 'tumu' ? (
              <div className="p-4 bg-sky-500/10 text-sky-700 dark:text-sky-400 rounded-2xl text-center text-sm font-bold border border-sky-500/20">
                Sistemdeki tüm aktif öğrencilere mesaj gönderilecek.
              </div>
            ) : selectedTarget.length === 0 ? (
              <div className="py-8 text-slate-400 text-center text-sm italic border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                Henüz seçim yapılmadı. Yandan alıcıları seçiniz.
              </div>
            ) : (
              selectedTarget.map(idOrName => {
                let label = idOrName;
                if (targetType === 'kisi') {
                  const student = ogrenciler.find(o => String(o.id) === String(idOrName));
                  if (student) label = `${student.isim} ${student.soyisim}`;
                }
                return (
                  <div key={idOrName} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      )}

    </div>"""

content = content.replace(old_form_end, new_right_col)

with open("frontend/src/pages/Ayarlar.jsx", "w", encoding="utf-8") as f:
    f.write(content)
