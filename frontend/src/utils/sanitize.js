/**
 * Metin girdilerindeki zararlı HTML / Script etiketlerini (XSS) temizleyen yardımcı fonksiyon.
 * @param {string} str - Temizlenecek metin
 * @returns {string} - Güvenli hale getirilmiş metin
 */
export const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Kullanıcı metin girdilerini kırpar ve güvenli hale getirir.
 * @param {string} str 
 * @returns {string}
 */
export const cleanText = (str) => {
  if (!str) return '';
  return str.trim();
};
