import React, { useEffect, PropsWithChildren } from 'react';
import { useNetworkStore } from '../store/useNetworkStore';
import { useApiStore } from '../store/useApiStore';
import { GlobalToastContainer } from '../components/common/GlobalToast';

export const ApiProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const isOnline = useNetworkStore((state) => state.isConnected);
  const setIsOnline = useApiStore((state) => state.setIsOnline);
  
  // 同步网络状态
  useEffect(() => {
    setIsOnline(isOnline);
  }, [isOnline, setIsOnline]);
  
  return (
    <>
      {children}
      <GlobalToastContainer />
    </>
  );
};
