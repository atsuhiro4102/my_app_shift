'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testConnection, getStaff, createStaff } from '@/lib/supabase-utils';
import { Staff, WORK_PATTERNS } from '@/types';

export default function TestDatabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('未テスト');
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const handleTestConnection = async () => {
    setLoading(true);
    setError(null);

    const result = await testConnection();

    if (result.error) {
      setConnectionStatus('❌ 接続失敗');
      setError(result.error);
    } else {
      setConnectionStatus('✅ 接続成功');
    }

    setLoading(false);
  };

  const handleLoadStaff = async () => {
    setLoading(true);
    setError(null);

    const result = await getStaff();

    if (result.error) {
      setError(result.error);
    } else {
      setStaff(result.data || []);
    }

    setLoading(false);
  };

  const handleCreateTestStaff = async () => {
    setLoading(true);
    setError(null);

    const testStaff = {
      name: `テストスタッフ${Date.now()}`,
      work_schedule: {
        '月': 'day' as const,
        '火': 'day' as const,
        '水': 'day' as const
      }
    };

    const result = await createStaff(testStaff);

    if (result.error) {
      setError(result.error);
    } else {
      // スタッフ一覧を再読み込み
      await handleLoadStaff();
    }

    setLoading(false);
  };

  const handleCreateTestShifts = async () => {
    setLoading(true);
    setError(null);

    try {
      const { initializeShifts } = await import('@/lib/supabase-utils');
      const today = new Date().toISOString().split('T')[0];
      const result = await initializeShifts(today);

      if (result.error) {
        setError(result.error);
      } else {
        setError(null);
        alert('テストシフトが作成されました');
      }
    } catch (error) {
      setError('シフト初期化に失敗しました: ' + String(error));
    }

    setLoading(false);
  };

  const handleQuickDebug = async () => {
    setLoading(true);
    setDebugInfo('デバッグ開始...\n');

    try {
      // 環境変数確認
      setDebugInfo(prev => prev + '1. 環境変数確認\n');
      setDebugInfo(prev => prev + `Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '設定済み' : '未設定'}\n`);
      setDebugInfo(prev => prev + `Supabase Key: ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ? '設定済み' : '未設定'}\n\n`);

      // データベース接続テスト
      setDebugInfo(prev => prev + '2. データベース接続テスト\n');
      const connectionResult = await testConnection();
      setDebugInfo(prev => prev + `接続結果: ${connectionResult.error ? 'エラー - ' + connectionResult.error : '成功'}\n\n`);

      // スタッフデータ確認
      setDebugInfo(prev => prev + '3. スタッフデータ確認\n');
      const staffResult = await getStaff();
      setDebugInfo(prev => prev + `スタッフ取得: ${staffResult.error ? 'エラー - ' + staffResult.error : `成功 - ${staffResult.data?.length || 0}人`}\n\n`);

      setDebugInfo(prev => prev + 'デバッグ完了\n');
    } catch (error) {
      setDebugInfo(prev => prev + `エラー: ${error}\n`);
    }

    setLoading(false);
  };

  useEffect(() => {
    handleLoadStaff();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Phase 1 データベース動作確認</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h3 className="text-red-800 font-medium">エラーが発生しました</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        <div className="grid gap-6">
          {/* 接続テスト */}
          <Card>
            <CardHeader>
              <CardTitle>1. データベース接続テスト</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleTestConnection}
                  disabled={loading}
                  className="w-32"
                >
                  {loading ? '実行中...' : '接続テスト'}
                </Button>
                <span className="text-lg">{connectionStatus}</span>
              </div>
              <p className="text-sm text-gray-600">
                Supabaseデータベースへの接続確認を行います。
              </p>
            </CardContent>
          </Card>

          {/* スタッフ一覧表示 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                2. スタッフ一覧表示テスト
                <div className="flex gap-2">
                  <Button
                    onClick={handleLoadStaff}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                  >
                    {loading ? '読込中...' : '再読込'}
                  </Button>
                  <Button
                    onClick={handleCreateTestStaff}
                    disabled={loading}
                    size="sm"
                  >
                    {loading ? '作成中...' : 'テストスタッフ作成'}
                  </Button>
                  <Button
                    onClick={handleCreateTestShifts}
                    disabled={loading}
                    size="sm"
                    variant="outline"
                  >
                    {loading ? '作成中...' : 'テストシフト作成'}
                  </Button>
                  <Button
                    onClick={handleQuickDebug}
                    disabled={loading}
                    size="sm"
                    variant="secondary"
                  >
                    {loading ? '診断中...' : 'クイック診断'}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {staff.length === 0 ? (
                  <p className="text-gray-500">スタッフが登録されていません</p>
                ) : (
                  staff.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-gray-600">
                          勤務スケジュール: {Object.entries(member.work_schedule).map(([day, pattern]) => `${day}(${WORK_PATTERNS[pattern as keyof typeof WORK_PATTERNS].label})`).join(', ')}
                        </p>
                      </div>
                      <div>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          登録済み
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                現在登録されているスタッフ数: {staff.length}人
              </p>
            </CardContent>
          </Card>

          {/* デバッグ情報表示 */}
          {debugInfo && (
            <Card>
              <CardHeader>
                <CardTitle>診断結果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border border-gray-300 rounded p-4 max-h-64 overflow-auto">
                  <pre className="text-gray-900 text-sm whitespace-pre-wrap font-mono">
                    {debugInfo}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 型定義確認 */}
          <Card>
            <CardHeader>
              <CardTitle>3. 型定義確認</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">勤務パターン:</h4>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(WORK_PATTERNS).map(([key, pattern]) => (
                      <span key={key} className={`px-3 py-1 rounded text-sm ${pattern.color}`}>
                        {pattern.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">勤務曜日:</h4>
                  <p className="text-sm text-gray-600">
                    月, 火, 水, 木, 金, 土, 日
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* シフト機能テスト */}
          <Card>
            <CardHeader>
              <CardTitle>4. シフト機能テスト</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <a href="/shift" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      シフト表を開く
                    </Button>
                  </a>
                  <a href="/debug" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      デバッグページを開く
                    </Button>
                  </a>
                </div>
                <p className="text-sm text-gray-600">
                  新しいタブでシフト表とデバッグページが開きます
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 次のステップ */}
          <Card>
            <CardHeader>
              <CardTitle>5. Phase 1 完了チェック</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={connectionStatus === '✅ 接続成功' ? 'text-green-600' : 'text-gray-400'}>
                    {connectionStatus === '✅ 接続成功' ? '✅' : '⬜'}
                  </span>
                  <span>データベース接続が確認できている</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={staff.length > 0 ? 'text-green-600' : 'text-gray-400'}>
                    {staff.length > 0 ? '✅' : '⬜'}
                  </span>
                  <span>スタッフデータの取得・作成ができている</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>型定義が正常に動作している</span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">Phase 1 完了後の次のステップ:</p>
                <p className="text-blue-700 text-sm mt-1">
                  全ての項目に✅が表示されたら、Phase 2のスタッフマスター管理機能の実装に進むことができます。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}