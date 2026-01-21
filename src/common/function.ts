import { ethers } from 'ethers';

export const GetAccounts = async (key: string) => {
  try {
    const wallet = new ethers.Wallet(key);
    return wallet.address;
  } catch (error) {
    return null;
  }
};

export const ValidateEmail = (email: string): boolean => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return regex.test(email);
};

export const ValidatePhoneNumber = (phoneNumber: string): boolean => {
  const regex = /^\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/;
  return regex.test(phoneNumber);
};

export const GetBtnBgColor = (color: string) => {
  switch (color) {
    case 'red':
      return ['#ec6d6d', '#803b3b', '#fff'];
    case 'yellow':
      return ['#d1bd75', '#ffea9d', '#000'];
    case 'blue':
      return ['#4489ce', '#254a6e', '#fff'];
    case 'green':
      return ['#72ce67', '#447c3e', '#fff'];
    case 'black':
      return ['#fff', '#ccc', '#000'];
    case 'dark':
      return ['#3c3c3c', '#121212', '#fff'];
    case 'white':
      return ['#d6d7ec', '#fff', '#000'];
    case 'primary':
      return ['#1d99d1', '#14B1F8', '#fff'];
    default:
      return ['#43ada3', '#245e58', '#fff'];
  }
};

export const ConvertImg = (cImage: string) => {
  if (cImage === 'ipfs://null') {
    return null;
  }
  let mImage =
    cImage && cImage.substring(0, 4) === 'ipfs'
      ? 'https://ipfs.moralis.io:2053/ipfs/' +
        cImage.substring(7).replace('ipfs', '')
      : cImage?.replace('ipfs.moralis.io:2053', 'ipfs.moralis.io:2053');

  if (
    mImage &&
    mImage.includes('https://metasalt-youtube-dev.s3.amazonaws.com/assets/')
  ) {
    mImage = mImage?.replace(
      'https://metasalt-youtube-dev.s3.amazonaws.com/assets/',
      'https://d2dpawrikb755t.cloudfront.net/video/',
    );
  }
  if (mImage && mImage.includes('https://klik-medias.s3.amazonaws.com')) {
    mImage = mImage?.replace(
      'https://klik-medias.s3.amazonaws.com',
      'https://d2dpawrikb755t.cloudfront.net',
    );
  }
  return mImage;
};
