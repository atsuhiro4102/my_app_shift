-- 曜日ごとの勤務パターン対応のためのデータベース更新
-- このファイルをSupabase SQLエディタで実行してください

-- 既存のstaffテーブルを更新（カラム名変更）
ALTER TABLE staff
  RENAME COLUMN work_days TO work_days_old;

ALTER TABLE staff
  RENAME COLUMN work_pattern TO work_pattern_old;

-- 新しいカラムを追加
ALTER TABLE staff
  ADD COLUMN work_schedule JSONB DEFAULT '{}';

-- 既存データを新しい形式に変換（一時的な変換）
UPDATE staff
SET work_schedule = jsonb_build_object(
  '月', CASE WHEN '月' = ANY(work_days_old) THEN work_pattern_old ELSE NULL END,
  '火', CASE WHEN '火' = ANY(work_days_old) THEN work_pattern_old ELSE NULL END,
  '水', CASE WHEN '水' = ANY(work_days_old) THEN work_pattern_old ELSE NULL END,
  '木', CASE WHEN '木' = ANY(work_days_old) THEN work_pattern_old ELSE NULL END,
  '金', CASE WHEN '金' = ANY(work_days_old) THEN work_pattern_old ELSE NULL END,
  '土', CASE WHEN '土' = ANY(work_days_old) THEN work_pattern_old ELSE NULL END,
  '日', CASE WHEN '日' = ANY(work_days_old) THEN work_pattern_old ELSE NULL END
);

-- NULLエントリを削除
UPDATE staff
SET work_schedule = (
  SELECT jsonb_object_agg(key, value)
  FROM jsonb_each(work_schedule)
  WHERE value IS NOT NULL AND value != 'null'::jsonb
);

-- 古いカラムを削除
ALTER TABLE staff DROP COLUMN work_days_old;
ALTER TABLE staff DROP COLUMN work_pattern_old;

-- インデックスの更新
CREATE INDEX IF NOT EXISTS idx_staff_work_schedule ON staff USING GIN (work_schedule);

-- サンプルデータの挿入（新しい形式）
INSERT INTO staff (name, work_schedule) VALUES
  ('山田花子', '{"月": "day", "水": "nightLong", "金": "day"}'),
  ('高橋次郎', '{"火": "nightShort", "木": "nightLong", "土": "day", "日": "nightShort"}'),
  ('中村三郎', '{"月": "nightLong", "火": "nightLong", "水": "nightLong"}')
ON CONFLICT DO NOTHING;

-- 確認用クエリ
SELECT name, work_schedule FROM staff ORDER BY name;

SELECT '新しい勤務スケジュール形式への更新が完了しました' AS message;