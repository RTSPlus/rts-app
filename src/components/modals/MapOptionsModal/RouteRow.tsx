import { useMachine } from "@xstate/react";
import * as Haptics from "expo-haptics";
import { useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";
import { createMachine } from "xstate";

import { colors } from "../../../colors";
import { RouteData } from "../../../rts-api/getRoutes";
import { match } from "ts-pattern";

type HapticFeedbackMachineEvent =
  | { type: "PASS_ACTIVE_THRESHOLD" }
  | { type: "BACK_TO_INACTIVE_THRESHOLD" }
  | { type: "CLOSE" }
  | { type: "RESET" };

const hapticFeedbackMachine = createMachine({
  tsTypes: {} as import("./RouteRow.typegen").Typegen0,
  schema: {
    events: {} as HapticFeedbackMachineEvent,
  },
  id: `hapticFeedbackMachine`,
  initial: "idle",
  states: {
    idle: {
      on: {
        PASS_ACTIVE_THRESHOLD: {
          target: "active",
          actions: [
            () => console.log("pass active threshold"),
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
            () => console.log("pass inactive threshold"),
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
        },
      },
    },
  },
  predictableActionArguments: true,
});

export default function RouteRow(props: { routeItem: RouteData }) {
  const swipeableRowRef = useRef<Swipeable>(null);

  const [hapticFeedbackLeftState, hapticFeedbackLeftSend] = useMachine(
    () => hapticFeedbackMachine
  );
  const [hapticFeedbackRightState, hapticFeedbackRightSend] = useMachine(
    () => hapticFeedbackMachine
  );

  const renderLeftActions = (_progress: number, dragX: Animated.Value) => {
    dragX.addListener(({ value }) => {
      if (hapticFeedbackLeftState.matches("idle")) {
        if (value >= 150) {
          hapticFeedbackLeftSend("PASS_ACTIVE_THRESHOLD");
        }
      } else if (hapticFeedbackLeftState.matches("active")) {
        if (value < 150) {
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
        if (value <= -150) {
          hapticFeedbackRightSend("PASS_ACTIVE_THRESHOLD");
        }
      } else if (hapticFeedbackRightState.matches("active")) {
        if (value > -150) {
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
          Hide
        </Animated.Text>
      </RectButton>
    );
  };

  return (
    <Swipeable
      ref={swipeableRowRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableWillClose={(direction) => {
        match(direction)
          .with("left", () => hapticFeedbackLeftSend("CLOSE"))
          .with("right", () => hapticFeedbackRightSend("CLOSE"))
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
