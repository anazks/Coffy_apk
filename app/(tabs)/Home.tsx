import React from 'react'
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import ListItems from '../Components/Items/ListItems'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 100 : 90, // Account for tab bar height
  },
  content: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30, // Account for status bar
  },
  homeText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
})

export default function Home() {
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* <Nav/> */}
          {/* <Save/> */}
          <ListItems/>
          <Text style={styles.homeText}>Home Screen Content</Text>
        </View>
      </ScrollView>
    </View>
  )
}