import React, { useCallback, useMemo, useRef } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { VStack, Box, Container, NativeBaseProvider, HStack } from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { RTS_GOOGLE_API_KEY } from '@env';
import {BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {Dimensions} from 'react-native';

const BusInformationView = () => {

  const snapPoints = useMemo(() => [800, 900], []);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handlePresentPress = () => bottomSheetModalRef.current.present();
  const handleClosePress = () => bottomSheetModalRef.current.dismiss();

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);
  
  const busClickedHandler = () => {
    console.log('You have been clicked a button!');
  };

  const busInfoClickedHandler = () => {
    console.log('You have been clicked a button!');
  };

  const moreClickedHandler = () => {
    console.log('You have been clicked a button!');
  };

  const moreRoutesClickedHandler = () => {
    console.log('You have been clicked a button!');
  };

  const locationClickedHandler = () => {
    console.log('You have been clicked a button!');
  };

  return (
    <View style={styles.container} >

      <NativeBaseProvider config={config} >

        <Container style={styles.container}>

          <Box borderX="1" borderRadius="md" >

            <VStack space='2' alignItems="center">

              {/* 
                Google Places Autocomplete and Bus Information Button View
              */}
              <View style={styles.container}>

                <HStack space='5' style={styles.container}>
                  <ScrollView horizontal={true} >
                    <GooglePlacesAutocomplete
                      styles={{
                        description: {
                          color: 'grey',
                          fontSize: 16,
                        },
                          predefinedPlacesDescription: {
                          color: '#3caf50',
                        },
                      }}
                        query={{key: RTS_GOOGLE_API_KEY}}
                        keepResultsAfterBlur={true}
                        enablePoweredByContainer={false}
                        disableScroll={true}
                        isRowScrollable={false}
                        fetchDetails={true}
                        minLength={2}
                        placeholder="Type a place"
                        listViewDisplayed='auto'
                        onPress={(data, details = null) => 
                          console.log(data, details)
                        }/>
                  </ScrollView>
                  <TouchableOpacity style={{alignSelf:'flex-start'}}>
                    <Icon name="bus" size={40} color="grey"/> 
                  </TouchableOpacity>
                </HStack>
              </View>

              {/* 
                Favorites container header and more button
              */}
              <HStack width="100%" space="75%">
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

              {/* 
                Favorites information container
              */}
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
                        onPress={busClickedHandler}
                        style={styles.roundButton1}>
                        <Icon name="bus" size={45} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={busClickedHandler}
                        style={styles.roundButton1}>
                        <Icon name="bus" size={45} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={busClickedHandler}
                        style={styles.roundButton1}>
                        <Icon name="bus" size={45} color="white" />
                    </TouchableOpacity>
                </HStack>
              </Box>

              {/* 
                Routes near you header and all routes button
              */}
              <HStack width="100%" space="50%">
                <Text 
                style={{
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                }}>
                  routes near you
                </Text>
                <TouchableOpacity onPress={handlePresentPress}>
                  <Text 
                  style={{
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                    color:'grey'
                  }}>
                    all routes
                  </Text>
                </TouchableOpacity>
              </HStack>

              {/* 
                Routes Information Container
              */}
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
                <HStack space={5} alignItems="center">
                    <TouchableOpacity
                        onPress={busClickedHandler}
                        style={styles.roundButton1}>
                        <Icon name="bus" size={45} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={busClickedHandler}
                        style={styles.roundButton1}>
                        <Icon name="bus" size={45} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={busClickedHandler}
                        style={styles.roundButton1}>
                        <Icon name="bus" size={45} color="white" />
                    </TouchableOpacity>
                </HStack>
              </Box>

              {/* 
                Recents header
              */}
              <HStack width="100%">
                <Text 
                  style={{
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  }}>
                  recents
                  </Text>
              </HStack>

              {/* 
                Recents Information Container
              */}
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
  modal:{
    width:Dimensions.get('screen').width,
  },
  subheading:{
    flex:1,
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
    backgroundColor: 'grey',
    shadowColor: 'black',
    shadowOpacity: 0.4,
    elevation: 2,
    shadowRadius: 15 ,
    shadowOffset : { width: 1, height: 5},
  },
});