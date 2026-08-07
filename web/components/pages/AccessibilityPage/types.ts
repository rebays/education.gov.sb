import type { Page } from '../Page/types';

export type AccessibilityAtAGlancePoint = {
  id: string;
  blockType: 'CharBlock';
  value: string;
};

export type AccessibilityPage = Page & {
  __typename: 'AccessibilityPage';
  lead: string;
  atAGlance: AccessibilityAtAGlancePoint[];
  body: string;
  conformanceTarget: string;
  effectiveDate: string | null;
  lastReviewed: string | null;
  contactEmail: string;
};
