import React, { useContext, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/core/src/types.tsx';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDebouncedCallback } from 'use-debounce';
import Web3Auth, {
  IWeb3Auth,
  LOGIN_PROVIDER,
  OPENLOGIN_NETWORK,
} from '@web3auth/react-native-sdk';
import * as Sentry from '@sentry/react-native';
import * as WebBrowser from '@toruslabs/react-native-web-browser';
import EncryptedStorage from 'react-native-encrypted-storage';
import AppContext, { AppContextType } from '../AppContext.tsx';
import { KlikPassAtom } from '../components/KlikPassAtom.tsx';
import { CustomButton } from '../components/CustomButton.tsx';
import Api from '../common/api.ts';
import axios from '../common/axios.ts';
import {
  GetAccounts,
  ValidateEmail,
  ValidatePhoneNumber,
} from '../common/function.ts';
import { PROD, Web3AuthClientId } from '../common/const.ts';

const { width, height } = Dimensions.get('window');

const scheme = 'klikpos';
const resolvedRedirectUrl = `${scheme}://openlogin`;
const clientId = Web3AuthClientId;

interface IParam {
  klikPass: { klikPassTokenId: string };
}

const Search = () => {
  const { navigate } = useNavigation<NavigationProp<IParam>>();
  const { setAccessToken } = useContext(AppContext) as AppContextType;

  const [searchText, setSearchText] = useState('');
  const [searchKlikPasses, setSearchKlikPasses] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [web3auth, setWeb3Auth] = useState<IWeb3Auth | null>(null);
  const [emailOrPhone, setEmailOrPhone] = useState('');

  useEffect(() => {
    const fetchAllKlikPasses = async () => {
      const response = await Api.getKlikPasses({
        search: searchText,
        page: 1,
        limit: 12,
      });
      response?.data && setSearchKlikPasses(response?.data);
    };

    fetchAllKlikPasses();
  }, [searchText]);

  const debounced = useDebouncedCallback((value: string) => {
    setSearchKlikPasses([]);
    onSearchKlikPasses(value);
  }, 1000);

  const onSearchKlikPasses = async (value: string) => {
    const response = await Api.getKlikPasses({
      search: value,
      page: 1,
      limit: 12,
    });
    response?.data && setSearchKlikPasses(response?.data);
  };

  const onChangeText = (value: string) => {
    setSearchText(value);
    debounced(value);
  };

  const onClearText = async () => {
    const response = await Api.getKlikPasses({
      search: '',
      page: 1,
      limit: 12,
    });
    response?.data && setSearchKlikPasses(response?.data);
    setSearchText('');
  };

  const loadMoreOlderItems = async () => {
    const response = await Api.getKlikPasses({
      search: searchText,
      page: page + 1,
      limit: 12,
    });
    response?.data &&
      setSearchKlikPasses([...searchKlikPasses, ...response.data]);
    setPage(page + 1);
  };

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

  const onContinue = async () => {
    setModalVisible(false);
    setEmailOrPhone('');
    try {
      if (!ValidateEmail(emailOrPhone) && !ValidatePhoneNumber(emailOrPhone)) {
        Toast.show({ text1: 'Email or Phone Number invalid' });
        return;
      }
      if (!web3auth) {
        Toast.show({ text1: 'Auth not configured. Please reload the app' });
        return;
      }
      const guestConfig = await Api.getGuestConfig();
      if (guestConfig?.customers?.includes(emailOrPhone.toLowerCase())) {
        onLoginSuccess(emailOrPhone);
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
      const response = await Api.login({ ...web3auth?.userInfo, account });
      if (response?.data?.deleted) {
        Toast.show({ text1: 'Your account was deleted' });
        return;
      }
      const token: any = web3auth.userInfo()?.idToken
      onLoginSuccess(token);
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  const onLoginSuccess = (accessToken: string) => {
    if (accessToken) {
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      setAccessToken(accessToken);
    }
    navigate('klikPass', { klikPassTokenId: selectedItem?.token_id });
  };

  return (
    <SafeAreaView>
      <View style={styles.row}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.input}
            placeholder="Search..."
            placeholderTextColor="#aaa"
            value={searchText}
            onChangeText={onChangeText}
          />
          {searchText && (
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => onClearText()}>
              <AntDesign name="close" size={22} color="#aaa" />
            </TouchableOpacity>
          )}
          <Ionicons
            name="search-outline"
            size={22}
            color="#aaa"
            style={{ position: 'absolute', left: 20, top: 8 }}
          />
        </View>
      </View>

      <FlatList
        initialNumToRender={15}
        numColumns={3}
        horizontal={false}
        data={searchKlikPasses}
        windowSize={5}
        maxToRenderPerBatch={3}
        onEndReached={loadMoreOlderItems}
        onEndReachedThreshold={0.8}
        keyExtractor={item => item?._id}
        renderItem={({ item, index }) => (
          <KlikPassAtom
            key={index}
            item={item}
            setSelectedItem={setSelectedItem}
            setModalVisible={setModalVisible}
          />
        )}
      />

      <Modal
        isVisible={modalVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationOutTiming={500}
        backdropColor="#00000000">
        <View style={styles.modalContainer}>
          <View style={styles.modalCloseIcon}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalTitle}>
            Please fill in Email or Phone Number as a Customer
          </Text>
          <TextInput
            style={styles.modalInput}
            placeholder="1234567890/name@example.com"
            placeholderTextColor="#aaa"
            value={emailOrPhone}
            onChangeText={value => setEmailOrPhone(value.trim())}
          />
          <View style={styles.modalBtnGroup}>
            <CustomButton
              title="Continue"
              type="green"
              disabled={!emailOrPhone}
              onPress={onContinue}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Search;

const styles = StyleSheet.create({
  modal: {
    width: width,
    height: height,
    backgroundColor: '#fefefe',
    borderRadius: 12,
  },
  row: {
    paddingTop: 12,
    marginBottom: 5,
  },
  searchBox: {
    position: 'relative',
  },
  input: {
    borderColor: '#212121',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#000',
    paddingVertical: 5,
    marginHorizontal: 12,
    height: 40,
    paddingLeft: 40,
  },
  closeIcon: {
    position: 'absolute',
    right: 22,
    top: 8,
  },
  userItem: {
    height: 80,
    width: 68,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 10,
    marginTop: 3,
    marginBottom: 5,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginTop: -5,
  },
  more: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#888',
    marginTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  moreText: {
    fontSize: 10,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    position: 'relative',
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  modalTitle: {
    marginTop: 15,
    marginBottom: 15,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
  },
  modalInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    color: '#000',
  },
  modalBtnGroup: {
    marginTop: 40,
    alignItems: 'center',
  },
});
