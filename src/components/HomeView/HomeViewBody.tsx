import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Box, HStack } from "native-base";
import { Text, TouchableOpacity, View } from "react-native";

import CustomRouteIcon from "../CustomRouteIcon";

export default function HomeViewBody() {
  return (
    <BottomSheetScrollView>
      {/* TODO: Temporary spacer */}
      <View style={{ flex: 1, height: 20 }} />
      {/* Routes near you header and all routes button */}
      <HStack width="90%" space="45%">
        <Text
          style={{
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
        >
          🚌 routes near you
        </Text>
        <TouchableOpacity>
          <Text
            style={{
              justifyContent: "flex-end",
              alignItems: "flex-end",
              color: "grey",
            }}
          >
            all routes
          </Text>
        </TouchableOpacity>
      </HStack>

      <View style={{ backgroundColor: "red" }}>
        {/* Routes Information Container */}
        <Box
          width="90%"
          justifyContent="center"
          alignItems="center"
          bg={{
            linearGradient: {
              colors: ["#bdc3c7", "#2c3e50"],
              start: [0, 0],
              end: [1, 0],
            },
          }}
          bgColor="red"
          p="12"
          rounded="xl"
          _text={{
            fontSize: "md",
            fontWeight: "medium",
            color: "warmGray.50",
            textAlign: "center",
          }}
        >
          <HStack space={2} alignItems="center">
            <TouchableOpacity>
              <CustomRouteIcon color="#539AA9" text="80" />
            </TouchableOpacity>

            <TouchableOpacity>
              <CustomRouteIcon color="#A9C5CA" text="9" />
            </TouchableOpacity>

            <TouchableOpacity>
              <CustomRouteIcon color="#D5C9CA" text="22" />
            </TouchableOpacity>

            <TouchableOpacity>
              <CustomRouteIcon color="blue" text="30" />
            </TouchableOpacity>
          </HStack>
        </Box>
      </View>
    </BottomSheetScrollView>
  );
}
