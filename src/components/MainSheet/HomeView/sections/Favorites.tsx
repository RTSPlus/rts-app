import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAtomValue } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

import { routesShortName } from "../../../../rts-api/routesMeta";
import { dispatch } from "../../../modals/ModalController";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";

type FavoritesItemsType = {
  type: "ROUTE";
  routeNumber: number;
  routeName: string;
  routeColor: string;
};

const storage = createJSONStorage(() => AsyncStorage);
export const favoritesItemsAtom = atomWithStorage<FavoritesItemsType[]>(
  "favorites-items",
  [],
  storage
);

function RouteCircleItem(props: {
  routeNumber: number;
  routeName: string;
  routeColor: string;
}) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: "column",
        alignItems: "center",
        marginRight: 16,
        width: 80,
      }}
      onPress={() => {
        dispatch({
          event: "OPEN_ROUTE",
          payload: { routeNumber: props.routeNumber },
        });
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          backgroundColor: props.routeColor,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 24,
            fontWeight: "700",
          }}
        >
          {props.routeNumber}
        </Text>
      </View>
      <Text
        style={{ marginTop: 6, fontSize: 15, textAlign: "center" }}
        numberOfLines={2}
      >
        {routesShortName.has(props.routeNumber)
          ? routesShortName.get(props.routeNumber)
          : props.routeName}
      </Text>
    </TouchableOpacity>
  );
}

export default function Favorites() {
  const favoritesItem = useAtomValue(favoritesItemsAtom);

  const favoritesComponents = favoritesItem.map((item) => {
    if (item.type === "ROUTE") {
      return (
        <RouteCircleItem
          key={`route-${item.routeNumber}`}
          routeName={item.routeName}
          routeColor={item.routeColor}
          routeNumber={item.routeNumber}
        />
      );
    }
  });

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Favorites</Text>
      <BottomSheetScrollView
        horizontal
        contentContainerStyle={styles.sectionBodyContainer}
        style={styles.sectionBody}
      >
        {favoritesComponents}
      </BottomSheetScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  sectionContainer: {
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(0,0,0,0.6)",
  },

  sectionBodyContainer: {
    backgroundColor: "white",

    alignItems: "center",
    flexDirection: "row",
    height: 140,
  },
  sectionBody: {
    borderRadius: 10,
    backgroundColor: "white",

    marginTop: 12,
    paddingLeft: 12,
  },
});
