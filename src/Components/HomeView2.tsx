import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { View, Text, TextInput, StyleSheet } from "react-native";

import { colors } from "../colors";

export default function HomeView2() {
  return (
    <BottomSheetView style={styles.container}>
      <BottomSheetView style={styles.searchRowContainer}>
        <BottomSheetView style={styles.searchBarContainer}>
          <Ionicons
            style={styles.searchBarIcon}
            name="ios-search-outline"
            size={20}
            color={colors.ios.light.gray["1"].toRgbString()}
          />
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search stops, routes, and places"
            placeholderTextColor={colors.ios.light.gray["1"].toRgbString()}
          />
        </BottomSheetView>
        <View
          style={{
            width: 32,
            height: 32,
            backgroundColor: "red",
            marginLeft: 16,
          }}
        />
      </BottomSheetView>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchRowContainer: {
    flexDirection: "row",
    width: "100%",
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ios.light.gray["5"]
      .clone()
      .setAlpha(0.9)
      .toRgbString(),
    borderRadius: 8,
    height: 36,
    paddingHorizontal: 4,
  },
  searchBarIcon: {
    marginRight: 6,
    marginLeft: 6,
  },
  searchBarInput: {
    fontSize: 16,
  },
});
