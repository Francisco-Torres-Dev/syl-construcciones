export type Service = {
  id: string; slug: string; name: string; summary: string; description: string; scope: string;
  includes: string[]; faqs: { q: string; a: string }[]; info: string | null; published: boolean; sortOrder: number; categoryId: string;
};
export type Category = { id: string; slug: string; name: string; description: string; services: Service[] };
export type Settings = {
  businessName: string; email: string; phone: string; whatsapp: string; coverage: string[]; hours: string; about: string;
  social: { instagram: string; facebook: string; linkedin: string }; emailIsProvisional: boolean;
};
export type User = { id: string; email: string; name: string; phone: string | null; role: 'CLIENT' | 'ADMIN'; emailVerified: boolean };
export type Project = { id: string; slug: string; title: string; category: string; description: string; isDemo: boolean; published: boolean; images: { id: string; alt: string }[] };
