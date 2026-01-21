import React, { useContext, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Web3Auth, {
  IWeb3Auth,
  LOGIN_PROVIDER,
  OPENLOGIN_NETWORK,
} from '@web3auth/react-native-sdk';
import * as WebBrowser from '@toruslabs/react-native-web-browser';
import EncryptedStorage from 'react-native-encrypted-storage';
import * as Sentry from '@sentry/react-native';
import AppContext, { AppContextType } from '../AppContext.tsx';
import { CustomButton } from '../components/CustomButton.tsx';
import Images from '../common/images.ts';
import {
  GetAccounts,
  ValidateEmail,
  ValidatePhoneNumber,
} from '../common/function.ts';
import Api from '../common/api.ts';
import Storage from '../common/storage.ts';
import CommonStyles from '../common/styles.ts';
import { PROD, Web3AuthClientId } from '../common/const.ts';

const { width, height } = Dimensions.get('window');
const scheme = 'klikpos';
const resolvedRedirectUrl = `${scheme}://openlogin`;
const clientId = Web3AuthClientId;

const Login = () => {

  const { setSalesAccount, setLocationId } = useContext(AppContext) as AppContextType;
  const [web3auth, setWeb3Auth] = useState<IWeb3Auth | null>(null);
  const [emailOrPhone, setEmailOrPhone] = useState('');

  useEffect(() => {
    const init = async () => {
      const auth = new Web3Auth(WebBrowser, EncryptedStorage, {
        clientId,
        network: PROD ? OPENLOGIN_NETWORK.CYAN : OPENLOGIN_NETWORK.TESTNET,
      });
      setWeb3Auth(auth);
      await auth.init();
    };

    init();
  }, []);

  const onGoogle = async () => {
    try {
      if (!web3auth) {
        Toast.show({ text1: 'Auth not configured. Please try again' });
        return;
      }

      await web3auth.login({
        loginProvider: LOGIN_PROVIDER.GOOGLE,
        redirectUrl: resolvedRedirectUrl,
      });

      const account = await GetAccounts(web3auth.privKey!);
      const response = await Api.login({ ...web3auth.userInfo(), account });
      if (response?.data?.deleted) {
        return Toast.show({ text1: 'Your account was deleted' });
      }
      await onLoginSuccess(account!);
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  const onApple = async () => {
    try {
      if (!web3auth) {
        Toast.show({ text1: 'Auth not configured. Please try again' });
        return;
      }

      await web3auth.login({
        loginProvider: LOGIN_PROVIDER.APPLE,
        redirectUrl: resolvedRedirectUrl,
      });

      const account = await GetAccounts(web3auth.privKey!);
      const response = await Api.login({ ...web3auth?.userInfo(), account });
      if (response?.data?.deleted) {
        return Toast.show({ text1: 'Your account was deleted' });
      }
      await onLoginSuccess(account!);
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  const onContinue = async () => {
    try {
      if (!ValidateEmail(emailOrPhone) && !ValidatePhoneNumber(emailOrPhone)) {
        return Toast.show({ text1: 'Email or Phone Number invalid' });
      }
      if (!web3auth) {
        return Toast.show({
          text1: 'Auth not configured. Please reload the app',
        });
      }
      const guestConfig = await Api.getGuestConfig();
      if (guestConfig?.salespersons?.includes(emailOrPhone.toLowerCase())) {
        await onLoginSuccess(emailOrPhone, guestConfig.locationId);
        return;
      }

      await web3auth.login({
        loginProvider: ValidateEmail(emailOrPhone)
          ? LOGIN_PROVIDER.EMAIL_PASSWORDLESS
          : LOGIN_PROVIDER.SMS_PASSWORDLESS,
        redirectUrl: resolvedRedirectUrl,
        extraLoginOptions: {
          login_hint: ValidateEmail(emailOrPhone)
            ? emailOrPhone
            : `+1-${emailOrPhone}`,
        },
      });

      const account = await GetAccounts(web3auth?.privKey!);
      const response = await Api.login({ ...web3auth?.userInfo(), account });
      if (response?.data?.deleted) {
        return Toast.show({ text1: 'Your account was deleted' });
      }
      await onLoginSuccess(account!);
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  const onLoginSuccess = async (account: string, locationId?: string) => {
    await Storage.storeData('salesAccount', account);
    if (locationId) {
      await Storage.storeData('locationId', locationId);
      setLocationId(locationId);
    }
    setSalesAccount(account);
  };

  return (
    <SafeAreaView style={[CommonStyles.container, { backgroundColor: '#005691' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={CommonStyles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.loginContainer, { position: 'relative' }]}>

            <View style={styles.logoGroup}>
              <Pressable>
                <Image source={Images.LOGO2} style={styles.logo} />
              </Pressable>
              <Text style={styles.logoDescription}>
                Create an account or Sign in as a Salesperson.
              </Text>
            </View>

            <View style={styles.contentBox}>
              <View style={[styles.socialGroup, { flexDirection: Platform.OS === 'android' ? 'row' : 'row-reverse'}]}>

                <View style={styles.socialItem}>
                  <CustomButton
                    title="Google"
                    content={
                      <Ionicons
                        name="logo-google"
                        size={26}
                        color="#fff"
                        style={{ marginRight: 5 }}
                      />
                    }
                    full
                    type="red"
                    onPress={onGoogle}
                  />
                </View>

                <View style={styles.socialItem}>
                  <CustomButton
                    title="Apple"
                    content={
                      <AntDesign
                        name="apple1"
                        size={26}
                        color="#000"
                        style={{ marginRight: 5 }}
                      />
                    }
                    full
                    type="white"
                    onPress={onApple}
                  />
                </View>

              </View>

              <Text style={[CommonStyles.text14, { color: '#fff' }]}>
                Email or Phone
              </Text>

              <TextInput
                style={styles.emailOrPhoneInput}
                placeholder="Eg: 1234567890/name@example.com"
                placeholderTextColor="#bbb"
                value={emailOrPhone}
                onChangeText={value => setEmailOrPhone(value.trim())}
              />

              <CustomButton
                title="Continue"
                full
                type="green"
                disabled={!emailOrPhone}
                onPress={onContinue}
              />

            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    backgroundColor: '#005691',
  },
  logoGroup: {
    marginTop: 40,
    alignItems: 'center',
    flexDirection: 'column',
  },
  logo: {
    width: width / 2,
    height: width / 6,
  },
  logoTitle: {
    fontSize: 32,
    color: '#fff',
  },
  logoDescription: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 12,
  },
  contentBox: {
    marginTop: height / 15,
  },
  socialGroup: {
    marginVertical: 10,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  socialItem: {
    width: width / 2 - 28,
    marginHorizontal: 4,
  },
  emailOrPhoneInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    marginBottom: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    color: '#fff',
  },
});
