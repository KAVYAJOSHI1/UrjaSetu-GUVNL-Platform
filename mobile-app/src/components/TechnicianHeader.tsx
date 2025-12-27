import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TechnicianHeaderProps {
  userName: string;
}

const TechnicianHeader = ({ userName }: TechnicianHeaderProps) => {
  return (
    // The main container keeps the original padding and bottom border
    <View style={styles.container}>
      {/* The user's name is the only element remaining */}
      <Text style={styles.nameText}>{userName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row', // This aligns children in a row
    alignItems: 'center', // This vertically centers the text
    paddingHorizontal: 20,
    paddingTop:50,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // A very subtle separator line
  },
  nameText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
});

export default TechnicianHeader;