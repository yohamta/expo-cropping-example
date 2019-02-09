import { createStackNavigator, createAppContainer } from 'react-navigation';
import HomeScreen from 'app/src/screens/Home';
import CroppingScreen from 'app/src/screens/Cropping';
import ResultScreen from 'app/src/screens/Result';

console.disableYellowBox = true;

const AppNavigator = createStackNavigator(
  {
    Home: {
      screen: HomeScreen,
    },
    Cropping: {
      screen: CroppingScreen,
    },
    Result: {
      screen: ResultScreen,
    },
  },
  {
    defaultNavigationOptions: {
      headerTitle: 'Cropping Example',
    },
  },
);

export default createAppContainer(AppNavigator);
