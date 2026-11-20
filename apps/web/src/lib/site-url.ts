/**
 * URL pública del sitio, normalizada. Tolera que NEXT_PUBLIC_SITE_URL venga sin
 * protocolo (p. ej. "midominio.com") o con barra final, para no romper el build.
 */
function normalizeSiteUrl(raw: string | undefined): string {
  const value = raw?.trim() || "http://localhost:3000";
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return new URL(withProtocol).origin;
}

export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
