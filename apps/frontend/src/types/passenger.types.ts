// Mirror backend passenger enums and types for booking form

export const PassengerType = {
  ADULT: 'adult',
  CHILD: 'child',
  INFANT: 'infant',
  SENIOR: 'senior',
} as const;
export type PassengerType = (typeof PassengerType)[keyof typeof PassengerType];

export const AssistanceType = {
  WHEELCHAIR: 'wheelchair',
  VISUAL_IMPAIRMENT: 'visual_impairment',
  HEARING_IMPAIRMENT: 'hearing_impairment',
  MOBILITY_AID: 'mobility_aid',
  OTHER: 'other',
} as const;
export type AssistanceType = (typeof AssistanceType)[keyof typeof AssistanceType];

export interface PassengerDetail {
  type: PassengerType;
  name?: string;
  requiresAssistance: boolean;
  assistanceType?: AssistanceType;
  specialNeeds?: string;
  seatPreference?: string;
  mealPreference?: string;
}

export interface PassengerSummary {
  adultCount: number;
  childCount: number;
  infantCount: number;
  seniorCount: number;
  requiresAssistanceCount: number;
}
