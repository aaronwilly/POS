import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStripeTerminal } from '@stripe/stripe-terminal-react-native';
import { NavigationProp } from '@react-navigation/core/src/types.tsx';
import Modal from 'react-native-modal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppContext, { AppContextType } from '../AppContext.tsx';
import { CustomButton } from '../components/CustomButton.tsx';
import Api from '../common/api.ts';
import CommonStyles from '../common/styles.ts';
import Toast from 'react-native-toast-message';

interface IParam {
  payment: { secret: string };
}

const KlikPass = () => {

  const { navigate, goBack } = useNavigation<NavigationProp<IParam>>();
  const route = useRoute();
  const { initialize } = useStripeTerminal();
  const { salesAccount, accessToken } = useContext(AppContext) as AppContextType;
  const [klikPass, setKlikPass] = useState<any | null>(null);
  const [selectOwner, setSelectOwner] = useState<any>(null);
  const [confirmSuccess, setConfirmSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const { klikPassTokenId } = route.params as { klikPassTokenId: string };

  console.log('accessToken ', accessToken)

  useEffect(() => {
    (async () => {
      const { error, reader } = await initialize();
      if (error) {
        Alert.alert(
          'initialize',
          `${JSON.stringify(error)} ${JSON.stringify(reader)}`,
        );
      }
    })();
  }, [initialize]);

  useEffect(() => {
    if (!klikPassTokenId) return;
    (async () => {
      const response = await Api.getKlikPass(klikPassTokenId);
      if(response?.data){
        setKlikPass(response?.data);
      }else{
        setIsError(true);
        Toast.show({ text1: 'Can\'t find this KLIKpass.', type: 'error' });
      }
    })();
  }, [klikPassTokenId]);

  const getImage = () => {
    const { metadata } = klikPass;
    return JSON.parse(metadata).image?.replace(
      'https://klik-medias.s3.amazonaws.com',
      'https://d2dpawrikb755t.cloudfront.net',
    );
  };

  const onPay = async (item: any) => {
    setSelectOwner(item);
    setConfirmSuccess(true);
  };

  const onConfirm = async () => {
    setConfirmSuccess(false);
    const response = await Api.createPaymentIntent({
      lazyMintId: selectOwner?._id!,
      salesAccountId: salesAccount,
    });

    navigate('payment', { secret: response?.secret });
  };

  return (
    <SafeAreaView style={CommonStyles.container}>
      {klikPass && (
        <Image source={{ uri: getImage() }} style={[styles.image, {}]} />
      )}
      { isError && <View style={{flex: 1, justifyContent: 'center', alignItems: "center"}}>
           <TouchableOpacity style={styles.modalBtnGroup}>
            <CustomButton title="Go Back" onPress={() => goBack()} type="red" />
          </TouchableOpacity>
          </View>}
      <View style={styles.contentBox}>
        <Text style={styles.title}>{klikPass?.title}</Text>
        <ScrollView>
          {klikPass?.prices &&
            klikPass?.prices.map((item: any, index: number) => (
              <View key={index} style={styles.ownerBox}>

                <View style={styles.leftBox}>
                  <Image
                    source={{ uri: item?.owner_of?.avatar }}
                    style={styles.ownerAvatar}
                  />
                  <View style={styles.nameBox}>
                    <Text style={CommonStyles.text14}>
                      {item?.owner_of?.firstName
                        ? `${item?.owner_of?.firstName} ${item?.owner_of?.lastName}`
                        : item?.owner_of?.username}
                    </Text>
                    <Text style={CommonStyles.text14}>{`$${(
                      item?.price / 100
                    ).toFixed(2)}`}</Text>
                  </View>
                </View>

                <View style={styles.rightBox}>
                  <View style={styles.cartBox}>
                    <Text style={[CommonStyles.text14, { marginRight: 4 }]}>
                      {item?.amount || 1}
                    </Text>
                    <MaterialCommunityIcons
                      name="cart-variant"
                      size={20}
                      color="#000"
                    />
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: item.canBuyWithCard
                        ? '#72ce67'
                        : '#b7b7b7',
                      borderRadius: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                    }}
                    disabled={!item.canBuyWithCard}
                    onPress={() => onPay(item)}>
                    <Text style={{ color: '#fff' }}>Buy</Text>
                  </TouchableOpacity>
                  <View />
                </View>

              </View>
            ))}
        </ScrollView>
      </View>

      <Modal
        isVisible={confirmSuccess}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationOutTiming={500}
        backdropColor="#00000000">
        <View style={styles.modalContainer}>
          <View style={styles.closeIcon}>
            <TouchableOpacity onPress={() => setConfirmSuccess(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalTitle}>
            You will pay {selectOwner?.price / 100}$ to buy this KlikPass.
          </Text>
          <View style={styles.modalBtnGroup}>
            <CustomButton title="Ok" onPress={onConfirm} type="green" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default KlikPass;

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
});
