/* ============================================================
   Stimuler · onboarding content — languages
   Native-language list + in-language app-language descriptions.
   Classic script: top-level consts are shared with the files
   that load after this one; content/index.js assembles the
   window.CONTENT export.
   ============================================================ */

'use strict';

/* ---------- 1 · languages ----------
   This build ships everywhere EXCEPT India, Indonesia, LatAm and the
   USA (each has its own funnel) — so the list leads with Europe and
   covers the rest-of-world markets, not Bahasa/Hindi/LatAm Spanish. */
const LANGUAGES = [
  { value: 'fr', label: 'Français',    flag: 'fr', cc: '+33'  },
  { value: 'de', label: 'Deutsch',     flag: 'de', cc: '+49'  },
  { value: 'es', label: 'Español',     flag: 'es', cc: '+34'  },
  { value: 'it', label: 'Italiano',    flag: 'it', cc: '+39'  },
  { value: 'pt', label: 'Português',   flag: 'pt', cc: '+351' },
  { value: 'tr', label: 'Türkçe',      flag: 'tr', cc: '+90'  },
  { value: 'vi', label: 'Tiếng Việt',  flag: 'vn', cc: '+84'  },
  { value: 'ar', label: 'العربية',      flag: 'sa', cc: '+966' },
];

/* the "change app language" description, in-language */
const APPLANG_DESC = {
  fr: 'Vous apprendrez dans votre langue.',
  de: 'Du lernst in deiner eigenen Sprache.',
  es: 'Aprenderás en tu propio idioma.',
  it: 'Imparerai nella tua lingua.',
  pt: 'Vai aprender na sua própria língua.',
  tr: 'Kendi dilinde öğreneceksin.',
  vi: 'Bạn sẽ học bằng ngôn ngữ của mình.',
  ar: 'ستتعلم بلغتك الأم.',
};
