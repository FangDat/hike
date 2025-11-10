// App.js
// import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddHikeScreen from './screens/AddHikeScreen';
import DetailsScreen from './screens/DetailsScreen';
import EditHikeScreen from './screens/EditHikeScreen';

import { initDatabase, isSQLiteEnabled } from './storage/HikeStorage';

const Stack = createNativeStackNavigator();

export default function App() {
  React.useEffect(() => {
    (async () => {
      await initDatabase();
      console.log("✅ DB init done. usingSQLite =", isSQLiteEnabled());
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AddHike"
        screenOptions={{ headerTitleAlign: 'center' }}
      >
        <Stack.Screen
          name="AddHike"
          component={AddHikeScreen}
          options={{ title: 'Add Hike' }}
        />

        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={{ title: 'All Hikes' }}
        />

        <Stack.Screen
          name="EditHike"
          component={EditHikeScreen}
          options={{ title: 'Edit Hike' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
