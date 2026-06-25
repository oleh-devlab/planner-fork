
export type resourceType = 'room' | 'person' | 'equipment' | 'service' | 'other';

export interface Resource {
    id: string;
    name: string;
    type: resourceType;
    details?: { description?: string; image?: string; [key: string]: unknown };
}