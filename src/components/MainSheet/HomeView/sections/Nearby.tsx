import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

import { colors } from "../../../../colors";
import { dispatch } from "../../../modals/ModalController";

function RouteCircleItem() {
  return (
    <>
      <TouchableOpacity
        style={{
          flexDirection: "column",
          alignItems: "center",
        }}
        onPress={() => {
          dispatch({ event: "OPEN_ROUTE", payload: { routeNumber: 21 } });
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            backgroundColor: colors.ios.light.red.toRgbString(),
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
            21
          </Text>
        </View>
        <Text style={{ marginTop: 6, fontSize: 15 }}>Route 21</Text>
        <Text
          style={{
            fontSize: 13,
            color: colors.ios.light.gray["2"].toRgbString(),
          }}
        >
          5 mins
        </Text>
      </TouchableOpacity>
    </>
  );
}

export default function Nearby() {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Nearby</Text>
      <View style={styles.sectionBody}>
        <RouteCircleItem />
        <View style={{ width: 30 }} />
        <RouteCircleItem />
        <View style={{ width: 20 }} />
        <RouteCircleItem />
      </View>
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
    // Remove
    paddingLeft: 18,
  },
});
