import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { Fragment } from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";

import { googleAutocomplete } from "./googleAutocompleteAPI";
import { colors } from "../../../colors";
import useDebounce from "../../../utils/useDebounce";
import { dispatch as modalControllerDispatch } from "../../modals/ModalController";

const SearchItemIcons = {
  LOCATION: (
    <View
      style={{
        height: 32,
        width: 32,
        backgroundColor: colors.ios.light.red.toString(),
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons
        name="ios-pin"
        size={22}
        color="white"
        style={{ transform: [{ translateX: 1.25 }] }}
      />
    </View>
  ),
  PLACEHOLDER: (
    <View
      style={{
        height: 32,
        width: 32,
        backgroundColor: colors.ios.light.blue.toString(),
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons
        name="ios-pin"
        size={22}
        color="white"
        style={{ transform: [{ translateX: 1.25 }] }}
      />
    </View>
  ),
} as const;

const SearchItem = (props: {
  title: string;
  description: string;
  icon: (typeof SearchItemIcons)[keyof typeof SearchItemIcons];
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity style={styles.searchItem} onPress={props.onPress}>
      {/* Placeholder icon */}
      {props.icon}
      <View style={styles.searchItemContent}>
        <Text style={styles.searchItemTitle}>{props.title}</Text>
        <Text style={styles.searchItemDesc}>0.5mi · {props.description}</Text>
      </View>
    </TouchableOpacity>
  );
};

type Props = {
  searchQuery: string;
};

export default function SearchViewBody(props: Props) {
  const debouncedSearchQuery = useDebounce(props.searchQuery, 200);

  const googleAutocompleteResults = [];
  // const { data: googleAutocompleteResults } = useQuery({
  //   queryKey: ["googleAutocomplete", debouncedSearchQuery],
  //   queryFn: () => googleAutocomplete(debouncedSearchQuery),
  //   enabled: debouncedSearchQuery.length > 0,
  // });

  const results: { item: JSX.Element; key: string }[] = [
    // Google autocomplete items
    ...(googleAutocompleteResults ?? []).map((item) => ({
      key: item.place_id,
      item: (
        <SearchItem
          title={item.terms[0].value}
          description={`${item.terms[1]?.value ?? "empty"}, ${
            item.terms[2]?.value ?? "empty"
          }`}
          icon={SearchItemIcons.LOCATION}
        />
      ),
    })),

    // Placeholder items
    ...Array(debouncedSearchQuery.length)
      .fill(0)
      .map((item, index) => ({
        key: index.toString(),
        item: (
          <SearchItem
            title="Title"
            description="description"
            icon={SearchItemIcons.PLACEHOLDER}
            onPress={() => {
              modalControllerDispatch({
                event: "OPEN_DESTINATION",
                payload: "test",
              });
            }}
          />
        ),
      })),
  ];

  return (
    <>
      <View style={styles.topDivider} />
      <BottomSheetScrollView contentContainerStyle={styles.scrollView}>
        {results.map((item) => (
          <Fragment key={item.key}>
            {item.item}
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
    backgroundColor: colors.ios.light.gray["4"].toRgbString(),
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
    fontWeight: "400",
  },
  searchItemDesc: {
    fontSize: 14,
    color: colors.ios.light.gray["1"].toRgbString(),
    marginTop: 3,
  },
});
