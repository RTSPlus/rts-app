import React, {useState} from 'react';
import {View, Text, Button, StyleSheet, TouchableOpacity} from 'react-native';
import { VStack, Box, Divider, Container, NativeBaseProvider, HStack, Center } from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
// import CircleButton from 'react-native-circle-button';
import Icon from 'react-native-vector-icons/FontAwesome';


const BusInformationView = () => {

  const buttonClickedHandler = () => {
    console.log('You have been clicked a button!');
    // do something
  };

  return (
    <View style={styles.container}>
      <NativeBaseProvider config={config}>
        <Container alignItems="center">
          <Box borderX="1" borderRadius="md" >
            <VStack space="1" alignItems="center" >
              <Box bg={{
                linearGradient: {
                  colors: ['#D7CECE', '#D7CECE'],
                  start: [0, 0],
                  end: [1, 0]
                }
                }} p="12" rounded="xl" _text={{
                  fontSize: 'md',
                  fontWeight: 'medium',
                  color: 'warmGray.50',
                  textAlign: 'center'
                }}>
               <HStack space={5} alignItems="center">
                  <TouchableOpacity
                      onPress={buttonClickedHandler}
                      style={styles.roundButton1}>
                      <Icon name="home" size={45} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                      onPress={buttonClickedHandler}
                      style={styles.roundButton1}>
                      <Icon name="map-marker" size={45} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                      onPress={buttonClickedHandler}
                      style={styles.roundButton1}>
                      <Icon name="bus" size={45} color="white" />
                  </TouchableOpacity>
              </HStack>
              </Box>
              <Box width="100%" bg={{
                linearGradient: {
                  colors: ['#D7CECE', '#D7CECE'],
                  start: [0, 0],
                  end: [1, 0]
                }
                }} p="12" rounded="xl" _text={{
                  fontSize: 'md',
                  fontWeight: 'medium',
                  color: 'warmGray.50',
                  textAlign: 'center'
                }}>
                Busses in View
              </Box>
              <Box width="100%"  bg={{
                linearGradient: {
                  colors: ['#D7CECE', '#D7CECE'],
                  start: [0, 0],
                  end: [1, 0]
                }
                }} p="12" rounded="xl" _text={{
                  fontSize: 'md',
                  fontWeight: 'medium',
                  color: 'warmGray.50',
                  textAlign: 'center'
                }}>
                Contact Us
              </Box>
            </VStack>
            {/* </Center> */}
          </Box>

          {/* </Center> */}
        </Container>
      </NativeBaseProvider>
    </View>
  );
};

export default BusInformationView;

const config = {
  dependencies: {
    'linear-gradient': LinearGradient
  }
};

// React Native Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundButton1: {
    // alignSelf:'center',
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 100,
    backgroundColor: '#D8D8D8',
  },
});