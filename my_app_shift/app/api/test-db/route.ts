import { NextResponse } from 'next/server';
import { testConnection, getStaff, createStaff } from '@/lib/supabase-utils';

export async function GET() {
  try {
    // 1. 接続テスト
    const connectionResult = await testConnection();

    // 2. スタッフデータ取得
    const staffResult = await getStaff();

    // 3. テスト結果をまとめる
    const testResults = {
      timestamp: new Date().toISOString(),
      connection: {
        status: connectionResult.error ? 'error' : 'success',
        message: connectionResult.error || 'データベース接続成功'
      },
      staff: {
        status: staffResult.error ? 'error' : 'success',
        message: staffResult.error || `スタッフ${staffResult.data?.length || 0}人を取得`,
        count: staffResult.data?.length || 0,
        data: staffResult.data || []
      }
    };

    return NextResponse.json(testResults);
  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: 'テスト実行中にエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // テストスタッフを作成
    const testStaffData = {
      name: `APIテストスタッフ${Date.now()}`,
      work_days: ['月', '火', '水'] as ('月' | '火' | '水' | '木' | '金' | '土' | '日')[],
      work_pattern: 'day' as const,
    };

    const result = await createStaff(testStaffData);

    if (result.error) {
      return NextResponse.json({
        status: 'error',
        message: result.error
      }, { status: 400 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'テストスタッフを作成しました',
      data: result.data
    });
  } catch (error) {
    return NextResponse.json({
      error: 'スタッフ作成中にエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}