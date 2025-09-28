// 基本的な型定義
export const WORK_DAYS = ['月', '火', '水', '木', '金', '土', '日'] as const;
export type WorkDay = typeof WORK_DAYS[number];

// 勤務スケジュール型（シンプルなRecord型）
export type WorkSchedule = Record<string, 'day' | 'nightLong' | 'nightShort'>;

// スタッフ型
export interface Staff {
  id: string;
  name: string;
  work_schedule: WorkSchedule;
  created_at: string;
}

// シフト型
export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD形式
  time_slot: 'day' | 'nightLong' | 'nightShort';
  staff_id: string | null;
  created_at: string;
}

// 勤務パターンの表示設定
export type WorkPattern = {
  day: { label: '日勤'; color: 'bg-blue-100 text-blue-800' };
  nightLong: { label: '夜勤ロング'; color: 'bg-purple-100 text-purple-800' };
  nightShort: { label: '夜勤ショート'; color: 'bg-green-100 text-green-800' };
};

export const WORK_PATTERNS: WorkPattern = {
  day: { label: '日勤', color: 'bg-blue-100 text-blue-800' },
  nightLong: { label: '夜勤ロング', color: 'bg-purple-100 text-purple-800' },
  nightShort: { label: '夜勤ショート', color: 'bg-green-100 text-green-800' },
};

// フォーム用の型
export interface StaffFormData {
  name: string;
  work_schedule: WorkSchedule;
}

// シフト操作用の型
export interface ShiftUpdateData {
  shift_id: string;
  staff_id: string | null;
}

// エラーハンドリング用の型
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}