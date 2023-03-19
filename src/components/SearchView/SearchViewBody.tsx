import { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";

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
          borderRadius: "100%",
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
  const testList = [
    {
      title: "Test 1",
    },
    {
      title: "Test 2",
    },
  ];

  return (
    <BottomSheetView style={{ flex: 1 }}>
      <View style={styles.topDivider} />
      <BottomSheetScrollView style={{ flex: 1 }}>
        {testList.map((item, index) => (
          <SearchItem key={index} />
        ))}
      </BottomSheetScrollView>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  topDivider: {
    width: "100%",
    height: 1,
    marginTop: 16,
    backgroundColor: colors.ios.light.gray["5"].toRgbString(),
  },
  searchItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.ios.light.gray["5"].toRgbString(),
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
