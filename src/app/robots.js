export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/security", "/pricing", "/contact", "/terms", "/privacy"],
        disallow: ["/dashboard", "/accounts", "/transfers", "/cards", "/loans", "/crypto", "/bill-pay", "/settings", "/admin", "/api", "/login", "/register"],
      },
    ],
    sitemap: "https://beltrustbank.com/sitemap.xml",
  };
}