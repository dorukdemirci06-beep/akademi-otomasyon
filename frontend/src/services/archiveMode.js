export const setArchiveData = (sezonAdi, parsedData) => {
  sessionStorage.setItem('archiveMode_sezonAdi', sezonAdi);
  sessionStorage.setItem('archiveMode_data', JSON.stringify(parsedData));
  window.dispatchEvent(new Event('archiveModeChanged'));
};

export const clearArchiveData = () => {
  sessionStorage.removeItem('archiveMode_sezonAdi');
  sessionStorage.removeItem('archiveMode_data');
  window.dispatchEvent(new Event('archiveModeChanged'));
};

export const getArchiveData = () => {
  try {
    const data = sessionStorage.getItem('archiveMode_data');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const getArchiveSezonAdi = () => {
  return sessionStorage.getItem('archiveMode_sezonAdi');
};

export const isArchiveMode = () => {
  const data = sessionStorage.getItem('archiveMode_data');
  return !!data && data !== "undefined" && data !== "null";
};
