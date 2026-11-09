/**
 * En desarrollo las peticiones a `/bp` se redirigen a http://localhost:3002
 * mediante `proxy.conf.json`, evitando el bloqueo de CORS del backend.
 */
export const environment = {
  production: false,
  apiBaseUrl: '/bp',
};
