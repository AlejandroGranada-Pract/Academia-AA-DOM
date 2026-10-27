/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Subida de imágenes a lecciones (límite del action; el tamaño real se valida aparte).
      bodySizeLimit: "2mb",
    },
  },
  // Cabeceras de seguridad para todas las rutas. La CSP es mínima a propósito
  // (no restringe scripts ni iframes, que usan YouTube/Vimeo/Drive): impide que
  // otros sitios enmarquen la app (clickjacking) y bloquea <base>/<object>.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
