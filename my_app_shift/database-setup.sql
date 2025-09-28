-- 福祉事業所スタッフシフト管理アプリ用データベース設定
-- このファイルをSupabase SQLエディタで実行してください

-- 1. スタッフテーブルの作成
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  work_days TEXT[] NOT NULL,
  work_pattern VARCHAR(20) NOT NULL CHECK (work_pattern IN ('day', 'nightLong', 'nightShort')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. シフトテーブルの作成
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL CHECK (time_slot IN ('day', 'nightLong', 'nightShort')),
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, time_slot)
);

-- 3. インデックスの作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(date);
CREATE INDEX IF NOT EXISTS idx_shifts_staff_id ON shifts(staff_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date_time_slot ON shifts(date, time_slot);
CREATE INDEX IF NOT EXISTS idx_staff_name ON staff(name);

-- 4. Row Level Security (RLS) の設定
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- 5. RLSポリシーの作成（認証されたユーザーのみアクセス可能）
-- スタッフテーブル用ポリシー
CREATE POLICY IF NOT EXISTS "認証されたユーザーはスタッフを表示できる" ON staff
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "認証されたユーザーはスタッフを作成できる" ON staff
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "認証されたユーザーはスタッフを更新できる" ON staff
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "認証されたユーザーはスタッフを削除できる" ON staff
  FOR DELETE USING (auth.role() = 'authenticated');

-- シフトテーブル用ポリシー
CREATE POLICY IF NOT EXISTS "認証されたユーザーはシフトを表示できる" ON shifts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "認証されたユーザーはシフトを作成できる" ON shifts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "認証されたユーザーはシフトを更新できる" ON shifts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "認証されたユーザーはシフトを削除できる" ON shifts
  FOR DELETE USING (auth.role() = 'authenticated');

-- 6. サンプルデータの挿入（テスト用）
INSERT INTO staff (name, work_days, work_pattern) VALUES
  ('田中太郎', ARRAY['月', '火', '水'], 'day'),
  ('佐藤花子', ARRAY['木', '金', '土'], 'nightLong'),
  ('鈴木次郎', ARRAY['日', '月', '火'], 'nightShort')
ON CONFLICT DO NOTHING;

-- 設定完了メッセージ
SELECT 'データベースの設定が完了しました。スタッフ数: ' || COUNT(*) || '人' AS message
FROM staff;