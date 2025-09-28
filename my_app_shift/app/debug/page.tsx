'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runDebug = async () => {
    setLoading(true);
    setResults('デバッグ開始...\n');

    try {
      // データベース接続テスト
      setResults(prev => prev + '1. データベース接続テスト中...\n');
      const { testConnection } = await import('@/lib/supabase-utils');
      const connectionResult = await testConnection();
      setResults(prev => prev + `接続結果: ${connectionResult.error ? 'エラー - ' + connectionResult.error : '成功'}\n\n`);

      // スタッフデータ確認
      setResults(prev => prev + '2. スタッフデータ確認中...\n');
      const { getStaff } = await import('@/lib/supabase-utils');
      const staffResult = await getStaff();
      setResults(prev => prev + `スタッフ取得結果: ${staffResult.error ? 'エラー - ' + staffResult.error : `成功 - ${staffResult.data?.length || 0}人のスタッフ`}\n`);

      if (staffResult.data && staffResult.data.length > 0) {
        setResults(prev => prev + `スタッフ例: ${JSON.stringify(staffResult.data[0], null, 2)}\n\n`);
      }

      // シフトデータ確認
      setResults(prev => prev + '3. シフトデータ確認中...\n');
      const { getShifts } = await import('@/lib/supabase-utils');
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const shiftsResult = await getShifts(today, nextWeek);
      setResults(prev => prev + `シフト取得結果: ${shiftsResult.error ? 'エラー - ' + shiftsResult.error : `成功 - ${shiftsResult.data?.length || 0}件のシフト`}\n`);

      if (shiftsResult.data && shiftsResult.data.length > 0) {
        setResults(prev => prev + `シフト例: ${JSON.stringify(shiftsResult.data[0], null, 2)}\n\n`);
      }

      // 環境変数確認
      setResults(prev => prev + '4. 環境変数確認中...\n');
      setResults(prev => prev + `NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '設定済み' : '未設定'}\n`);
      setResults(prev => prev + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ? '設定済み' : '未設定'}\n\n`);

      setResults(prev => prev + 'デバッグ完了！\n');

    } catch (error) {
      setResults(prev => prev + `エラーが発生しました: ${error}\n`);
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">システムデバッグ</h1>

        <Card>
          <CardHeader>
            <CardTitle>デバッグ実行</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={runDebug}
              disabled={loading}
              className="w-32"
            >
              {loading ? '実行中...' : 'デバッグ実行'}
            </Button>

            <div className="mt-4">
              <div className="bg-white border border-gray-300 rounded-lg p-4 max-h-96 overflow-auto">
                <pre className="text-gray-900 text-sm whitespace-pre-wrap font-mono">
                  {results || 'デバッグボタンを押して診断を開始してください'}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}