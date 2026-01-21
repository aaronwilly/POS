import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';

const storeData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(`@klikpos${key}`, jsonValue);
  } catch (e) {
    Sentry.captureException(e);
  }
};

const getData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(`@klikpos${key}`);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    Sentry.captureException(e);
  }
};

const removeData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(`@klikpos${key}`);
  } catch (e) {
    Sentry.captureException(e);
  }
};


export default {
  storeData,
  getData,
  removeData
};
