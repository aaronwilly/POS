import React, { useContext, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Modal from 'react-native-modal';
import AppContext, { AppContextType } from '../AppContext.tsx';
import { Loading } from '../components/Loading.tsx';
import { CustomButton } from '../components/CustomButton.tsx';
import Api from '../common/api.ts';

const ModalContentReport = ({ isConfirm, onClose, reportContent, itemId, creatorId }: any) => {

  const { salesAccount } = useContext(AppContext) as AppContextType;
  const [isLoading, setIsLoading] = useState(false);

  const onOk = async () => {
    
    setIsLoading(true);

    const requestBody = {
      videoId: itemId,
      creatorId,
      type: 'KlikPass',
      content: reportContent,
      reporterId: salesAccount,
    }

    const response = await Api.createReport(requestBody);

    if (response?.success) {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Modal
      style={styles.modalRoot}
      isVisible={isConfirm}
      onBackdropPress={onClose}
    >
      <View style={styles.modal}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 18 }}>Content Reported</Text>
        </View>

        <Text style={{ textAlign: 'center', marginTop: 20 }}>We will review the report and will no longer show this content to you</Text>

        <View style={styles.buttonContainer}>
          <CustomButton title={'OK'} onPress={() => onOk()} small full type={'blue'} />
        </View>
      </View>

      {isLoading && <Loading />}

    </Modal>
  );
};

export default ModalContentReport;

const styles = StyleSheet.create({
  modalRoot: {
    justifyContent: 'center',
    margin: 12,
  },
  modal: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
});
