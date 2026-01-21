import React, { useCallback, useEffect, useState } from 'react';
import { StripeTerminalProvider } from '@stripe/stripe-terminal-react-native';
import Toast from 'react-native-toast-message';
import * as Sentry from '@sentry/react-native';
import AppContext from './src/AppContext.tsx';
import {
  AuthNavigation,
  HomeNavigation,
  LocationNavigation,
} from './src/navigations.tsx';
import { Loading } from './src/components/Loading.tsx';
import Storage from './src/common/storage.ts';
import { ApiUrl, PROD } from './src/common/const.ts';

Sentry.init({
  dsn: 'https://330c9471091522d1da59b05a884d80c3@o4506910096031744.ingest.us.sentry.io/4506916715626496',
  enabled: PROD,
});

const App = () => {

  const [salesAccount, setSalesAccount] = useState<string>('');
  const [locationId, setLocationId] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchTokenProvider = useCallback(async (): Promise<string> => {
    const response = await fetch(
      `${ApiUrl}/stripe-pos/connection-token/${locationId}`,
    );
    const { connectionToken } = await response.json();
    
    if (!response.ok || !connectionToken) {
      setLocationId('');
      await Storage.storeData('locationId', null);
      return '';
    }
    return connectionToken;
  }, [locationId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const account = await Storage.getData('salesAccount');
      const oldLocationId = await Storage.getData('locationId');
      setSalesAccount(account);
      setLocationId(oldLocationId);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!locationId) return;
    (async () => {
      setLoading(true);
      await fetchTokenProvider();
      setLoading(false);
    })();
  }, [fetchTokenProvider, locationId]);

  return (
    <AppContext.Provider
      value={{
        salesAccount,
        locationId,
        accessToken,
        setSalesAccount,
        setLocationId,
        setAccessToken,
      }}>
      {loading ? (
        <Loading />
      ) : !salesAccount ? (
        <AuthNavigation />
      ) : !locationId ? (
        <LocationNavigation />
      ) : (
        <StripeTerminalProvider
          logLevel="verbose"
          tokenProvider={fetchTokenProvider}>
          <HomeNavigation />
        </StripeTerminalProvider>
      )}
      <Toast />
    </AppContext.Provider>
  );
};

export default App;
