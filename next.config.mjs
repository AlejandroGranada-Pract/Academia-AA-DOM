/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Subida de imágenes a lecciones (límite del action; el tamaño real se valida aparte).
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
