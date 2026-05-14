import { AccessibilityInfo, AccessibilityRole, AccessibilityState } from 'react-native';

export interface AccessibilityConfig {
  label?: string;
  role?: AccessibilityRole;
  hint?: string;
  state?: AccessibilityState;
  modal?: boolean;
  liveRegion?: 'polite' | 'assertive' | 'none';
}

export const buildAccessibilityProps = (config: AccessibilityConfig) => {
  return {
    accessible: true,
    accessibilityLabel: config.label,
    accessibilityRole: config.role,
    accessibilityHint: config.hint,
    accessibilityState: config.state,
    accessibilityModal: config.modal,
    accessibilityLiveRegion: config.liveRegion,
  };
};

export const BUTTON_ROLES = {
  BUTTON: 'button' as AccessibilityRole,
  HEADER: 'header' as AccessibilityRole,
  LINK: 'link' as AccessibilityRole,
  IMAGE: 'image' as AccessibilityRole,
  TEXT: 'text' as AccessibilityRole,
  SEARCH: 'search' as AccessibilityRole,
  CHECKBOX: 'checkbox' as AccessibilityRole,
  RADIO: 'radio' as AccessibilityRole,
  SWITCH: 'switch' as AccessibilityRole,
  PROGRESSBAR: 'progressbar' as AccessibilityRole,
  SPINBUTTON: 'spinbutton' as AccessibilityRole,
  LIST: 'list' as AccessibilityRole,
  LISTITEM: 'listitem' as AccessibilityRole,
  TOOLBAR: 'toolbar' as AccessibilityRole,
  MENU: 'menu' as AccessibilityRole,
  MENUBAR: 'menubar' as AccessibilityRole,
  MENUITEM: 'menuitem' as AccessibilityRole,
  TAB: 'tab' as AccessibilityRole,
  TABLIST: 'tablist' as AccessibilityRole,
  TREE: 'tree' as AccessibilityRole,
  TREEITEM: 'treeitem' as AccessibilityRole,
  GRID: 'grid' as AccessibilityRole,
  GRIDITEM: 'griditem' as AccessibilityRole,
  ROW: 'row' as AccessibilityRole,
  ROWITEM: 'rowitem' as AccessibilityRole,
};

export const createButtonAccessibility = (
  label: string,
  hint?: string
): AccessibilityConfig => ({
  label,
  role: BUTTON_ROLES.BUTTON,
  hint,
});

export const createCardAccessibility = (
  label: string,
  hint?: string
): AccessibilityConfig => ({
  label,
  role: BUTTON_ROLES.BUTTON,
  hint: hint || '双击查看详情',
});

export const createLinkAccessibility = (
  label: string,
  hint?: string
): AccessibilityConfig => ({
  label,
  role: BUTTON_ROLES.LINK,
  hint,
});

export const createHeaderAccessibility = (
  label: string
): AccessibilityConfig => ({
  label,
  role: BUTTON_ROLES.HEADER,
});

export const createImageAccessibility = (
  label: string,
  hint?: string
): AccessibilityConfig => ({
  label,
  role: BUTTON_ROLES.IMAGE,
  hint,
});

export const createCheckboxAccessibility = (
  label: string,
  checked: boolean,
  hint?: string
): AccessibilityConfig => ({
  label,
  role: BUTTON_ROLES.CHECKBOX,
  hint,
  state: { checked, disabled: false },
});

export const createSwitchAccessibility = (
  label: string,
  toggled: boolean,
  hint?: string
): AccessibilityConfig => ({
  label,
  role: BUTTON_ROLES.SWITCH,
  hint,
  state: { checked: toggled, disabled: false },
});

export const createListItemAccessibility = (
  label: string,
  position?: number,
  setSize?: number
): AccessibilityConfig => ({
  label,
  role: BUTTON_ROLES.LISTITEM,
  hint: `列表第${position}项，共${setSize}项`,
});

export const createTabAccessibility = (
  label: string,
  selected: boolean,
  hint?: string
): AccessibilityConfig => ({
  label,
  role: BUTTON_ROLES.TAB,
  hint,
  state: { selected, disabled: false },
});

export const announceForAccessibility = (
  message: string,
  queueStrategy: 'polite' | 'assertive' = 'polite'
) => {
  AccessibilityInfo.announceForAccessibilityWithOptions?.(
    message,
    { queue: queueStrategy === 'polite' }
  );
};

export const announceSuccess = (message: string) => {
  announceForAccessibility(message, 'polite');
};

export const announceError = (message: string) => {
  announceForAccessibility(message, 'assertive');
};

export const announceLoading = (message: string = '加载中') => {
  announceForAccessibility(message, 'polite');
};

export const announceUpdate = (message: string) => {
  announceForAccessibility(message, 'polite');
};

export const checkScreenReaderEnabled = async (): Promise<boolean> => {
  return await AccessibilityInfo.isScreenReaderEnabled();
};

export const getRecommendedTimeout = async (): Promise<number> => {
  const isEnabled = await checkScreenReaderEnabled();
  return isEnabled ? 1000 : 300;
};

export const useAccessibilityAnnounce = () => {
  return {
    announce: announceForAccessibility,
    announceSuccess,
    announceError,
    announceLoading,
    announceUpdate,
  };
};
