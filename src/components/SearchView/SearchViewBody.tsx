import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { Fragment } from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

import { googleAutocomplete } from "./googleAutocompleteAPI";
import { colors } from "../../colors";
import useDebounce from "../../utils/useDebounce";

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

const GoogleAutocompleteSearchItem = (props: { description: string }) => {
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

type Props = {
  searchQuery: string;
};

export default function SearchViewBody(props: Props) {
  const debouncedSearchQuery = useDebounce(props.searchQuery, 200);

  const { data: googleAutocompleteResults } = useQuery({
    queryKey: ["googleAutocomplete", debouncedSearchQuery],
    queryFn: () => googleAutocomplete(debouncedSearchQuery),
    enabled: debouncedSearchQuery.length > 0,
  });

  return (
    <>
      <View style={styles.topDivider} />
      <BottomSheetScrollView contentContainerStyle={styles.scrollView}>
        {googleAutocompleteResults?.map((item, index) => (
          <GoogleAutocompleteSearchItem
            key={index}
            description={item.description}
          />
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
