import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  debug: true,
  lng: 'pl',
  resources: {
    en: {
      common: require('./locales/en/common.json'),
      fields1: require('./locales/en/forms-fields1.json'),
      backoffice: require('./locales/en/backoffice.json')
    },
    pl: {
      common: require('./locales/pl/common.json'),
      fields1: require('./locales/pl/forms-fields1.json'),
      backoffice: require('./locales/pl/backoffice.json')
    },
    ua: {
      common: require('./locales/ua/common.json'),
      fields2: require('./locales/ua/forms-fields2.json')
    }
  },
  ns: ['common','fields1'],
  defaultNS: 'common'
});

i18n.languages = ['en', 'pl', 'ua'];

export default i18n;