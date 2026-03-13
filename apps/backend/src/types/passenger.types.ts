export enum PassengerType {
  ADULT = 'adult',
  CHILD = 'child',
  INFANT = 'infant',
  SENIOR = 'senior',
}

export enum AssistanceType {
  WHEELCHAIR = 'wheelchair',
  VISUAL_IMPAIRMENT = 'visual_impairment',
  HEARING_IMPAIRMENT = 'hearing_impairment',
  MOBILITY_AID = 'mobility_aid',
  OTHER = 'other',
}

export interface PassengerDetail {
  type: PassengerType;
  age: number;
  name?: string; // Optional for logged-in users who want to specify
  requiresAssistance: boolean;
  assistanceType?: AssistanceType;
  specialNeeds?: string; // Additional notes
  seatPreference?: string; // Window, aisle, etc.
  mealPreference?: string; // Regular, vegetarian, etc.
}

export interface PassengerDetails {
  totalCount: number;
  passengers: PassengerDetail[];
  summary: {
    adultCount: number;
    childCount: number;
    infantCount: number;
    seniorCount: number;
    requiresAssistanceCount: number;
  };
}
