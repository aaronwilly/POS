import React, { useContext, useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import * as Sentry from '@sentry/react-native';
import AppContext, { AppContextType } from '../AppContext.tsx';
import { CustomButton } from '../components/CustomButton.tsx';
import { Loading } from '../components/Loading.tsx';
import Api from '../common/api.ts';
import Storage from '../common/storage.ts';
import CommonStyles from '../common/styles.ts';

const Location = () => {

  const { salesAccount, setLocationId } = useContext(AppContext) as AppContextType;
  const [line1, setLine1] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const checkPermissions = async () => {
      if (Platform.OS === 'android') {
        await requestPermissions();
      }
    };

    checkPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      ]);
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  const onSubmit = async () => {
    if (!line1 || !city || !state || !postalCode) {
      Toast.show({
        type: 'info',
        text1: 'Please fill in all fields',
      });
    } else {
      setLoading(true);
      const response = await Api.getLocation({
        line1,
        city,
        state,
        postalCode,
        salesAccountId: salesAccount,
      });
      if (response?.locationId) {
        await Storage.storeData('locationId', response?.locationId);
        setLocationId(response?.locationId);
        setLoading(false);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Bad Requests',
        });
        setLoading(false);
      }
    }
  };

  const onSkip = async () => {

    const response = await Api.getGuestConfig();

    if (response?.locationId) {
      await Storage.storeData('locationId', response?.locationId);
      setLocationId(response?.locationId);
      setLoading(false);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Bad Requests',
      });
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={CommonStyles.container}>
      {loading ? (
        <Loading />
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={CommonStyles.container}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView>
              <View style={[CommonStyles.container, { padding: 40 }]}>

                <Text style={styles.title}>Please input your address!</Text>

                <View style={styles.inputGroup}>
                  <Text style={CommonStyles.text14}>Line1</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1731 N Elm St"
                    placeholderTextColor="#aaa"
                    value={line1}
                    onChangeText={value => setLine1(value)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={CommonStyles.text14}>City</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Commerce"
                    placeholderTextColor="#aaa"
                    value={city}
                    onChangeText={value => setCity(value)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={CommonStyles.text14}>State</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="GA"
                    placeholderTextColor="#aaa"
                    value={state}
                    onChangeText={value => setState(value)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={CommonStyles.text14}>Postal Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="30529"
                    placeholderTextColor="#aaa"
                    value={postalCode}
                    onChangeText={value => setPostalCode(value)}
                  />
                </View>

                <View style={styles.btnGroup}>
                  <CustomButton
                    title="Submit"
                    type="green"
                    disabled={false}
                    onPress={onSubmit}
                  />
                  <TouchableOpacity style={styles.skipText} onPress={onSkip}>
                    <Text style={styles.text}>Skip</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

export default Location;

const styles = StyleSheet.create({
  title: {
    marginBottom: 20,
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    color: '#000',
  },
  btnGroup: {
    marginTop: 20,
    alignItems: 'center',
  },
  skipText: {
    marginTop: 20
  },
  text: {
    color: '#000',
    fontSize: 14
  }
});
