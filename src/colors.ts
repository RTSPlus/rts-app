import color from "tinycolor2";

export const colors = {
  // Taking colors from Apple developer guidelines
  // https://developer.apple.com/design/human-interface-guidelines/foundations/color/

  // TODO: Add dark mode colors
  ios: {
    light: {
      red: color("rgb(255, 59, 48)"),
      orange: color("rgb(255, 149, 0)"),
      yellow: color("rgb(255, 204, 0)"),
      green: color("rgb(52, 199, 90)"),
      mint: color("rgb(0, 199, 190)"),
      teal: color("rgb(48, 176, 199)"),
      cyan: color("rgb(50, 173, 230)"),
      blue: color("rgb(0, 122, 255)"),
      indigo: color("rgb(88, 86, 214)"),
      purple: color("rgb(175, 82, 222)"),
      pink: color("rgb(255, 45, 85)"),
      brown: color("rgb(162, 132, 194)"),
      gray: {
        "1": color("rgb(142, 142, 147)"),
        "2": color("rgb(174, 174, 178)"),
        "3": color("rgb(199, 199, 204)"),
        "4": color("rgb(209, 209, 214)"),
        "5": color("rgb(229, 229, 234)"),
        "6": color("rgb(242, 242, 247)"),
      },
    },
  },
} as const;
