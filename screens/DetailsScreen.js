// screens/DetailsScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Button, Alert } from 'react-native';
import { getAllHikesfilebase, deleteHikefilebase, resetHikesfilebase } from '../storage/HikeStorage';
import { useFocusEffect } from '@react-navigation/native';

export default function DetailsScreen({ navigation }) {
  const [hikes, setHikes] = useState([]);

  const loadHikes = async () => {
    try {
      const arr = await getAllHikesfilebase();
      setHikes(arr || []);
    } catch (err) {
      console.log('loadHikes err', err);
      setHikes([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHikes();
    }, [])
  );

  const handleDelete = (id) => {
    Alert.alert('Delete Hike', 'Are you sure you want to delete this hike?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: async () => { await deleteHikefilebase(id); await loadHikes(); } }
    ]);
  };

  const handleReset = () => {
    Alert.alert('Reset All Hikes', 'Are you sure you want to reset all hikes?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: async () => { await resetHikesfilebase(); await loadHikes(); } }
    ]);
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 }}>
        <Button title="Reset Hikes" onPress={handleReset} />
      </View>

      {hikes.length === 0 && <Text>No hikes found. Add one from Add Hike 🏔️</Text>}

      {hikes.map(hike => (
        <View key={hike.id} style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}>
          <Text>🏞️ Name {hike.name}</Text>
          <Text>📍 Location {hike.location}</Text>
          <Text>📅 Date {hike.date}</Text>
          <Text>🅿️ Parking {hike.parking}</Text>
          <Text>📏 Length {hike.length} km</Text>
          <Text>⚙️ Difficulty {hike.difficulty}</Text>
          {hike.description ? <Text>📝 Description {hike.description}</Text> : null}
          {hike.participants ? <Text>👥 Participants {hike.participants}</Text> : null}

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 5 }}>
            <Button title="Edit" onPress={() => navigation.navigate('EditHike', { hike })} />
            <Button title="Delete" color="red" onPress={() => handleDelete(hike.id)} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
