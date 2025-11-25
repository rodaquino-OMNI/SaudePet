// WhatsApp Cloud API Types

export interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppEntry[];
}

export interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

export interface WhatsAppChange {
  value: WhatsAppChangeValue;
  field: string;
}

export interface WhatsAppChangeValue {
  messaging_product: string;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: WhatsAppContact[];
  messages?: WhatsAppMessage[];
  statuses?: WhatsAppStatus[];
}

export interface WhatsAppContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: WhatsAppMessageType;
  text?: { body: string };
  image?: WhatsAppMedia;
  document?: WhatsAppDocument;
  audio?: WhatsAppMedia;
  video?: WhatsAppMedia;
  sticker?: WhatsAppMedia;
  location?: WhatsAppLocation;
  interactive?: WhatsAppInteractive;
  button?: { payload: string; text: string };
  context?: { from: string; id: string };
}

export type WhatsAppMessageType =
  | 'text'
  | 'image'
  | 'document'
  | 'audio'
  | 'video'
  | 'sticker'
  | 'location'
  | 'interactive'
  | 'button'
  | 'unknown';

export interface WhatsAppMedia {
  id: string;
  mime_type: string;
  sha256: string;
  caption?: string;
}

export interface WhatsAppDocument extends WhatsAppMedia {
  filename: string;
}

export interface WhatsAppLocation {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface WhatsAppInteractive {
  type: 'button_reply' | 'list_reply';
  button_reply?: {
    id: string;
    title: string;
  };
  list_reply?: {
    id: string;
    title: string;
    description?: string;
  };
}

export interface WhatsAppStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: Array<{
    code: number;
    title: string;
  }>;
}

// Outbound message types
export interface WhatsAppOutboundMessage {
  type: 'text' | 'image' | 'document' | 'interactive' | 'template';
  text?: string;
  image?: { url: string; caption?: string };
  document?: { url: string; filename: string; caption?: string };
  interactive?: WhatsAppInteractiveMessage;
  template?: WhatsAppTemplateMessage;
}

export interface WhatsAppInteractiveMessage {
  type: 'button' | 'list';
  header?: {
    type: 'text' | 'image' | 'document';
    text?: string;
    image?: { link: string };
    document?: { link: string };
  };
  body: { text: string };
  footer?: { text: string };
  action: WhatsAppInteractiveAction;
}

export interface WhatsAppInteractiveAction {
  buttons?: Array<{
    type: 'reply';
    reply: { id: string; title: string };
  }>;
  button?: string;
  sections?: Array<{
    title?: string;
    rows: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
  }>;
}

export interface WhatsAppTemplateMessage {
  name: string;
  language: { code: string };
  components?: WhatsAppTemplateComponent[];
}

export interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters?: WhatsAppTemplateParameter[];
  sub_type?: string;
  index?: number;
}

export interface WhatsAppTemplateParameter {
  type: 'text' | 'image' | 'document' | 'video';
  text?: string;
  image?: { link: string };
  document?: { link: string; filename: string };
  video?: { link: string };
}

// Message content extraction
export interface MessageContent {
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'button' | 'list' | 'unknown';
  text?: string;
  mediaId?: string;
  mimeType?: string;
  caption?: string;
  filename?: string;
  buttonId?: string;
  buttonText?: string;
  listId?: string;
  listTitle?: string;
  latitude?: number;
  longitude?: number;
}
