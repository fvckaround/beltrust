export default function sitemap() {
  const baseUrl = "https://beltrustbank.com";

  const routes = ["", "/about", "/security", "/pricing", "/contact", "/terms", "/privacy"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: route === "" ? 1 : 0.7,
    })
  );

  return routes;
}