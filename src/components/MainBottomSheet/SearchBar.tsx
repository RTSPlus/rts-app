import Ionicons from "@expo/vector-icons/Ionicons";
import { useBottomSheetInternal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useSetAtom, useAtomValue } from "jotai";
import React, { useRef, useEffect } from "react";
import {
  TextInput,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import { State } from "react-native-gesture-handler";
import { useAnimatedReaction, runOnJS } from "react-native-reanimated";
import { match } from "ts-pattern";

import {
  SheetViewMachineAtom,
  SheetMachineValueAtom,
  SheetViewMachineStates,
} from "./StateMachine";
import { colors } from "../../colors";
import { AppleEasing } from "../../utils/easing";

type Props = {
  onChangeText?: (text: string) => void;
};

export default function SearchBar(props: Props) {
  // #region State
  const searchInputRef = useRef<TextInput>(null);

  // Very marginal? possible render optimization by using derived read-only atoms
  const sheetMachineSend = useSetAtom(SheetViewMachineAtom);
  const sheetMachineValue = useAtomValue(SheetMachineValueAtom);

  const { animatedIndex, animatedContentGestureState } =
    useBottomSheetInternal();

  const rightIconWidthAnim = useRef(new Animated.Value(48)).current;
  // #endregion

  // #region Handles
  const onCancel = () => {
    searchInputRef.current?.blur();
    sheetMachineSend("EXIT_SEARCH");
  };

  const blurSearchInput = () => {
    searchInputRef.current?.blur();
  };
  // #endregion

  // #region Effects
  // Blur side-effect
  useEffect(() => {
    if (sheetMachineValue === "home") {
      searchInputRef.current?.blur();
    }
  }, [searchInputRef, sheetMachineValue]);

  // Right icon width side-effect
  useEffect(() => {
    const timingConfig = {
      easing: AppleEasing.default,
      useNativeDriver: false,
      duration: 200,
    };

    match(sheetMachineValue as SheetViewMachineStates)
      .with("home", () => {
        Animated.timing(rightIconWidthAnim, {
          toValue: 48,
          ...timingConfig,
        }).start();
      })
      .with("transitioning_to_search", "search", () => {
        Animated.timing(rightIconWidthAnim, {
          toValue: 72,
          ...timingConfig,
        }).start();
      })
      .exhaustive();
  }, [sheetMachineValue, rightIconWidthAnim]);

  // Handle sheet transition
  useAnimatedReaction(
    () => ({
      index: animatedIndex.value,
      gestureState: animatedContentGestureState.value,
    }),
    ({ index, gestureState }) => {
      if (sheetMachineValue === "transitioning_to_search") {
        // Render the bottom sheet un-interactive when we are transitioning to the search view
        // to prevent weird bugs/behaviors. Necessary to feel more natural
        if (index >= 1.95) {
          runOnJS(sheetMachineSend)("FINISHED_TRANSITION");
        }
      } else if (sheetMachineValue === "search") {
        // Blur keyboard when we being to swipe down
        if (gestureState === State.ACTIVE) {
          runOnJS(blurSearchInput)();
        }

        // This is required because for some reason, `onAnimate` in the BottomSheet prop will not
        // fire when the sheet is transitioning from the search view to the home view
        // However, that event transition should be preferred as it runs faster
        // This is a backup in case that event transition fails
        if (index <= 1) {
          runOnJS(sheetMachineSend)("EXIT_SEARCH");
        }
      }
    },
    [sheetMachineValue, sheetMachineSend, blurSearchInput]
  );
  // #endregion

  return (
    <>
      {/* ----Search Bar Row---- */}
      <View style={styles.searchRowContainer}>
        <BottomSheetView
          style={styles.searchBarContainer}
          // Pass on touches to the TextInput to expand the touchable area
          onTouchEnd={() => searchInputRef.current?.focus()}
        >
          <Ionicons
            style={styles.searchBarIcon}
            name="ios-search-outline"
            size={20}
            color={colors.ios.light.gray["1"].clone().darken().toRgbString()}
          />
          <TextInput
            onChangeText={props.onChangeText}
            ref={searchInputRef}
            style={styles.searchBarInput}
            placeholder="Search routes, stops, & places"
            placeholderTextColor={colors.ios.light.gray["1"]
              .clone()
              .darken()
              .toRgbString()}
            onFocus={() => sheetMachineSend("FOCUS_SEARCH")}
          />
        </BottomSheetView>
        {/* Right icon */}
        <Animated.View
          style={{ alignItems: "flex-end", width: rightIconWidthAnim }}
        >
          {match(
            sheetMachineValue === "search" ||
              sheetMachineValue === "transitioning_to_search"
          )
            .with(true, () => (
              <TouchableOpacity
                style={{
                  marginLeft: 16,
                  position: "relative",
                  alignItems: "center",
                }}
                onPress={onCancel}
              >
                <Text
                  style={{
                    color: colors.ios.light.blue.toRgbString(),
                    fontSize: 18,
                    width: 56,
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
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  searchRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
    backgroundColor: colors.ios.light.gray["6"].toRgbString(),
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ios.light.gray["5"].toRgbString(),
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
