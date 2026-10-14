// TypeScript interfaces for Attention Timeline

export interface FirstAppearance {
  date: string;
  precision: 'day' | 'month' | 'year';
  event: string;
  primary_url: string;
}

export interface OtherDate {
  label: string;
  date: string;
  url: string;
}

export interface MechanismMetrics {
  compute_prefill: string;
  kv_cache_per_token: string;
  long_range_exactness: string;
  hardware_friendliness: string;
}

export interface Mechanism {
  id: string;
  name: string;
  first_appearance: FirstAppearance;
  other_dates?: OtherDate[];
  authors_org: string;
  responds_to: string[];
  pressure: string;
  mechanism: string;
  what_it_buys: string[];
  what_it_gives_up: string[];
  choose_when: string[];
  avoid_when: string[];
  next_pressure: string[];
  tags: string[];
  date_status: 'VERIFIED' | 'UNVERIFIED' | 'DISPUTED';
  verified_on: string;
  verification_note: string;
  figure: string;
  metrics: MechanismMetrics;
}

export type MechanismFilterTag =
  | 'all'
  | 'compute'
  | 'decode-memory'
  | 'position'
  | 'long-context'
  | 'recurrent-state'
  | 'sparsity'
  | 'compression'
  | 'hybrid';
