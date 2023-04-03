import Ionicons from "@expo/vector-icons/Ionicons";
import { useMachine } from "@xstate/react";
import * as Haptics from "expo-haptics";
import { useAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import {
  RectButton,
  Swipeable,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
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
import { favoritesItemsAtom } from "../../MainSheet/HomeView/sections/Favorites";
import {
  addViewingRoute,
  deleteViewingRoute,
} from "../../RTSMapView/mapPreferences";
import type { ModalControllerDispatchEvent } from "../ModalController";

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
        CLOSE: "closed",
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
  modalControllerDispatch: (event: ModalControllerDispatchEvent) => void;
}) {
  const swipeableRowRef = useRef<Swipeable>(null);

  // #region Favorites
  const [favorites, setFavorites] = useAtom(favoritesItemsAtom);
  const isInFavorites = useMemo(() => {
    return favorites.some(
      (item) =>
        item.type === "ROUTE" && item.routeNumber === props.routeItem.num
    );
  }, [favorites, props.routeItem.num]);
  // #endregion

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
      duration: 300,
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
      <RectButton style={styles.leftAction} onPress={closeSwipeableRow}>
        <Animated.Text
          style={[
            styles.actionText,
            {
              transform: [{ translateX: trans }],
            },
          ]}
        >
          {isInFavorites ? "Unfavorite" : "Favorite"}
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
      <RectButton style={styles.rightAction} onPress={closeSwipeableRow}>
        <Animated.Text
          style={[styles.actionText, { transform: [{ translateX: trans }] }]}
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
        if (direction === "left") {
          // Return if we haven't fully triggered or cancelled the swipe
          if (!hapticFeedbackLeftState.context.triggerThresholdByClose) return;

          if (isInFavorites) {
            // remove this route from the favorites
            setFavorites(
              favorites.filter((item) => {
                return !(
                  item.type === "ROUTE" &&
                  item.routeNumber === props.routeItem.num
                );
              })
            );
          } else {
            // add this route to the favorites
            setFavorites([
              ...favorites,
              {
                type: "ROUTE",
                routeNumber: props.routeItem.num,
                routeName: props.routeItem.name,
                routeColor: props.routeItem.color,
              },
            ]);
          }
        } else if (direction === "right") {
          // Return if we haven't fully triggered or cancelled the swipe
          if (!hapticFeedbackRightState.context.triggerThresholdByClose) return;

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
      <TouchableWithoutFeedback
        style={styles.row}
        onPress={() =>
          props.modalControllerDispatch({
            event: "OPEN_ROUTE",
            payload: { routeNumber: props.routeItem.num },
          })
        }
      >
        <View>
          <Reanimated.View
            style={[
              styles.routeIndicator,
              isViewingOpacityStyles,
              {
                backgroundColor: props.routeItem.color,
              },
            ]}
          >
            <Text style={styles.routeIndicatorText}>{props.routeItem.num}</Text>
          </Reanimated.View>
          {isInFavorites && (
            <View style={styles.favoritesStar}>
              <Ionicons
                name="ios-star"
                color="white"
                size={14}
                style={{
                  transform: [{ translateX: 0.5 }],
                }}
              />
            </View>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Reanimated.Text style={[styles.routeName, isViewingOpacityStyles]}>
            {props.routeItem.name}
          </Reanimated.Text>
        </View>
      </TouchableWithoutFeedback>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
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

  favoritesStar: {
    backgroundColor: colors.ios.light.yellow.toRgbString(),
    position: "absolute",
    right: 7,
    top: -7,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
