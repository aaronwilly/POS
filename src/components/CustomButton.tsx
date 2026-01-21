import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GetBtnBgColor } from '../common/function.ts';

export const CustomButton = (props: any) => {
  
  const { title, content, full, small, type, disabled, onPress } = props;
  const bgColors = GetBtnBgColor(type);

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <View style={{ opacity: !disabled ? 1 : 0.3 }}>
        <LinearGradient
          style={[
            styles.btn,
            {
              width: full ? '100%' : 220,
              backgroundColor: bgColors[1],
              height: small ? 34 : 44,
            },
          ]}
          colors={[bgColors[0], bgColors[1]]}>
          {content}
          <Text style={[styles.text, { color: bgColors[2] }]}>{title}</Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    height: 44,
    backgroundColor: '#26f1d3',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    color: '#000',
  },
});
