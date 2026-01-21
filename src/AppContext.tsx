import React from 'react';

export interface AppContextType {
  salesAccount: string;
  locationId: string;
  accessToken: string;
  setSalesAccount: React.Dispatch<React.SetStateAction<string>>;
  setLocationId: React.Dispatch<React.SetStateAction<string>>;
  setAccessToken: React.Dispatch<React.SetStateAction<string>>;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export default AppContext;
