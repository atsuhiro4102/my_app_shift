import { createClient } from '@/lib/supabase/client';
import { Staff, Shift, StaffFormData, ApiResponse } from '@/types';

const supabase = createClient();

// スタッフ関連の関数
export async function getStaff(): Promise<ApiResponse<Staff[]>> {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('name');

    if (error) {
      console.error('スタッフ取得エラー:', error);
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('スタッフ取得エラー:', error);
    return { data: null, error: 'スタッフの取得に失敗しました' };
  }
}

export async function createStaff(staffData: StaffFormData): Promise<ApiResponse<Staff>> {
  try {
    const { data, error } = await supabase
      .from('staff')
      .insert({
        name: staffData.name,
        work_schedule: staffData.work_schedule,
      })
      .select()
      .single();

    if (error) {
      console.error('スタッフ作成エラー:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('スタッフ作成エラー:', error);
    return { data: null, error: 'スタッフの作成に失敗しました' };
  }
}

export async function updateStaff(id: string, staffData: StaffFormData): Promise<ApiResponse<Staff>> {
  try {
    const { data, error } = await supabase
      .from('staff')
      .update({
        name: staffData.name,
        work_schedule: staffData.work_schedule,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('スタッフ更新エラー:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('スタッフ更新エラー:', error);
    return { data: null, error: 'スタッフの更新に失敗しました' };
  }
}

export async function deleteStaff(id: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('スタッフ削除エラー:', error);
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('スタッフ削除エラー:', error);
    return { data: null, error: 'スタッフの削除に失敗しました' };
  }
}

// シフト関連の関数
export async function getShifts(startDate: string, endDate: string): Promise<ApiResponse<Shift[]>> {
  try {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date')
      .order('time_slot');

    if (error) {
      console.error('シフト取得エラー:', error);
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('シフト取得エラー:', error);
    return { data: null, error: 'シフトの取得に失敗しました' };
  }
}

export async function createShift(date: string, timeSlot: 'day' | 'nightLong' | 'nightShort', staffId?: string): Promise<ApiResponse<Shift>> {
  try {
    const { data, error } = await supabase
      .from('shifts')
      .insert({
        date,
        time_slot: timeSlot,
        staff_id: staffId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('シフト作成エラー:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('シフト作成エラー:', error);
    return { data: null, error: 'シフトの作成に失敗しました' };
  }
}

export async function updateShiftStaff(shiftId: string, staffId: string | null): Promise<ApiResponse<Shift>> {
  try {
    const { data, error } = await supabase
      .from('shifts')
      .update({ staff_id: staffId })
      .eq('id', shiftId)
      .select()
      .single();

    if (error) {
      console.error('シフト更新エラー:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('シフト更新エラー:', error);
    return { data: null, error: 'シフトの更新に失敗しました' };
  }
}

// シフトの初期化（2週間分のシフトスロットを作成）
export async function initializeShifts(startDate: string): Promise<ApiResponse<boolean>> {
  try {
    const shifts = [];
    const timeSlots: ('day' | 'nightLong' | 'nightShort')[] = ['day', 'nightLong', 'nightShort'];

    // 2週間分（14日）のシフトスロットを作成
    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];

      for (const timeSlot of timeSlots) {
        shifts.push({
          date: dateString,
          time_slot: timeSlot,
          staff_id: null,
        });
      }
    }

    const { error } = await supabase
      .from('shifts')
      .upsert(shifts, {
        onConflict: 'date,time_slot',
        ignoreDuplicates: true
      });

    if (error) {
      console.error('シフト初期化エラー:', error);
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('シフト初期化エラー:', error);
    return { data: null, error: 'シフトの初期化に失敗しました' };
  }
}

// シフトの一括削除機能
export async function clearAllShifts(startDate: string, endDate: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('shifts')
      .update({ staff_id: null })
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) {
      console.error('シフト一括削除エラー:', error);
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('シフト一括削除エラー:', error);
    return { data: null, error: 'シフトの一括削除に失敗しました' };
  }
}

// 特定日のシフトを削除
export async function clearDayShifts(date: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('shifts')
      .update({ staff_id: null })
      .eq('date', date);

    if (error) {
      console.error('特定日シフト削除エラー:', error);
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('特定日シフト削除エラー:', error);
    return { data: null, error: '指定日のシフト削除に失敗しました' };
  }
}

// 週のシフトを削除
export async function clearWeekShifts(startDate: string): Promise<ApiResponse<boolean>> {
  try {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const endDateString = endDate.toISOString().split('T')[0];

    const { error } = await supabase
      .from('shifts')
      .update({ staff_id: null })
      .gte('date', startDate)
      .lte('date', endDateString);

    if (error) {
      console.error('週シフト削除エラー:', error);
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('週シフト削除エラー:', error);
    return { data: null, error: '週のシフト削除に失敗しました' };
  }
}

// データベース接続テスト用
export async function testConnection(): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('staff')
      .select('count')
      .limit(1);

    if (error) {
      console.error('接続テストエラー:', error);
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('接続テストエラー:', error);
    return { data: null, error: 'データベースへの接続に失敗しました' };
  }
}