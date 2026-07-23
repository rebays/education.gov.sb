import type { Page } from '../Page/types';

type Image = {
  id: string;
  title: string;
  url: string;
  width: number;
  height: number;
};

export type PillarBlock = {
  id: string;
  blockType: 'PillarBlock';
  title: string;
  text: string;
  icon: string;
};

type FieldBlockBase = {
  id: string;
  fieldLabel: string;
  placeholder: string;
};

export type TextFieldBlock = FieldBlockBase & {
  blockType: 'TextFieldBlock';
};

export type EmailFieldBlock = FieldBlockBase & {
  blockType: 'EmailFieldBlock';
};

export type MultilineTextFieldBlock = FieldBlockBase & {
  blockType: 'MultilineTextFieldBlock';
};

export type DropdownFieldBlock = {
  id: string;
  blockType: 'DropdownFieldBlock';
  fieldLabel: string;
  options: string[];
};

export type ContactFormField =
  | TextFieldBlock
  | EmailFieldBlock
  | MultilineTextFieldBlock
  | DropdownFieldBlock;

export type AboutPage = Page & {
  __typename: 'AboutPage';
  lead: string;
  purposeHeading: string;
  purposeBody: string;
  purposeImage: Image | null;
  pillars: PillarBlock[];
  supportHeading: string;
  supportBody: string;
  supportEmail: string;
  contactFormHeading: string;
  contactFormIntro: string;
  contactFormFields: ContactFormField[];
  contactFormSubmitText: string;
};
