export const MODAL_ID = {
  SAMPLE1: 'sample1',
  SAMPLE2: 'sample2',
  CREATE_COLLECTION: 'create-collection',
} as const;

export type ModalId = (typeof MODAL_ID)[keyof typeof MODAL_ID];
