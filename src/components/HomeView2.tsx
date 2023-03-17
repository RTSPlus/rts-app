import Ionicons from "@expo/vector-icons/Ionicons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { match } from "ts-pattern";

import { colors } from "../colors";

type Props = {
  sheetRef: RefObject<BottomSheet>;
  sheetState: any;
};

export default function HomeView2({ sheetRef, sheetState }: Props) {
  const searchInputRef = useRef<TextInput>(null);

  const [searchFocused, setSearchFocused] = useState(false);

  const onFocus = useCallback(() => {
    sheetRef.current?.expand();
    setSearchFocused(true);
  }, [sheetRef]);

  const onBlur = useCallback(() => {
    setSearchFocused(false);
  }, []);

  const onCancelPress = useCallback(() => {
    searchInputRef.current?.blur();
    sheetRef.current?.snapToIndex(1);
  }, [sheetRef]);

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
            ref={searchInputRef}
            style={styles.searchBarInput}
            placeholder="Search stops, routes, and places"
            placeholderTextColor={colors.ios.light.gray["1"].toRgbString()}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </BottomSheetView>
        {match(searchFocused)
          .with(true, () => (
            <TouchableOpacity
              style={{
                marginLeft: 16,
              }}
              onPress={onCancelPress}
            >
              <Text
                style={{
                  color: colors.ios.light.blue.toRgbString(),
                  fontSize: 18,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          ))
          .with(false, () => (
            <View
              style={{
                width: 32,
                height: 32,
                backgroundColor: "red",
                marginLeft: 16,
              }}
            />
          ))
          .exhaustive()}
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
    alignItems: "center",
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
