export const CONTACT_METHODS = ['Line', 'Whats App', 'Kakao', 'Phone'] as const;

export const CONTACT_METHOD_FIELD_MAP = {
  Line: 'line',
  'Whats App': 'whatsapp',
  Kakao: 'kakao',
  Phone: 'phone',
} as const;

export const CONTACT_PLACEHOLDER_MAP = {
  Line: 'Line ID',
  'Whats App': 'WhatsApp Phone Number',
  Kakao: 'Kakao ID',
  Phone: 'Phone Number',
} as const;

export type ContactMethod = (typeof CONTACT_METHODS)[number];
export type ContactField = (typeof CONTACT_METHOD_FIELD_MAP)[ContactMethod];
