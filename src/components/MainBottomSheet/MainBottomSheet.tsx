// #region Imports
import Ionicons from "@expo/vector-icons/Ionicons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  useBottomSheetInternal,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { ComponentProps, useCallback, useEffect, useRef } from "react";
import AppleEasing from "react-apple-easing";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  Animated,
} from "react-native";
import { State } from "react-native-gesture-handler";
import {
  default as Reanimated,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { match } from "ts-pattern";

import {
  SheetMachineValueAtom,
  SheetViewMachineAtom,
  SheetViewMachineStates,
} from "./StateMachine";
import { colors } from "../../colors";
import HomeViewBody from "../HomeView/HomeViewBody";
import SearchViewBody from "../SearchView/SearchViewBody";

// #endregion

function SearchBar() {
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

export default function MainBottomSheet() {
  // Hooks
  const [sheetState, sheetSend] = useAtom(SheetViewMachineAtom);
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["12.5%", "50%", "92%"];

  // Animation for body opacity
  const sheetAnimatedIndex = useSharedValue(1);
  const bodyOpacity = useDerivedValue(
    () =>
      interpolate(sheetAnimatedIndex.value, [0, 0.2], [0, 1], {
        extrapolateRight: Extrapolation.CLAMP,
      }),
    []
  );
  const bodyAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bodyOpacity.value,
  }));

  // Spring animation config
  const bottomSheetAnimationConfigs = useBottomSheetSpringConfigs({
    damping: 40,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });

  const BackdropComponent = useCallback(
    (props: ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={2}
        disappearsOnIndex={1}
        opacity={0.2}
        pressBehavior="none"
      />
    ),
    []
  );

  const body = match(sheetState.value as SheetViewMachineStates)
    .with("home", () => <HomeViewBody />)
    .with("search", "transitioning_to_search", () => <SearchViewBody />)
    .exhaustive();

  return (
    <>
      <BottomSheet
        ref={sheetRef}
        index={sheetState.context.sheetIndex}
        snapPoints={snapPoints}
        style={styles.bottomSheetContainer}
        handleIndicatorStyle={{
          backgroundColor: colors.ios.light.gray["2"].toRgbString(),
        }}
        animationConfigs={bottomSheetAnimationConfigs}
        backdropComponent={BackdropComponent}
        enablePanDownToClose={false}
        animatedIndex={sheetAnimatedIndex}
        onAnimate={(from) => {
          if (sheetState.value === "search" && from === 2) {
            sheetSend("EXIT_SEARCH");
          }
        }}
      >
        <SearchBar />
        {/* <HomeView /> */}
        <Reanimated.View style={[{ flex: 1 }, bodyAnimatedStyle]}>
          {body}
        </Reanimated.View>
      </BottomSheet>
      {/* Invisible box filling to whole screen that renders the sheet inactive during transition */}
      {sheetState.value === "transitioning_to_search" && (
        <View style={StyleSheet.absoluteFill} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // #region Search Bar
  searchRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
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
  // #endregion
  // #region Bottom Sheet
  bottomSheetContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  bottomSheetContent: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  // #endregion
});
