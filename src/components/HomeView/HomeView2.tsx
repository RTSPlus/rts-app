import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetView, useBottomSheetInternal } from "@gorhom/bottom-sheet";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { State } from "react-native-gesture-handler";
import { useAnimatedReaction } from "react-native-reanimated";
import { match } from "ts-pattern";

import HomeViewBody from "./HomeViewBody";
import { colors } from "../../colors";
import { SheetMachineValueAtom, SheetViewMachineAtom } from "../RTSBottomSheet";
import SearchViewBody from "../SearchView/SearchViewBody";

export default function HomeView2() {
  const searchInputRef = useRef<TextInput>(null);

  // Very marginal? possible render optimization by using derived read-only atoms
  const sheetMachineSend = useSetAtom(SheetViewMachineAtom);
  const sheetMachineValue = useAtomValue(SheetMachineValueAtom);

  const onCancel = () => {
    searchInputRef.current?.blur();
    sheetMachineSend("EXIT_SEARCH");
  };

  useEffect(() => {
    if (sheetMachineValue === "home") {
      searchInputRef.current?.blur();
    }
  }, [sheetMachineValue]);

  const { animatedIndex, animatedContentGestureState } =
    useBottomSheetInternal();

  // Handle sheet transition
  useAnimatedReaction(
    () => ({
      index: animatedIndex.value,
      gestureState: animatedContentGestureState.value,
    }),
    ({ index, gestureState }) => {
      if (sheetMachineValue === "transitioning_to_search") {
        if (index >= 1.95) {
          sheetMachineSend("FINISHED_TRANSITION");
        }
      } else if (sheetMachineValue === "search") {
        if (gestureState === State.ACTIVE) {
          searchInputRef.current?.blur();
        }

        if (index <= 1) {
          sheetMachineSend("EXIT_SEARCH");
        }
      }
    },
    [sheetMachineValue, sheetMachineSend, searchInputRef.current]
  );

  return (
    <BottomSheetView style={styles.container}>
      {/* Search Bar Row */}
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
            placeholder="Search routes, stops, & places"
            placeholderTextColor={colors.ios.light.gray["1"].toRgbString()}
            onFocus={() => sheetMachineSend("FOCUS_SEARCH")}
          />
        </BottomSheetView>
        {match(
          sheetMachineValue === "search" ||
            sheetMachineValue === "transitioning_to_search"
        )
          .with(true, () => (
            <TouchableOpacity
              style={{
                marginLeft: 16,
              }}
              onPress={onCancel}
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

      {/* Body */}
      {match(sheetMachineValue)
        .with("home", () => <HomeViewBody />)
        .with("search", "transitioning_to_search", () => <SearchViewBody />)
        .otherwise(() => (
          <Text>Unknown</Text>
        ))}
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
    flex: 1,
  },
});
