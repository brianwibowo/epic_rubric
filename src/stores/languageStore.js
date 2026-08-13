import { create } from 'zustand';
import { TRANSLATIONS } from '@/utils/translations';

// In-memory cache for dynamic auto-translated user strings
const translationCache = new Map();

const getSavedLanguage = () => {
  try {
    const saved = localStorage.getItem('epic_lang');
    return saved === 'en' ? 'en' : 'id';
  } catch (e) {
    return 'id';
  }
};

export const useLanguageStore = create((set, get) => ({
  lang: getSavedLanguage(),

  setLanguage: (newLang) => {
    const targetLang = newLang === 'en' ? 'en' : 'id';
    try {
      localStorage.setItem('epic_lang', targetLang);
    } catch (e) {}
    set({ lang: targetLang });
  },

  // Lookup static translation key
  t: (key, fallback = '') => {
    const currentLang = get().lang;
    const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.id;
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    // Fallback to Indonesian if missing in English
    const fallbackDict = TRANSLATIONS.id;
    return fallbackDict[key] !== undefined ? fallbackDict[key] : (fallback || key);
  },

  // Dynamic auto-translator for user-generated strings (e.g. MK names, descriptions)
  // Async function with memory caching
  translateDynamic: async (text, targetLang = null) => {
    if (!text || typeof text !== 'string') return text;
    const lang = targetLang || get().lang;
    
    // If Indonesian, return original text
    if (lang === 'id') return text;

    // Check cache
    const cacheKey = `${text}_${lang}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    try {
      // Free Google Translate endpoint
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data && data[0] && data[0][0] && data[0][0][0]) {
        const translated = data[0].map(item => item[0]).join('');
        translationCache.set(cacheKey, translated);
        return translated;
      }
    } catch (e) {
      // If network fails or offline, return original text as safe fallback
    }

    return text;
  }
}));
