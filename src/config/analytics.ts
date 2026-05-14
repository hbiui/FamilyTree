import { Platform, AppState, AppStateStatus } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import {
  AnalyticsEvents,
  AnalyticsParams,
  RelationTypes,
  InviteMethods,
  ExportFormats,
  Genders,
} from '../constants/analytics';

interface AnalyticsConfig {
  provider: 'firebase' | 'custom';
  debug?: boolean;
  apiUrl?: string;
  trackingEnabled?: boolean;
}

interface AnalyticsEvent {
  name: string;
  params?: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private config: AnalyticsConfig;
  private sessionId: string = '';
  private sessionStartTime: number = 0;
  private currentScreen: string = '';
  private currentScreenStartTime: number = 0;
  private eventQueue: AnalyticsEvent[] = [];
  private isInitialized: boolean = false;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private constructor() {
    this.config = {
      provider: 'custom',
      debug: __DEV__,
      trackingEnabled: true,
    };
  }

  initialize(config: Partial<AnalyticsConfig> = {}): void {
    this.config = { ...this.config, ...config };
    
    if (!this.config.trackingEnabled) {
      console.log('Analytics tracking disabled');
      return;
    }

    this.startNewSession();
    this.setupAppStateListener();
    this.isInitialized = true;
    
    if (this.config.debug) {
      console.log('Analytics initialized with config:', this.config);
    }
    
    this.logEvent(AnalyticsEvents.APP_OPEN, this.getDeviceInfo());
  }

  private startNewSession(): void {
    this.sessionId = uuidv4();
    this.sessionStartTime = Date.now();
    this.logEvent(AnalyticsEvents.USER_SESSION_START);
  }

  private setupAppStateListener(): void {
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
  }

  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (nextAppState === 'background') {
      const sessionDuration = Date.now() - this.sessionStartTime;
      this.logEvent(AnalyticsEvents.USER_SESSION_END, {
        session_duration_ms: sessionDuration,
      });
      this.flushEventQueue();
    } else if (nextAppState === 'active') {
      this.startNewSession();
    }
  }

  logEvent(eventName: string, params?: Record<string, any>): void {
    if (!this.isInitialized || !this.config.trackingEnabled) {
      return;
    }

    const event: AnalyticsEvent = {
      name: eventName,
      params: {
      ...this.getDeviceInfo(),
      ...params,
    },
    timestamp: Date.now(),
    sessionId: this.sessionId,
  };

  this.eventQueue.push(event);

  if (this.config.debug) {
    console.log('[Analytics]', eventName, event.params);
  }

  if (this.config.provider === 'custom') {
      this.sendToCustomBackend(event);
    }
  }

  private getDeviceInfo(): Record<string, any> {
    return {
      operating_system: Platform.OS,
      os_version: Platform.Version,
      app_version: DeviceInfo.getVersion(),
      device_model: DeviceInfo.getModel(),
      is_tablet: DeviceInfo.isTablet(),
      connection_type: 'unknown',
    };
  }

  private sendToCustomBackend(event: AnalyticsEvent): void {
    if (this.config.debug) {
      console.log('Sending event to custom backend:', event);
    }

    if (this.config.apiUrl) {
        // 实际项目中，这里会发送到自定义后端
        // fetch(this.config.apiUrl, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(event),
        // });
    }
  }

  private flushEventQueue(): void {
    if (this.config.debug && this.eventQueue.length > 0) {
      console.log('Flushing', this.eventQueue.length, 'events');
    }

    // 实际项目中，这里会批量发送事件
    this.eventQueue = [];
  }

  logScreenView(screenName: string, screenClass?: string): void {
    if (this.currentScreen) {
      const screenDuration = Date.now() - this.currentScreenStartTime;
      this.logEvent('screen_leave', {
        screen_name: this.currentScreen,
        screen_duration_ms: screenDuration,
      });
    }

    this.currentScreen = screenName;
    this.currentScreenStartTime = Date.now();

    this.logEvent(AnalyticsEvents.SCREEN_VIEW, {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  }

  logFamilyCreate(familySize: number, durationMs: number): void {
    this.logEvent(AnalyticsEvents.FAMILY_CREATE, {
      [AnalyticsParams.FAMILY_SIZE]: familySize,
      [AnalyticsParams.DURATION_MS]: durationMs,
    });
  }

  logMemberAdd(familyId: string, gender: string, birthYear?: number): void {
    this.logEvent(AnalyticsEvents.MEMBER_ADD, {
      [AnalyticsParams.FAMILY_ID]: familyId,
      [AnalyticsParams.MEMBER_GENDER]: gender,
      [AnalyticsParams.MEMBER_BIRTH_YEAR]: birthYear,
    });
  }

  logRelationCalculate(familyId: string, depth: number, relationType: string): void {
    this.logEvent(AnalyticsEvents.RELATION_CALCULATE, {
      [AnalyticsParams.FAMILY_ID]: familyId,
      [AnalyticsParams.RELATION_DEPTH]: depth,
      [AnalyticsParams.RELATION_TYPE]: relationType,
    });
  }

  logInviteSend(inviteMethod: string, inviteRole: string): void {
    this.logEvent(AnalyticsEvents.SHARE_INVITE_SEND, {
      [AnalyticsParams.INVITE_METHOD]: inviteMethod,
      [AnalyticsParams.INVITE_ROLE]: inviteRole,
    });
  }

  logGedcomExport(memberCount: number, hasPrivateData: boolean, isPasswordProtected: boolean): void {
    this.logEvent(AnalyticsEvents.GEDCOM_EXPORT, {
      [AnalyticsParams.EXPORT_FORMAT]: ExportFormats.GEDCOM,
      [AnalyticsParams.FAMILY_SIZE]: memberCount,
      [AnalyticsParams.HAS_PRIVATE_DATA]: hasPrivateData,
      [AnalyticsParams.IS_PASSWORD_PROTECTED]: isPasswordProtected,
    });
  }

  logPhotoRestore(photoId: string, photoAgeYears: number, durationMs: number): void {
    this.logEvent(AnalyticsEvents.PHOTO_RESTORE, {
      [AnalyticsParams.PHOTO_ID]: photoId,
      [AnalyticsParams.PHOTO_AGE_YEARS]: photoAgeYears,
      [AnalyticsParams.PHOTO_RESTORE_DURATION]: durationMs,
    });
  }

  logThemeSwitch(theme: string): void {
    this.logEvent(AnalyticsEvents.THEME_SWITCH, {
      [AnalyticsParams.THEME]: theme,
    });
  }

  logLanguageSwitch(language: string): void {
    this.logEvent(AnalyticsEvents.LANGUAGE_SWITCH, {
      [AnalyticsParams.LANGUAGE]: language,
    });
  }

  setDebugMode(enabled: boolean): void {
    this.config.debug = enabled;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getEventQueue(): AnalyticsEvent[] {
    return [...this.eventQueue];
  }

  resetEventQueue(): void {
    this.eventQueue = [];
  }
}

export const analytics = AnalyticsService.getInstance();
export { AnalyticsEvents, AnalyticsParams, RelationTypes, InviteMethods, ExportFormats, Genders };
export type { AnalyticsConfig, AnalyticsEvent };
