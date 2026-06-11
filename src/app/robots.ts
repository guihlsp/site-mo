import type { MetadataRoute } from "next";

// Presente íntimo: bloqueia indexação por buscadores.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
