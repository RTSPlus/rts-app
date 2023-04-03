import { useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";

import { colors } from "../../../colors";
import { RouteData } from "../../../rts-api/getRoutes";

export default function RouteRow(props: { routeItem: RouteData }) {
  const swipeableRowLeftRef = useRef<Swipeable>(null);
  const swipeableRowRightRef = useRef<Swipeable>(null);

  const renderLeftActions = (_progress: number, dragX: Animated.Value) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
    });

    const closeSwipeableRow = () => {
      swipeableRowLeftRef?.current?.close();
    };

    return (
      <RectButton style={rowStyles.leftAction} onPress={closeSwipeableRow}>
        <Animated.Text
          style={[
            rowStyles.actionText,
            {
              transform: [{ translateX: trans }],
            },
          ]}
        >
          Favorite
        </Animated.Text>
      </RectButton>
    );
  };

  const renderRightActions = (
    _progress: Animated.Value,
    dragX: Animated.Value
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 64],
      extrapolate: "clamp",
    });

    const closeSwipeableRow = () => {
      swipeableRowRightRef?.current?.close();
    };

    return (
      <RectButton style={rowStyles.rightAction} onPress={closeSwipeableRow}>
        <Animated.Text
          style={[rowStyles.actionText, { transform: [{ translateX: trans }] }]}
        >
          Hide
        </Animated.Text>
      </RectButton>
    );
  };

  return (
    <Swipeable
      ref={swipeableRowLeftRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
    >
      <View style={rowStyles.row}>
        <View
          style={[
            rowStyles.routeIndicator,
            {
              backgroundColor: props.routeItem.color,
            },
          ]}
        >
          <Text style={rowStyles.routeIndicatorText}>
            {props.routeItem.num}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={rowStyles.routeName}>{props.routeItem.name}</Text>
        </View>
      </View>
    </Swipeable>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ios.light.gray["6"].toRgbString(),
    paddingVertical: 16,
  },

  // Route Indicator
  routeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
    marginRight: 16,
  },
  routeIndicatorText: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },

  routeName: {
    fontSize: 16,
    fontWeight: "600",
    width: "100%",
  },

  // Swipeable
  leftAction: {
    backgroundColor: colors.ios.light.yellow.toRgbString(),
    justifyContent: "center",
    flex: 1,
  },
  actionText: {
    color: "white",
    fontWeight: "600",
    padding: 20,
  },

  rightAction: {
    backgroundColor: colors.ios.light.gray["1"].toRgbString(),
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
  },
});
