import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/core/src/types.tsx';
import Modal from 'react-native-modal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  StripeError,
  useStripeTerminal,
} from '@stripe/stripe-terminal-react-native';
import * as Sentry from '@sentry/react-native';
import AppContext, { AppContextType } from '../AppContext.tsx';
import { CustomButton } from '../components/CustomButton.tsx';
import { Loading } from '../components/Loading.tsx';
import axios from '../common/axios.ts';
import Images from '../common/images.ts';

const { width, height } = Dimensions.get('window');

interface IParam {
  home: undefined;
}

const Payment = () => {
  const { reset } = useNavigation<NavigationProp<IParam>>();
  const route = useRoute();
  const { locationId, setAccessToken } = useContext(
    AppContext,
  ) as AppContextType;

  const [loading, setLoading] = useState<boolean>(false);
  const [confirmSuccess, setConfirmSuccess] = useState<boolean>(false);

  const { secret } = route.params as {
    secret: string;
  };

  const {
    discoverReaders,
    connectLocalMobileReader,
    retrievePaymentIntent,
    collectPaymentMethod,
    confirmPaymentIntent,
    disconnectReader,
    discoveredReaders,
    connectedReader,
  } = useStripeTerminal({
    onUpdateDiscoveredReaders: readers => {
      setLoading(true);
      !connectedReader &&
        readers.length > 0 &&
        handleConnectLocalMobileReader(readers[0]);
    },
    onDidReportUnexpectedReaderDisconnect(error?: StripeError) {
      Alert.alert(
        'Card Reader Error',
        'Card reader disconnected unexpectedly. Please try again later.',
      );

      Sentry.captureException(error);
      disconnectReader();
      discoveredReaders.length > 0 &&
        handleConnectLocalMobileReader(discoveredReaders[0]);
    },
  });

  const onGoBack = useCallback(() => {
    setAccessToken('');
    delete axios.defaults.headers.common.Authorization;
    reset({ index: 0, routes: [{ name: 'home' }] });
  }, [reset, setAccessToken]);

  useEffect(() => {
    (async () => {
      const { error } = await discoverReaders({
        discoveryMethod: 'localMobile',
        simulated: false,
      });
      if (error) {
        Alert.alert(
          'Error Discovering Reader',
          'Something went wrong in discovering reader. Please try again later.',
          [{ onPress: onGoBack }],
        );
        Sentry.captureException(error);
        setLoading(false);
      }
    })();
  }, [discoverReaders, onGoBack]);

  const handleConnectLocalMobileReader = async (_reader: any) => {
    const { reader, error } = await connectLocalMobileReader({
      reader: _reader,
      locationId: locationId,
    });

    if (error) {
      Sentry.captureException(error);
      return setLoading(false);
    }

    if (reader) {
      handleRetrievePaymentIntent();
    }
  };

  const handleRetrievePaymentIntent = async () => {
    const { paymentIntent, error } = await retrievePaymentIntent(secret);

    if (error) {
      Sentry.captureException(error);
      return setLoading(false);
    }
    if (paymentIntent) {
      setLoading(false);
      handleCollectPaymentMethod(paymentIntent);
    }
  };

  const handleCollectPaymentMethod = async (intent: any) => {
    const { paymentIntent, error } = await collectPaymentMethod({
      paymentIntent: intent,
      // enableCustomerCancellation: true,
    });

    if (error) {
      Sentry.captureException(error);
      Alert.alert(
        'Error Collecting Payment Method',
        'Something went wrong in collecting payment method. Please try again later.',
      );
      return;
    }
    if (paymentIntent) {
      handleConfirmPaymentIntent(paymentIntent);
    }
  };

  const handleConfirmPaymentIntent = async (intent: any) => {
    const { paymentIntent, error } = await confirmPaymentIntent(intent);

    if (error) {
      Sentry.captureException(error);
      Alert.alert(
        'Error Confirming Payment',
        'Something went wrong in confirming payment. Please try again later.',
      );
      return;
    }
    if (paymentIntent) {
      Sentry.captureMessage('ConfirmPaymentIntent', 'debug');
      // disconnectReader();
      setConfirmSuccess(true);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Image source={Images.TAP_TO_PAY} style={styles.image} />

      {loading && (
        <View style={{ width, height, position: 'absolute' }}>
          <Loading />
        </View>
      )}

      <Modal
        isVisible={confirmSuccess}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationOutTiming={500}
        backdropColor="#00000000">
        <View style={styles.modalContainer}>
          <View style={styles.closeIcon}>
            <TouchableOpacity onPress={onGoBack}>
              <MaterialCommunityIcons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalTitle}>
            Payment process was successfully finished.
          </Text>
          <View style={styles.modalBtnGroup}>
            <CustomButton title="Ok" onPress={onGoBack} type="green" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Payment;

const styles = StyleSheet.create({
  image: {
    width: '100%',
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
