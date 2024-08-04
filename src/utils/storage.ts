export const setItem = (key: string, value: string): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

export const getItem = (key: string): string | null => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

export const removeItem = (key: string): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(key);
  }
};