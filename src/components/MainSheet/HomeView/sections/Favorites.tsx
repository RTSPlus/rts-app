import { atom, useAtomValue } from "jotai";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

import { colors } from "../../../../colors";
import { dispatch } from "../../../modals/ModalController";

type FavoritesItemsType = {
  type: "ROUTE";
  routeNumber: number;
  routeName: string;
  routeColor: string;
};
export const favoritesItemsAtom = atom<FavoritesItemsType[]>([]);

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
      <Text style={{ marginTop: 6, fontSize: 15 }}>{props.routeName}</Text>
      <Text
        style={{
          fontSize: 13,
          color: colors.ios.light.gray["2"].toRgbString(),
        }}
      >
        5 mins
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
      <View style={styles.sectionBody}>{favoritesComponents}</View>
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

  sectionBody: {
    marginTop: 12,

    height: 140,
    borderRadius: 10,
    backgroundColor: "white",

    alignItems: "center",
    flexDirection: "row",

    paddingLeft: 16,
  },
});
