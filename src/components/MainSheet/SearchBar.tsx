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
  MainSheetMachineAtom,
  MainSheetMachineValueAtom,
} from "./MainSheetMachine";
import { colors } from "../../colors";
import { AppleEasing } from "../../utils/easing";

type Props = {
  onChangeText?: (text: string) => void;
};

export default function SearchBar(props: Props) {
  // #region State
  const searchInputRef = useRef<TextInput>(null);

  const sheetMachineSend = useSetAtom(MainSheetMachineAtom);
  const sheetMachineValue = useAtomValue(MainSheetMachineValueAtom);

  const { animatedContentGestureState } = useBottomSheetInternal();

  const rightIconWidthAnim = useRef(new Animated.Value(48)).current;
  // #endregion

  // #region Handles
  const onCancel = () => {
    props.onChangeText?.("");
    searchInputRef.current?.clear();
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

    match(sheetMachineValue)
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

  // Blur keyboard when we begin to swipe down
  useAnimatedReaction(
    () => ({
      gestureState: animatedContentGestureState.value,
    }),
    ({ gestureState }) => {
      if (sheetMachineValue === "search" && gestureState === State.ACTIVE) {
        runOnJS(blurSearchInput)();
      }
    },
    [sheetMachineValue, blurSearchInput]
  );
  // #endregion

  // Icon to right of search bar switches
  // Cancel when in search or transitioning to search
  // Maps when in home or transitioning to home
  const rightIcon = match(sheetMachineValue)
    .with("search", "transitioning_to_search", () => (
      // Cancel button
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
    .with("home", () => (
      // Maps button
      <TouchableOpacity
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          // backgroundColor: colors.ios.light.gray["4"].toRgbString(),
          borderColor: colors.ios.light.gray["1"].toString(),
          borderWidth: 2,
          marginLeft: 16,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons
          name="ios-map"
          size={22}
          color={colors.ios.light.gray["1"].darken().toString()}
        />
      </TouchableOpacity>
    ))
    .exhaustive();

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
            color={colors.ios.light.gray["1"].darken().toRgbString()}
          />
          <TextInput
            onChangeText={props.onChangeText}
            ref={searchInputRef}
            style={styles.searchBarInput}
            placeholder="Search routes, stops, & places"
            placeholderTextColor={colors.ios.light.gray["1"]
              .setAlpha(0.5)
              .toRgbString()}
            onFocus={() => sheetMachineSend("FOCUS_SEARCH")}
          />
        </BottomSheetView>
        {/* Right icon */}
        <Animated.View
          style={{ alignItems: "flex-end", width: rightIconWidthAnim }}
        >
          {rightIcon}
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
