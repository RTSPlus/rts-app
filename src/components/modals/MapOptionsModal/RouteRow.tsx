import { useMachine } from "@xstate/react";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";
import {
  useAnimatedStyle,
  useSharedValue,
  default as Reanimated,
  withTiming,
} from "react-native-reanimated";
import { match } from "ts-pattern";
import { assign, createMachine } from "xstate";

import { colors } from "../../../colors";
import { RouteData } from "../../../rts-api/getRoutes";
import {
  addViewingRoute,
  deleteViewingRoute,
} from "../../RTSMapView/mapPreferences";

type HapticFeedbackMachineEvent =
  | { type: "PASS_ACTIVE_THRESHOLD" }
  | { type: "BACK_TO_INACTIVE_THRESHOLD" }
  | { type: "CLOSE" }
  | { type: "RESET" };

type HapticFeedbackMachineContext = {
  triggerThresholdByClose: boolean;
};

const hapticFeedbackMachine = createMachine({
  tsTypes: {} as import("./RouteRow.typegen").Typegen0,
  schema: {
    context: {} as HapticFeedbackMachineContext,
    events: {} as HapticFeedbackMachineEvent,
  },
  id: `hapticFeedbackMachine`,
  initial: "idle",
  context: {
    triggerThresholdByClose: false,
  },
  states: {
    idle: {
      on: {
        PASS_ACTIVE_THRESHOLD: {
          target: "active",
          actions: [
            assign({
              triggerThresholdByClose: true,
            }),
            () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            },
          ],
        },
      },
    },
    active: {
      on: {
        BACK_TO_INACTIVE_THRESHOLD: {
          target: "idle",
          actions: [
            assign({
              triggerThresholdByClose: false,
            }),
            () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            },
          ],
        },
        CLOSE: {
          target: "closed",
        },
      },
    },
    closed: {
      on: {
        RESET: {
          target: "idle",
          actions: [
            assign({
              triggerThresholdByClose: false,
            }),
          ],
        },
      },
    },
  },
  predictableActionArguments: true,
});

const ACTIVE_THRESHOLD = 150;
export default function RouteRow(props: {
  routeItem: RouteData;
  isInViewingRoutes: boolean;
}) {
  const swipeableRowRef = useRef<Swipeable>(null);

  // #region Haptic Feedback
  const [hapticFeedbackLeftState, hapticFeedbackLeftSend] = useMachine(
    () => hapticFeedbackMachine
  );
  const [hapticFeedbackRightState, hapticFeedbackRightSend] = useMachine(
    () => hapticFeedbackMachine
  );
  // #endregion

  // #region isViewingRoutes opacity effect/animation
  const [isInViewingRoutes, setIsInViewingRoutes] = useState(
    props.isInViewingRoutes
  );
  const isInViewingRoutesShared = useSharedValue(isInViewingRoutes ? 1 : 0.3);
  // sync props to shared value
  useEffect(() => {
    isInViewingRoutesShared.value = withTiming(isInViewingRoutes ? 1 : 0.3, {
      duration: 150,
    });
  }, [isInViewingRoutesShared, isInViewingRoutes]);
  const isViewingOpacityStyles = useAnimatedStyle(() => ({
    opacity: isInViewingRoutesShared.value,
  }));
  // #endregion

  // #region Left and Right actions
  const renderLeftActions = (_progress: number, dragX: Animated.Value) => {
    dragX.addListener(({ value }) => {
      if (hapticFeedbackLeftState.matches("idle")) {
        if (value >= ACTIVE_THRESHOLD) {
          hapticFeedbackLeftSend("PASS_ACTIVE_THRESHOLD");
        }
      } else if (hapticFeedbackLeftState.matches("active")) {
        if (value < ACTIVE_THRESHOLD) {
          hapticFeedbackLeftSend("BACK_TO_INACTIVE_THRESHOLD");
        }
      }
    });

    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
    });

    const closeSwipeableRow = () => {
      swipeableRowRef?.current?.close();
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
    dragX.addListener(({ value }) => {
      if (hapticFeedbackRightState.matches("idle")) {
        if (value <= -ACTIVE_THRESHOLD) {
          hapticFeedbackRightSend("PASS_ACTIVE_THRESHOLD");
        }
      } else if (hapticFeedbackRightState.matches("active")) {
        if (value > -ACTIVE_THRESHOLD) {
          hapticFeedbackRightSend("BACK_TO_INACTIVE_THRESHOLD");
        }
      }
    });

    const trans = dragX.interpolate({
      inputRange: [-101, -100, 0],
      outputRange: [0, 0, 64],
    });

    const closeSwipeableRow = () => {
      swipeableRowRef?.current?.close();
    };

    return (
      <RectButton style={rowStyles.rightAction} onPress={closeSwipeableRow}>
        <Animated.Text
          style={[rowStyles.actionText, { transform: [{ translateX: trans }] }]}
        >
          {isInViewingRoutes ? "Hide" : "Show"}
        </Animated.Text>
      </RectButton>
    );
  };
  // #endregion

  return (
    <Swipeable
      ref={swipeableRowRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableWillClose={(direction) => {
        match(direction)
          .with("left", () => {})
          .with("right", () => {
            if (hapticFeedbackRightState.context.triggerThresholdByClose) {
              if (isInViewingRoutes) {
                // remove this route from the viewing routes
                setIsInViewingRoutes(false);
                deleteViewingRoute(props.routeItem.num);
              } else {
                // add this route to the viewing routes
                setIsInViewingRoutes(true);
                addViewingRoute(props.routeItem.num);
              }
            }
          })
          .exhaustive();
      }}
      onSwipeableClose={(direction) => {
        match(direction)
          .with("left", () => hapticFeedbackLeftSend("RESET"))
          .with("right", () => hapticFeedbackRightSend("RESET"))
          .exhaustive();
      }}
      rightThreshold={Number.POSITIVE_INFINITY}
      leftThreshold={Number.POSITIVE_INFINITY}
      onCancelled={() => {
        hapticFeedbackLeftSend("CLOSE");
        hapticFeedbackRightSend("CLOSE");
      }}
      onEnded={() => {
        hapticFeedbackLeftSend("CLOSE");
        hapticFeedbackRightSend("CLOSE");
      }}
    >
      <View style={rowStyles.row}>
        <Reanimated.View
          style={[
            rowStyles.routeIndicator,
            isViewingOpacityStyles,
            {
              backgroundColor: props.routeItem.color,
            },
          ]}
        >
          <Text style={rowStyles.routeIndicatorText}>
            {props.routeItem.num}
          </Text>
        </Reanimated.View>
        <View style={{ flex: 1 }}>
          <Reanimated.Text
            style={[rowStyles.routeName, isViewingOpacityStyles]}
          >
            {props.routeItem.name}
          </Reanimated.Text>
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
