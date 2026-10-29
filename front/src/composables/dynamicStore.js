import storeMap from "src/stores/map";

export const useDynamicStore = (store) => {
  return storeMap[store];
};
