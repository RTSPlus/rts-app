import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView} from 'react-native';
import { VStack, Box, Container, NativeBaseProvider, HStack, Center, Input } from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { RTS_GOOGLE_API_KEY } from '@env';

const BusInformationView = () => {

  const buttonClickedHandler = () => {
    console.log('You have been clicked a button!');
  };


  return (
    <View style={styles.container} >

      <NativeBaseProvider config={config} >

        <Container style={styles.container}>

          <Box borderX="1" borderRadius="md" >

            <VStack space='2' alignItems="center">

              <View style={styles.container}>

                <HStack style={styles.container}>

                  <GooglePlacesAutocomplete
                    styles={{
                      container: {
                        // flex: 1,
                      },
                      description: {
                        color: 'grey',
                        fontSize: 16,
                      },
                        predefinedPlacesDescription: {
                        color: '#3caf50',
                      },
                    }}
                      keepResultsAfterBlur={true}
                      enablePoweredByContainer={false}
                      disableScroll={true}
                      isRowScrollable={true}
                      placeholder="Type a place"
                      minLength={2} // minimum length of text to search
                      query={{key: RTS_GOOGLE_API_KEY}}
                      fetchDetails={true}
                      listViewDisplayed='auto'
                      onPress={(data, details = null) => 
                        console.log(data, details)
                      }
                    />

                  <TouchableOpacity style={{alignSelf:'flex-start'}}>
                    <Icon name="bus" size={50} color="grey"/> 
                  </TouchableOpacity>
                </HStack>

                </View>

              <HStack width="90%" space="75%">
                <Text 
                  style={{
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  }}>
                  favorites
                </Text>
                <TouchableOpacity>
                  <Text 
                  style={{
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                    color:'grey'
                  }}>
                    more
                  </Text>
                </TouchableOpacity>
              </HStack>

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
                        <Icon name="bus" size={45} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={buttonClickedHandler}
                        style={styles.roundButton1}>
                        <Icon name="bus" size={45} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={buttonClickedHandler}
                        style={styles.roundButton1}>
                        <Icon name="bus" size={45} color="white" />
                    </TouchableOpacity>
                </HStack>
              </Box>

              <HStack width="90%" space="50%">
                <Text 
                style={{
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                }}>
                  routes near you
                </Text>
                <TouchableOpacity>
                  <Text 
                  style={{
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                    color:'grey'
                  }}>
                    more routes
                  </Text>
                </TouchableOpacity>
              </HStack>

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

              <HStack width="90%" space="60%">
                <Text 
                  style={{
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  }}>
                  recents
                  </Text>
              </HStack>

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

          </Box>

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

const styles = StyleSheet.create({
  subheading:{
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundButton1: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    height: 75,
    padding: 10,
    borderRadius: 100,
    backgroundColor: '#D8D8D8',
  },
});