import React, { useContext, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/core/src/types.tsx';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Web3Auth, { IWeb3Auth, LOGIN_PROVIDER, OPENLOGIN_NETWORK } from '@web3auth/react-native-sdk';
import * as WebBrowser from '@toruslabs/react-native-web-browser';
import EncryptedStorage from 'react-native-encrypted-storage';
import AppContext, { AppContextType } from '../AppContext.tsx';
import { CustomButton } from '../components/CustomButton.tsx';
import { Loading } from '../components/Loading.tsx';
import Api from '../common/api.ts';
import axios from '../common/axios.ts';
import { ConvertImg, GetAccounts, ValidateEmail, ValidatePhoneNumber } from '../common/function.ts';
import CommonStyles from '../common/styles.ts';
import { PROD, Web3AuthClientId } from '../common/const.ts';
import * as Sentry from '@sentry/react-native';
import ModalReport from '../components/Report.tsx';

const { width, height } = Dimensions.get('window');
const scheme = 'klikpos';
const resolvedRedirectUrl = `${scheme}://openlogin`;
const clientId = Web3AuthClientId;

interface IParam {
  search: undefined;
  klikPass: { klikPassTokenId: string };
  profile: undefined
}

const Home = () => {

  const { navigate } = useNavigation<NavigationProp<IParam>>();
  const { top, bottom } = useSafeAreaInsets();
  const { locationId, setAccessToken } = useContext(AppContext) as AppContextType;
  const [klikPasses, setKlikPasses] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [loginModal, setLoginModal] = useState(false);
  const [web3auth, setWeb3Auth] = useState<IWeb3Auth | null>(null);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isLeftMenuBar, setIsLeftMenuBar] = useState<boolean>(false);
  const [isModalReport, setIsModalReport] = useState<boolean>(false);

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

  useEffect(() => {
    const fetchKlikPasses = async () => {
      const response = await Api.getKlikPasses({ page: 1, limit: 10 });
      response?.data && setKlikPasses(response.data);
    };

    fetchKlikPasses();
  }, []);

  useEffect(() => {
    const fetchMoreKlikPasses = async () => {
      const response = await Api.getKlikPasses({ page: page + 1, limit: 10 });
      response?.data && setKlikPasses([...klikPasses, ...response.data]);
      setPage(page + 1);
    };

    if (currentIndex === klikPasses.length - 2) {
      fetchMoreKlikPasses();
    }
  }, [currentIndex, klikPasses, page]);

  const onSearch = () => {
    if (locationId) {
      setIsLeftMenuBar(false)
      navigate('search');
    }
  };

  const onNext = (item: any) => {
    if (locationId) {
      setSelectedItem(item);
      setLoginModal(true);
    }
  };

  const onContinue = async () => {
    setLoginModal(false);
    setEmailOrPhone('');
    try {
      if (!ValidateEmail(emailOrPhone) && !ValidatePhoneNumber(emailOrPhone)) {
        Toast.show({ text1: 'Email or Phone Number invalid' });
        return;
      }
      if (!web3auth) {
        Toast.show({ text1: 'Auth not configured. Please try again' });
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
      const userInfo = web3auth.userInfo();
      if (!userInfo?.idToken || !account) {
        Sentry.captureException(
          new Error(
            `Cannot get id token or account from login result: ${JSON.stringify(
              userInfo,
            )}`,
          ),
        );
        Toast.show({ text1: 'Something went wrong. Please try again.' });
        return;
      }
      const response = await Api.login({
        idToken: userInfo.idToken,
        account,
      });
      if (response?.data?.deleted) {
        Toast.show({ text1: 'Your account was deleted' });
        return;
      }
      onLoginSuccess(userInfo.idToken);
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  const onLoginSuccess = (accessToken: string) => {
    if (accessToken) {
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      setAccessToken(accessToken);
      navigate('klikPass', { klikPassTokenId: selectedItem?.token_id });
    }else{
      Toast.show({ text2: 'Can\'t verify the customer information. Please try again!', type: 'error'});
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {

    const { metadata, create_of } = item;
    const { image, name } = JSON.parse(metadata);

    return (
      <View key={index}>
        <Image
          source={{
            uri: ConvertImg(image) as any,
          }}
          style={[styles.image, { height: height - top - bottom - 50 }]}
        />
        <View style={styles.iconBox}>
          <TouchableOpacity onPress={() => onNext(item)}>
            <MaterialCommunityIcons name="share" size={40} color="#f00" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.avatarBox}>
          <Image source={{ uri: create_of?.avatar }} style={styles.avatar} />
        </View>
      </View>
    );
  };

  const onClickMenu = () => {
    setIsLeftMenuBar(true);
  }

  const onGoProfile = () => {
    setIsLeftMenuBar(false);
    navigate('profile');
  }

  return (
    <View style={[CommonStyles.container, { paddingTop: top, paddingBottom: bottom }]}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => onClickMenu()}>
          <MaterialIcons name="menu" size={30} color="#000" />
        </TouchableOpacity>
      </View>

      {klikPasses.length > 0 ? (
        <FlatList
          data={klikPasses}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          pagingEnabled={true}
          onViewableItemsChanged={({ viewableItems }) => {
            viewableItems.length > 0 &&
              setCurrentIndex(viewableItems[0].index!);
          }}
        />
      ) : (
        <Loading />
      )}

      {isModalReport && <ModalReport {...{ isModalReport, setIsModalReport }} />}

      {loginModal && <Modal
        isVisible={loginModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationOutTiming={500}
        backdropColor="#00000000">
        <View style={styles.modalContainer}>
          <View style={styles.closeIcon}>
            <TouchableOpacity onPress={() => setLoginModal(false)}>
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
      </Modal>}

      {isLeftMenuBar && <Modal
        style={styles.modalRoot}
        isVisible={isLeftMenuBar}
        animationIn="slideInLeft"
        animationOut="slideOutLeft"
        onBackdropPress={() => setIsLeftMenuBar(false)}
      >
        <View style={[styles.modal, { paddingBottom: bottom, paddingTop: top }]}>

          <View style={styles.box}>
            <Text style={styles.bigTitle}>KLIK POS</Text>

            <TouchableOpacity style={styles.row} onPress={onSearch}>
              <Text style={styles.title}>Search</Text>
              <Entypo name={`chevron-thin-right`} size={14} color={'#000'} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.row} onPress={onGoProfile}>
              <Text style={styles.title}>Profile</Text>
              <Entypo name={`chevron-thin-right`} size={14} color={'#000'} />
            </TouchableOpacity>

          </View>

          <View style={styles.divider} />

          <View style={styles.line}>
            <Text style={{ textAlign: 'right' }}>Version: {'1.1'}</Text>
          </View>

        </View>
      </Modal>}

    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  image: {
    width: width,
  },
  name: {
    width: width * 0.5,
    position: 'absolute',
    left: 20,
    bottom: 40,
    fontSize: 14,
    color: '#fff',
  },
  avatarBox: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconBox: {
    position: 'absolute',
    top: 20,
    right: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 36,
    height: 36,
    objectFit: 'contain',
  },
  iconText: {
    fontWeight: '600',
    color: '#fff',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    position: 'relative',
  },
  closeIcon: {
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
  header: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: '#f0f0f0',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8
  },
  modalRoot: {
    margin: 0,
    padding: 0,
  },
  modal: {
    backgroundColor: '#f0f0f0',
    width: width / 1.5,
    height,
    alignSelf: 'flex-start',
    flex: 1
  },
  divider: {
    height: 1,
    backgroundColor: '#9f9f9f',
  },
  logo: {
    width: 100,
    height: 40
  },
  title: {
    fontSize: 16,
    color: '#000',
    paddingLeft: 8,
    fontWeight: '600',
    flex: 1,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  box: {
    marginVertical: 12,
    flex: 1,
    borderRadius: 12,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#555',
    marginTop: 24,
  },
  bigTitle: {
    fontSize: 40,
    fontWeight: '700',
    color: '#000',
    marginVertical: 40
  }
});
