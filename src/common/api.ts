import * as Sentry from '@sentry/react-native';
import axios from './axios';
import { ApiUrl } from './const.ts';

const getGuestConfig = async () => {
  try {
    const { data } = await axios.get(`${ApiUrl}/app/guest-config`);
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

const getLocation = async (body: any) => {
  try {
    const { data } = await axios.post(`${ApiUrl}/stripe-pos/location`, body);
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

const getConnectionToken = async (locationId: string) => {
  try {
    const { data } = await axios.get(
      `${ApiUrl}/stripe-pos/connection-token/${locationId}`,
    );
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

const login = async (body: any) => {
  try {
    const { data } = await axios.post(`${ApiUrl}/login`, body);
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

const getKlikPasses = async (params: any) => {
  try {
    const { data } = await axios.get(`${ApiUrl}/stripe-pos/nfts`, { params });
    return data;
  } catch (e) {
    return null;
  }
};

const getKlikPass = async (klikPassTokenId: string) => {
  try {
    const { data } = await axios.get(
      `${ApiUrl}/stripe-pos/lazy-mint/${klikPassTokenId}`,
    );
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

const getUser = async (userId: string) => {
  try {
    const { data } = await axios.get(`${ApiUrl}/user/get-one`, { _id: userId });
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

const createPaymentIntent = async (body: any) => {
  try {
    const { data } = await axios.post(
      `${ApiUrl}/stripe-pos/payment-intent`,
      body,
    );
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

const createReport = async (body: any) => {
  try {
    const { data } = await axios.post(
      `${ApiUrl}/report/create`,
      body,
    );
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export default {
  getGuestConfig,
  getLocation,
  getConnectionToken,
  login,
  getKlikPasses,
  getKlikPass,
  createPaymentIntent,
  getUser,
  createReport
};
