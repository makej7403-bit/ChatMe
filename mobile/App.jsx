import React from 'react';
import { Text, View, Button } from 'react-native';
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// (You will adapt sign-in for React Native; this is a starting skeleton)
export default function App() {
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <Text>ChatMe Mobile (skeleton)</Text>
      <Text>Use Expo to continue building the mobile features.</Text>
    </View>
  );
}
