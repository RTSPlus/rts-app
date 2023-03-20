import { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { colors } from "../../colors";

const SearchItem = () => {
  return (
    <TouchableOpacity style={styles.searchItem}>
      {/* Placeholder icon */}
      <View
        style={{
          height: 32,
          width: 32,
          backgroundColor: "red",
          borderRadius: 16,
        }}
      />
      <View style={styles.searchItemContent}>
        <Text style={styles.searchItemTitle}>Title</Text>
        <Text style={styles.searchItemDesc}>Description</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function SearchViewBody() {
  return (
    <>
      <View style={styles.topDivider} />
      <BottomSheetScrollView contentContainerStyle={styles.scrollView}>
        {Array(15)
          .fill(0)
          .map((item, index) => (
            <>
              <SearchItem key={index} />
              <View style={styles.searchItemDivider} />
            </>
          ))}
      </BottomSheetScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  topDivider: {
    width: "100%",
    height: 1,
    marginTop: 16,
    backgroundColor: colors.ios.light.gray["5"].toRgbString(),
  },
  scrollView: {
    marginHorizontal: 16,
  },
  searchItemDivider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.ios.light.gray["5"].toRgbString(),
  },
  searchItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  searchItemContent: {
    marginLeft: 16,
    flex: 1,
  },
  searchItemTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchItemDesc: {
    fontSize: 14,
    color: colors.ios.light.gray["1"].toRgbString(),
  },
});
