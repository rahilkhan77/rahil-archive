export const SITE_URL = "https://www.rahilkhan.site";
export const PHOTO_URL = `${SITE_URL}/rahil-khan.jpg`;

export const socials = [
  { name: "X", href: "https://x.com/rxhilkhan_dev" },
  { name: "GitHub", href: "https://github.com/rahilkhan77" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/rahil-khan-6a8910377" },
  { name: "Dev.to", href: "https://dev.to/nexcodestudio" },
  { name: "Freelancer", href: "https://www.freelancer.com/u/rxhilkhan" },
] as const;

export const projects = [
  {
    name: "Viralaty",
    href: "https://www.viralaty.com",
    description:
      "Done-for-you ChatGPT ads agency for DTC, SaaS, and high-ticket brands.",
  },
  {
    name: "CodeCare",
    href: "https://codecare.si",
    description:
      "Monthly maintenance for apps you've already shipped — monitoring, fixes, and verified PRs.",
  },
  {
    name: "NEXCOD",
    href: "https://nexcod.vercel.app",
    description:
      "Web development studio that builds and fixes fast, modern sites for small businesses.",
  },
  {
    name: "SHIP90",
    href: "https://www.ship90.in",
    description:
      "90-minute builder deathmatch — same brief, AI allowed, audience picks the winner.",
  },
  {
    name: "ReviveLead",
    href: "https://revivelead-og.vercel.app",
    description: "A product for lead generation and re-engagement.",
  },
  {
    name: "Excentia",
    href: "https://excentia-one.vercel.app",
    description:
      "Full-stack studio for web products, MVP builds, and AI-integrated work.",
  },
  {
    name: "VoteMash",
    href: "https://votemash-3.vercel.app",
    description: "48-hour public product-battle league.",
  },
  {
    name: "VI System",
    href: "https://vi-system.com",
    description:
      "A course and toolkit for Indian creators to build and monetize a GTA 6 theme page.",
  },
] as const;

const personId = `${SITE_URL}/#person`;

export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": personId,
      name: "Rahil Khan",
      url: `${SITE_URL}/`,
      image: PHOTO_URL,
      jobTitle: "Full-Stack & AI Product Developer, Founder",
      email: "mailto:rxhilkhan@gmail.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Delhi",
        addressCountry: "IN",
      },
      sameAs: [
        ...socials.map((s) => s.href),
        ...projects.map((p) => p.href),
      ],
    },
    ...projects.map((p) => ({
      "@type": "Organization",
      name: p.name,
      url: p.href,
      founder: { "@id": personId },
    })),
    {
      "@type": "WebSite",
      name: "Rahil Khan",
      url: `${SITE_URL}/`,
      description:
        "Personal site of Rahil Khan, a self-taught full-stack and AI product developer and solo founder from Delhi, India.",
      publisher: { "@id": personId },
    },
  ],
};
