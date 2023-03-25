import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Fragment } from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import { colors } from "../../colors";
import Icon from "react-native-vector-icons/FontAwesome";

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

const GoogleAutocompleteSearchItem = (props: any) => {
  return (
    <TouchableOpacity style={styles.searchItem}>
      {/* Placeholder icon */}
      <Icon
        name="map-marker"
        size={35}
        color="black"
        style={{ alignItems: "center" }}
      />
      <View style={styles.searchItemContent}>
        <Text>{props.description}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function SearchViewBody(props: any) {
  console.log("In search view body" + props.searchResults);
  return (
    <>
      <View style={styles.topDivider} />
      <BottomSheetScrollView contentContainerStyle={styles.scrollView}>
        {props.searchResults.map((item: { description: any }, index: any) => (
          <GoogleAutocompleteSearchItem key={index} description={item} />
        ))}
        {Array(15)
          .fill(0)
          .map((item, index) => (
            <Fragment key={index}>
              <SearchItem key={index} />
              <View style={styles.searchItemDivider} />
            </Fragment>
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
