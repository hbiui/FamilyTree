import React, { useEffect } from 'react';
import { useNavigationState } from '@react-navigation/native';
import { analytics } from '../config/analytics';

export const useScreenTracking = (screenName: string, screenClass?: string) => {
  useEffect(() => {
    analytics.logScreenView(screenName, screenClass);
  }, [screenName, screenClass]);
};

export const useNavigationTracking = () => {
  const state = useNavigationState(state => state);
  
  useEffect(() => {
    if (state && state.routes.length > 0) {
      const currentRoute = state.routes[state.index];
      if (currentRoute) {
        analytics.logScreenView(currentRoute.name, currentRoute.name);
      }
    }
  }, [state]);
};

export const useEventTracking = () => {
  return {
    logFamilyCreate: analytics.logFamilyCreate.bind(analytics),
    logMemberAdd: analytics.logMemberAdd.bind(analytics),
    logRelationCalculate: analytics.logRelationCalculate.bind(analytics),
    logInviteSend: analytics.logInviteSend.bind(analytics),
    logGedcomExport: analytics.logGedcomExport.bind(analytics),
    logPhotoRestore: analytics.logPhotoRestore.bind(analytics),
    logThemeSwitch: analytics.logThemeSwitch.bind(analytics),
    logLanguageSwitch: analytics.logLanguageSwitch.bind(analytics),
  };
};

export function withScreenTracking(
  WrappedComponent: React.ComponentType<any>,
  screenName: string
) {
  const WithScreenTracking = (props: any) => {
    useScreenTracking(screenName);
    return React.createElement(WrappedComponent, props);
  };
  
  WithScreenTracking.displayName = `WithScreenTracking(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithScreenTracking;
}