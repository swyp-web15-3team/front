export const MODAL_ID = {
  SAMPLE1: 'sample1',
  SAMPLE2: 'sample2',
  CREATE_COLLECTION: 'create-collection',
  RENAME_COLLECTION: 'rename-collection',
  SEARCH: 'search',
  ADD_PLANNER_ITEM: 'add-planner-item',
  ADD_COLLECTION_ITEM: 'add-collection-item',
  COLLECTION_MENU: 'collection-menu',
} as const;

export type ModalId = (typeof MODAL_ID)[keyof typeof MODAL_ID];
