import AsyncStorage from "@react-native-async-storage/async-storage";

import { queryClient } from "../QueryManager";

const STORAGE_KEY_PREFIX = "map-preference";

const VIEWING_ROUTES_KEY = `${STORAGE_KEY_PREFIX}-viewing-routes`;
const VIEWING_ROUTES_DEFAULT = [1, 2, 3];
export const readViewingRoutes = () => {
  return new Promise<Set<number>>(async (res, rej) => {
    AsyncStorage.getItem(VIEWING_ROUTES_KEY)
      .then((value) => {
        res(
          new Set(value !== null ? JSON.parse(value) : VIEWING_ROUTES_DEFAULT)
        );
      })
      .catch(rej);
  });
};

export const addViewingRoute = (routeNum: number) => {
  return new Promise<Set<number>>(async (res, rej) => {
    try {
      const value = await AsyncStorage.getItem(VIEWING_ROUTES_KEY);
      const viewingRoutes = new Set<number>(
        value !== null ? JSON.parse(value) : VIEWING_ROUTES_DEFAULT
      );
      viewingRoutes.add(routeNum);

      await AsyncStorage.setItem(
        VIEWING_ROUTES_KEY,
        JSON.stringify(Array.from(viewingRoutes))
      );
      queryClient.invalidateQueries({ queryKey: ["viewingRoutes"] });

      res(viewingRoutes);
    } catch (err) {
      rej(err);
    }
  });
};

export const deleteViewingRoute = (routeNum: number) => {
  return new Promise<Set<number>>(async (res, rej) => {
    try {
      const value = await AsyncStorage.getItem(VIEWING_ROUTES_KEY);
      const viewingRoutes = new Set<number>(
        value !== null ? JSON.parse(value) : VIEWING_ROUTES_DEFAULT
      );
      viewingRoutes.delete(routeNum);

      await AsyncStorage.setItem(
        VIEWING_ROUTES_KEY,
        JSON.stringify(Array.from(viewingRoutes))
      );
      queryClient.invalidateQueries({ queryKey: ["viewingRoutes"] });

      res(viewingRoutes);
    } catch (err) {
      rej(err);
    }
  });
};
