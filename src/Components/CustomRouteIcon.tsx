import { View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const CustomRouteIcon = ({color, text}: {color:string, text:string}) => {

    const styles = StyleSheet.create({
        roundButton1: {
          justifyContent: 'center',
          alignItems: 'center',
          width: 70,
          height: 70,
          padding: 10,
          borderRadius: 100,
          backgroundColor: color,
          shadowColor: 'black',
          shadowOpacity: 0.3,
          elevation: 2,
          shadowRadius: 15 ,
          shadowOffset : { width: 1, height: 5},
        },
      });

  return( 
    <View
    style={styles.roundButton1}>
    <View style={{ alignItems: 'center' }}>
      <View style={{  alignItems: 'center'  }}>
        {/* <Icon name="road" size={50} color='white'style={{ alignItems: 'center' }} /> */}
        <Text
          style={{
            // position: 'absolute',
            alignItems: 'center' ,
            color: 'white',
            fontWeight: 'bold',
            fontSize: 35,
            // marginTop: 5
          }}
        >
          {text}
        </Text>
      </View>
    </View>  
    </View>
  );
}

export default CustomRouteIcon;
