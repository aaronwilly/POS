import React, { useState, useContext } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import Feather from 'react-native-vector-icons/Feather';
import AppContext, { AppContextType } from '../AppContext.tsx';
import ModalContentReport from './ContentReport';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/core/src/types.tsx';

const ReportContents = [
  'Abusive or obscene content', 
  'Promotes violence against self or others', 
  'Other harmful material'
];

interface IParam {
  login: undefined
}

const ModalReport = ({ isModalReport, setIsModalReport, item, type }: any) => {

  const { bottom } = useSafeAreaInsets();
  const { salesAccount } = useContext(AppContext) as AppContextType;
  const { navigate } = useNavigation<NavigationProp<IParam>>();
  const [isReport, setIsReport] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const itemId = item?._id;
  const creatorId = item?.creatorId;
  const isMine = creatorId === salesAccount;

  const onConfirm = (item: any) => {
    if (salesAccount) {
      setReportContent(item);
      setIsConfirm(true);
    } else {
      navigate('login')
    }
  };

  const onClose = () => {
    setIsConfirm(false);
    setIsReport(false);
    setIsModalReport(false);
  };

  return (
    <Modal
      style={styles.modalRoot}
      isVisible={isModalReport}
      onBackdropPress={() => setIsModalReport(false)}
    >
      <View style={[styles.modal, { paddingBottom: bottom + 12 }]}>

        {!isMine && !isReport && (
          <TouchableOpacity onPress={() => setIsReport(true)} style={styles.btn}>
            <Feather name="flag" size={20} color="#000" />
            <Text style={styles.text1}>Report Content</Text>
          </TouchableOpacity>
        )}

        {isReport && (
          <View>
            <View style={styles.row}>
              <Feather name="flag" size={20} color="#000" />
              <Text style={styles.reportText}>Report Content</Text>
            </View>

            {ReportContents.map((item, index) => (
              <TouchableOpacity key={index} style={styles.boxDetail} onPress={() => onConfirm(item)}>
                <Text style={styles.text}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {isConfirm && <ModalContentReport {...{ isConfirm, onClose, reportContent, itemId, creatorId, type }} />}

      </View>
    </Modal>
  );
};

export default ModalReport;

const styles = StyleSheet.create({
  modalRoot: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modal: {
    // backgroundColor: COLORS.BACKGROUND,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  reportText: {
    color: '#000',
    fontSize: 13,
    marginLeft: 6,
  },
  text: {
    color: '#000',
    marginLeft: 8,
  },
  boxDetail: {
    flexDirection: 'row',
    // backgroundColor: COLORS.ColorE,
    alignItems: 'center',
    padding: 8,
    borderRadius: 30,
    marginBottom: 8,
    elevation: 2,
  },
  text1: {
    fontSize: 15,
    color: '#000',
    marginLeft: 8,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    // backgroundColor: COLORS.ColorE,
    padding: 8,
    paddingHorizontal: 20,
    borderRadius: 22
  }
});
