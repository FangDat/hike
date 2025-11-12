// screens/AddHikeScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { insertHikefilebase } from '../storage/HikeStorage';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import axios from 'axios';

const OPENCAGE_API_KEY = 'f70417a9320a42c28e2f87398e996e6f';

export default function AddHikeScreen({ navigation }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [parking, setParking] = useState('Yes');
  const [length, setLength] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState('');

  const formatDate = d => `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;

  const detectLocation = async () => {
    try {
      // 1. Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      // 2. Check if location services are enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert('Error', 'Location services are disabled. Please enable them in settings.');
        return;
      }

      // 3. Get current position with high accuracy
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        maximumAge: 10000,
        timeout: 5000
      });

      console.log(`DEBUG_LOCATION: Latitude ${loc.coords.latitude}, Longitude ${loc.coords.longitude}`);

      // 4. Reverse geocode via OpenCage
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${loc.coords.latitude}+${loc.coords.longitude}&key=${OPENCAGE_API_KEY}`
      );

      const components = response.data.results[0]?.components || {};
      const city =
        components.city ||
        components.town ||
        components.village ||
        components.state ||
        'Unknown';
      setLocation(city);

    } catch (error) {
      console.error('DEBUG_ERROR:', error);
      Alert.alert('Error', 'Could not detect location. Make sure location services are enabled.');
    }
  };


  const validateAndConfirm = () => {
    if (!name.trim()) { Alert.alert('Error', 'Please fill Name'); return; }
    if (!location.trim()) { Alert.alert('Error', 'Please fill Location'); return; }
    if (!length.trim()) { Alert.alert('Error', 'Please fill Length'); return; }

    const safeDescription = description ? description.toString() : '';
    const safeParticipants = participants ? participants.toString() : '';

    const hike = {
      name,
      location,
      date: formatDate(date),
      parking,
      length,
      difficulty,
      description: safeDescription.trim() ? safeDescription : null,
      participants: safeParticipants.trim() ? safeParticipants : null
    };

    let confirmMessage = `🏞️ Name: ${hike.name}\n📍 Location: ${hike.location}\n📅 Date: ${hike.date}\n🅿️ Parking: ${hike.parking}\n📏 Length: ${hike.length} km\n⚙️ Difficulty: ${hike.difficulty}`;
    if (hike.description) confirmMessage += `\n📝 Description: ${hike.description}`;
    if (hike.participants) confirmMessage += `\n👥 Participants: ${hike.participants}`;

    Alert.alert('Confirm Hike', confirmMessage, [
      { text: 'Back', style: 'cancel' },
      { text: 'Save', onPress: () => saveHike(hike) }
    ]);
  };

  const saveHike = async (hike) => {
    try {
      const r = await insertHikefilebase(hike);
      console.log('insert result', r);
      Alert.alert('Success', 'Hike added!');
      clearFields();
      navigation.navigate('Details');
    } catch (err) {
      console.log('saveHike err', err);
      Alert.alert('Error', 'Cannot save hike (see console).');
    }
  };

  const clearFields = () => {
    setName('');
    setLocation('');
    setDate(new Date());
    setParking('Yes');
    setLength('');
    setDifficulty('Easy');
    setDescription('');
    setParticipants('');
  };

  const showDatepicker = () => setShowDatePicker(true);
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text>Name *</Text>
      <TextInput placeholder="Enter hike name" value={name} onChangeText={setName} style={{ borderWidth: 1, marginBottom: 10, padding: 5 }} />

      <Text>Location *</Text>
      <TextInput placeholder="Enter location" value={location} onChangeText={setLocation} style={{ borderWidth: 1, marginBottom: 10, padding: 5 }} />
      <Button title="📍 Detect My Location" onPress={detectLocation} />

      <Text>Date *</Text>
      <TouchableOpacity onPress={showDatepicker} style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}>
        <Text>{formatDate(date)}</Text>
      </TouchableOpacity>
      {showDatePicker && <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />}

      <Text>Parking *</Text>
      <Picker selectedValue={parking} onValueChange={setParking} style={{ borderWidth: 1, marginBottom: 10 }}>
        <Picker.Item label="Yes" value="Yes" />
        <Picker.Item label="No" value="No" />
      </Picker>

      <Text>Length (km) *</Text>
      <TextInput placeholder="Enter length" keyboardType="numeric" value={length} onChangeText={text => setLength(text.replace(/[^0-9]/g, ''))} style={{ borderWidth: 1, marginBottom: 10, padding: 5 }} />

      <Text>Difficulty *</Text>
      <Picker selectedValue={difficulty} onValueChange={setDifficulty} style={{ borderWidth: 1, marginBottom: 10 }}>
        <Picker.Item label="Easy" value="Easy" />
        <Picker.Item label="Moderate" value="Moderate" />
        <Picker.Item label="Hard" value="Hard" />
      </Picker>

      <Text>Description</Text>
      <TextInput placeholder="Optional" value={description} onChangeText={setDescription} style={{ borderWidth: 1, marginBottom: 10, padding: 5 }} />

      <Text>Participants</Text>
      <TextInput placeholder="Optional number" keyboardType="numeric" value={participants} onChangeText={setParticipants} style={{ borderWidth: 1, marginBottom: 10, padding: 5 }} />

      <Button title="Submit" onPress={validateAndConfirm} />

      <View style={{ marginTop: 10 }}>
        <Button title="Show All Hikes" onPress={() => navigation.navigate('Details')} />
      </View>
    </ScrollView>
  );
}
