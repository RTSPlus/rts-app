import AsyncStorage from "@react-native-async-storage/async-storage";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

const STORAGE_KEY_PREFIX = "map-preference";

const storage = createJSONStorage(() => AsyncStorage);
export const viewingRoutesAtom = atomWithStorage<number[]>(
  `${STORAGE_KEY_PREFIX}-viewing-routes`,
  [1, 2, 3],
  storage
);
