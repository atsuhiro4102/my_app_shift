'use client';

import { useState, useEffect } from 'react';
import { Staff, StaffFormData, WORK_PATTERNS, WORK_DAYS, WorkSchedule } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface StaffFormProps {
  staff?: Staff | null;
  onSave: (staffData: StaffFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function StaffForm({ staff, onSave, onCancel, loading = false }: StaffFormProps) {
  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    work_schedule: {},
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name,
        work_schedule: staff.work_schedule,
      });
    } else {
      setFormData({
        name: '',
        work_schedule: {},
      });
    }
    setErrors({});
  }, [staff]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '名前を入力してください';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '名前は2文字以上で入力してください';
    }

    if (Object.keys(formData.work_schedule).length === 0) {
      newErrors.work_schedule = '勤務スケジュールを1つ以上設定してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('保存エラー:', error);
    }
  };

  const handleWorkScheduleChange = (day: typeof WORK_DAYS[number], pattern: 'day' | 'nightLong' | 'nightShort' | null) => {
    setFormData(prev => {
      const newSchedule = { ...prev.work_schedule };
      if (pattern === null) {
        delete newSchedule[day];
      } else {
        newSchedule[day] = pattern;
      }
      return {
        ...prev,
        work_schedule: newSchedule
      };
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>{staff ? 'スタッフ編集' : '新規スタッフ登録'}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 名前入力 */}
          <div className="space-y-2">
            <Label htmlFor="name">名前 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="田中太郎"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* 勤務スケジュール設定 */}
          <div className="space-y-3">
            <Label>勤務スケジュール *</Label>
            <p className="text-sm text-gray-600">各曜日の勤務パターンを選択してください</p>

            <div className="space-y-3">
              {WORK_DAYS.map((day) => (
                <div key={day} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">{day}曜日</span>
                    <button
                      type="button"
                      onClick={() => handleWorkScheduleChange(day, null)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      クリア
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(WORK_PATTERNS).map(([key, pattern]) => (
                      <label key={key} className="flex items-center justify-center p-2 rounded border cursor-pointer hover:bg-white transition-colors">
                        <input
                          type="radio"
                          name={`schedule_${day}`}
                          value={key}
                          checked={formData.work_schedule[day] === key}
                          onChange={() => handleWorkScheduleChange(day, key as 'day' | 'nightLong' | 'nightShort')}
                          className="sr-only"
                        />
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          formData.work_schedule[day] === key
                            ? pattern.color + ' ring-2 ring-blue-500'
                            : 'bg-white text-gray-600 border'
                        }`}>
                          {pattern.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {errors.work_schedule && (
              <p className="text-sm text-red-600">{errors.work_schedule}</p>
            )}
          </div>

          {/* 送信ボタン */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? '保存中...' : (staff ? '更新' : '登録')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}