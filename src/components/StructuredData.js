export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "BankOrCreditUnion",
    name: "Beltrust Bank",
    alternateName: "Beltrust",
    url: "https://beltrustbank.com",
    logo: "https://beltrustbank.com/icon-512x512.png",
    description:
      "Beltrust Bank offers checking and savings accounts, cards, loans, transfers, and crypto trading — all secured with bank-grade encryption.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "beltrusts@outlook.com",
      contactType: "customer service",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
}