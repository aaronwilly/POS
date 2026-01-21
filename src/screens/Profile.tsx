import React, { useContext, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import Modal from 'react-native-modal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppContext, { AppContextType } from '../AppContext.tsx';
import { CustomButton } from '../components/CustomButton.tsx';
import CommonStyles from '../common/styles.ts';
import Storage from '../common/storage.ts';

const ProfileScreen = () => {

  const { goBack } = useNavigation();
  const [isVisibleDelete, setIsVisibleDelete] = useState<boolean>(false);
  const [isVisibleLogout, setIsVisibleLogout] = useState<boolean>(false);
  const { salesAccount, setAccessToken, setSalesAccount, setLocationId } = useContext(AppContext) as AppContextType;

  const onLogOut = () => {
    setIsVisibleLogout(true)
  }

  const onDeleteAccount = () => {
    setIsVisibleDelete(true);
  }

  const onConfirmLogout = async() => {
    setIsVisibleLogout(false);
    await Storage.removeData('salesAccount');
    await Storage.removeData('locationId');
    setSalesAccount('');
    setAccessToken('');
    setLocationId('');
  }

  const onConfirmDelete = async() => {
    setIsVisibleDelete(true);
    await Storage.removeData('salesAccount');
    await Storage.removeData('locationId');
    setSalesAccount('');
    setAccessToken('');
    setLocationId('');
    Alert.alert('Delete', `Your account has been successfully deleted!`);
    setIsVisibleDelete(false);
  }

  const onGoBack = () => {
    goBack();
  }

  return (
    <SafeAreaView style={CommonStyles.container}>

      <View style={styles.contentBox}>

        <TouchableOpacity style={styles.leftIcon} onPress={onGoBack}>
          <Entypo name={`chevron-thin-left`} size={24} color={'#000'} />
        </TouchableOpacity>

        <Text style={styles.title}>{salesAccount}</Text>

        <View style={styles.modalBtnGroup}>
          <CustomButton title="Log out" onPress={onLogOut} type="blue" />
        </View>

        <View style={styles.modalBtnGroup}>
          <CustomButton title="Delete Account" onPress={onDeleteAccount} type="red" />
        </View>
      </View>

      {isVisibleLogout && <Modal
        isVisible={isVisibleLogout}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationOutTiming={500}
        backdropColor="#00000000"
      >
        <View style={styles.modalContainer}>
          <View style={styles.closeIcon}>
            <TouchableOpacity onPress={() => setIsVisibleLogout(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalTitle}>
            Are you sure you would like to sign out of your KLIK POS account?
          </Text>
          <View style={styles.modalBtnGroup}>
            <CustomButton title="OK" onPress={onConfirmLogout} type="red" />
          </View>
        </View>
      </Modal>}

      {isVisibleLogout && <Modal
        isVisible={isVisibleLogout}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationOutTiming={500}
        backdropColor="#00000000"
      >
        <View style={styles.modalContainer}>
          <View style={styles.closeIcon}>
            <TouchableOpacity onPress={() => setIsVisibleLogout(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalTitle}>
            Are you sure you would like to sign out of your KLIK POS account?
          </Text>
          <View style={styles.modalBtnGroup}>
            <CustomButton title="OK" onPress={onConfirmLogout} type="blue" />
          </View>
        </View>
      </Modal>}

      {isVisibleDelete && <Modal
        isVisible={isVisibleDelete}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationOutTiming={500}
        backdropColor="#00000000"
      >
        <View style={styles.modalContainer}>
          <View style={styles.closeIcon}>
            <TouchableOpacity onPress={() => setIsVisibleDelete(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalTitle}>
            Are you sure you would like to delete the account?
          </Text>
          <View style={styles.modalBtnGroup}>
            <CustomButton title="OK" onPress={onConfirmDelete} type="red" />
          </View>
        </View>
      </Modal>}

    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 300,
  },
  contentBox: {
    padding: 20,
    paddingTop: 20,
  },
  title: {
    marginVertical: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: "center"
  },
  ownerBox: {
    marginVertical: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameBox: {
    marginLeft: 12,
    display: 'flex',
    flexDirection: 'column',
  },
  rightBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBox: {
    marginRight: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerAvatar: {
    width: 40,
    height: 40,
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
    marginTop: 20,
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
  },
  modalBtnGroup: {
    marginTop: 20,
    alignItems: 'center',
  },
  leftIcon: {
    // padding: 2
  }
});
