// Setting テーブルで使用するキーの定数
// リテラルが散らばらないようここに集約する

export const SETTING_KEYS = {
  dietStartDate: "dietStartDate",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];
