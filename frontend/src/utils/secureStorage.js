import CryptoJS from 'crypto-js';

const SECRET_KEY = 'bb_secure_key_2026';

export const secureStorage = {
  setItem: (key, value) => {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const encrypted = CryptoJS.AES.encrypt(stringValue, SECRET_KEY).toString();
      localStorage.setItem(key, encrypted);
    } catch (e) {
      console.error('Error encrypting local storage data', e);
    }
  },
  
  getItem: (key) => {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      
      // Try decrypting
      const decrypted = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY);
      const originalText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!originalText) {
        // If decryption fails, it might be unencrypted legacy data
        return encryptedValue;
      }
      
      return originalText;
    } catch (e) {
      // Fallback for legacy unencrypted data
      return localStorage.getItem(key);
    }
  },

  removeItem: (key) => {
    localStorage.removeItem(key);
  }
};
