export interface Product {
  id: string;
  price: number;
  brand?: string;
  category?: string;
  quantity: number;
  currency?: string;
}

export interface Event {
  client: number;
  instance: number;
  event: string;
  href: string;
  pageTitle: string;
  pageDescription?: string;
  pageImage?: string;
  pageType?: string;
  referrer?: string;
  timestamp: string;
  did: string;
  session: string;
  gdpr?: string;
  order?: string;
  products?: Product[];
  target?: string;
  oldId?: string;
  newId?: string;
  ExternalIdtype?: string;
  ExternalId?: string;
  userAgent?: string;
  ip?: string;
  topics?: number[];
}
