import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';

export default ({ onPress, text, style }) => (
  <TouchableOpacity onPress={onPress}>
    <View
      style={[
        {
          width: 240,
          height: 64,
          backgroundColor: '#3d98bd',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 14,
        },
        style || {},
      ]}
    >
      <Text style={{ color: 'white' }}>{text}</Text>
    </View>
  </TouchableOpacity>
);
