import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListItems from '../Components/Items/ListItems';

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContainer: {
    padding: 5,
  },
  homeText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  
  },
});

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ListItems />
          <Text style={styles.homeText}>Home Screen Content</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}