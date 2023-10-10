const path = require('path')
const i18next = require('i18next')
const Backend = require('i18next-fs-backend')
const i18nextMiddleware = require('i18next-http-middleware')

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.resolve(__dirname, '../locales/{{lng}}.json')
    },
    fallbackLng: 'en',
    preload: ['en', 'tr']
  })

module.exports = {
  i18nextMiddleware,
  i18next
}
