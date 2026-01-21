import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

export const KlikPassAtom = ({
  item,
  setSelectedItem,
  setModalVisible,
}: {
  item: any;
  setSelectedItem: any;
  setModalVisible: any;
}) => {
  const { metadata } = item || '-';
  const { image, thumbnail } =
    typeof metadata === 'object' ? metadata : JSON.parse(metadata);
  const imgThumb = item?.thumbnail || thumbnail || image;

  return (
    <TouchableOpacity
      onPress={() => {
        setSelectedItem(item);
        setModalVisible(true);
      }}>
      <View style={styles.nftBox}>
        <Image
          source={{
            uri: imgThumb.replace(
              'https://klik-medias.s3.amazonaws.com',
              'https://d2dpawrikb755t.cloudfront.net',
            ),
          }}
          style={styles.imgNFT}
        />
        <FontAwesome
          name="key"
          size={18}
          color="#fff"
          style={styles.videoIcon}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  imgNFT: {
    width: width / 3 - 3,
    height: width / 2,
    backgroundColor: '#333',
  },
  nftBox: {
    width: width / 3,
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbb',
  },
  imgVIP: {
    width: width / 3 - 3,
    height: width / 2,
  },
  vipBox: {
    width: width / 3,
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbb',
  },
  imageThumb: {
    width: width / 3,
    height: width / 2,
  },
  absolute: {
    width: width / 3,
    height: width / 2,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  videoIcon: {
    width: 22,
    height: 22,
    position: 'absolute',
    right: 5,
    top: 5,
    zIndex: 10,
  },
  imgBox: {
    width: width / 3 - 3,
    height: width / 2,
    backgroundColor: '#333',
  },
  videoBox: {
    width: width / 3,
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbb',
  },
  size30: {
    width: 30,
    height: 30,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});
