export const AnalyticsEvents = {
  // Screen View Events
  SCREEN_VIEW: 'screen_view',
  SCREEN_HOME: 'screen_home',
  SCREEN_FAMILY_TREE: 'screen_family_tree',
  SCREEN_MEMBER_LIST: 'screen_member_list',
  SCREEN_MEMBER_DETAIL: 'screen_member_detail',
  SCREEN_EXPORT: 'screen_export',
  SCREEN_FAMILY_DETAIL: 'screen_family_detail',
  SCREEN_SETTINGS: 'screen_settings',

  // Family Management Events
  FAMILY_CREATE: 'family_create',
  FAMILY_EDIT: 'family_edit',
  FAMILY_DELETE: 'family_delete',
  FAMILY_JOIN: 'family_join',
  FAMILY_SWITCH: 'family_switch',

  // Member Management Events
  MEMBER_ADD: 'member_add',
  MEMBER_EDIT: 'member_edit',
  MEMBER_DELETE: 'member_delete',
  MEMBER_VIEW: 'member_view',
  MEMBER_PHOTO_UPLOAD: 'member_photo_upload',

  // Relation Management Events
  RELATION_CALCULATE: 'relation_calculate',
  RELATION_ADD: 'relation_add',
  RELATION_VIEW: 'relation_view',

  // Export & Share Events
  GEDCOM_EXPORT: 'gedcom_export',
  GEDCOM_IMPORT: 'gedcom_import',
  SHARE_INVITE_SEND: 'share_invite_send',
  SHARE_FAMILY_TREE: 'share_family_tree',
  SHARE_FAMILY_PHOTO: 'share_family_photo',

  // Photo Management Events
  PHOTO_UPLOAD: 'photo_upload',
  PHOTO_VIEW: 'photo_view',
  PHOTO_DELETE: 'photo_delete',
  PHOTO_RESTORE: 'photo_restore',

  // Settings Events
  THEME_SWITCH: 'theme_switch',
  LANGUAGE_SWITCH: 'language_switch',
  PRIVACY_SETTINGS_CHANGE: 'privacy_settings_change',
  ACCOUNT_DELETE: 'account_delete',

  // Engagement Events
  APP_OPEN: 'app_open',
  APP_BACKGROUND: 'app_background',
  USER_SESSION_START: 'user_session_start',
  USER_SESSION_END: 'user_session_end',
};

export const AnalyticsParams = {
  SCREEN_NAME: 'screen_name',
  SCREEN_CLASS: 'screen_class',
  
  FAMILY_ID: 'family_id',
  FAMILY_SIZE: 'family_size',
  FAMILY_NAME: 'family_name',
  
  MEMBER_ID: 'member_id',
  MEMBER_GENDER: 'member_gender',
  MEMBER_BIRTH_YEAR: 'member_birth_year',
  
  RELATION_TYPE: 'relation_type',
  RELATION_DEPTH: 'relation_depth',
  
  EXPORT_FORMAT: 'export_format',
  EXPORT_FILE_SIZE: 'export_file_size',
  HAS_PRIVATE_DATA: 'has_private_data',
  IS_PASSWORD_PROTECTED: 'is_password_protected',
  
  INVITE_METHOD: 'invite_method',
  INVITE_ROLE: 'invite_role',
  
  PHOTO_ID: 'photo_id',
  PHOTO_AGE_YEARS: 'photo_age_years',
  PHOTO_RESTORE_DURATION: 'photo_restore_duration',
  
  DURATION_MS: 'duration_ms',
  
  THEME: 'theme',
  LANGUAGE: 'language',
  
  OPERATING_SYSTEM: 'operating_system',
  OS_VERSION: 'os_version',
  APP_VERSION: 'app_version',
  DEVICE_MODEL: 'device_model',
  IS_TABLET: 'is_tablet',
  CONNECTION_TYPE: 'connection_type',
};

export const RelationTypes = {
  DIRECT: 'direct',
  COLLATERAL: 'collateral',
  IN_LAW: 'in_law',
  SPOUSE: 'spouse',
};

export const InviteMethods = {
  LINK: 'link',
  QR_CODE: 'qr_code',
  EMAIL: 'email',
};

export const ExportFormats = {
  GEDCOM: 'gedcom',
  PDF: 'pdf',
  JSON: 'json',
  IMAGE: 'image',
};

export const Genders = {
  MALE: 'male',
  FEMALE: 'female',
  UNKNOWN: 'unknown',
};
