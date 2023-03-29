import { Easing } from "react-native";

export const AppleEasing = {
  easeIn: Easing.bezier(0.42, 0, 1, 1),
  easeOut: Easing.bezier(0, 0, 0.58, 1),
  easeInOut: Easing.bezier(0.42, 0, 0.58, 1),
  default: Easing.bezier(0.25, 0.1, 0.25, 1),
};
