import {
  BottomSheetScrollView,
  useBottomSheetInternal,
} from "@gorhom/bottom-sheet";
import { View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";

import Nearby from "./sections/Nearby";

export default function HomeViewBody() {
  // #region Body opacity animation
  const { animatedIndex } = useBottomSheetInternal();
  const bodyOpacity = useDerivedValue(
    () =>
      interpolate(animatedIndex.value, [0, 0.2], [0, 1], {
        extrapolateRight: Extrapolation.CLAMP,
      }),
    []
  );
  const bodyAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bodyOpacity.value,
  }));
  // #endregion

  return (
    <BottomSheetScrollView>
      <Animated.View style={bodyAnimatedStyle}>
        {/* Spacer */}
        <View style={{ flex: 1, height: 24 }} />
        <Nearby />
      </Animated.View>
    </BottomSheetScrollView>
  );
}
