export const MODAL_ID = {
  SAMPLE: 'sample',
} as const;

export type ModalId = (typeof MODAL_ID)[keyof typeof MODAL_ID];
