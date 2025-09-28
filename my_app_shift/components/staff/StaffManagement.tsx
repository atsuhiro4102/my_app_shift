'use client';

import { useState, useEffect } from 'react';
import { Staff, StaffFormData } from '@/types';
import { getStaff, createStaff, updateStaff, deleteStaff } from '@/lib/supabase-utils';
import StaffList from './StaffList';
import StaffForm from './StaffForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users } from 'lucide-react';

export default function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getStaff();

      if (result.error) {
        setError(result.error);
      } else {
        setStaff(result.data || []);
      }
    } catch (error) {
      setError('スタッフの読み込みに失敗しました');
      console.error('スタッフ読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (staffData: StaffFormData) => {
    try {
      setSaving(true);
      setError(null);

      let result;
      if (editingStaff) {
        result = await updateStaff(editingStaff.id, staffData);
      } else {
        result = await createStaff(staffData);
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      await loadStaff();
      setShowForm(false);
      setEditingStaff(null);
    } catch (error) {
      setError('保存に失敗しました');
      console.error('保存エラー:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setShowForm(true);
  };

  const handleDelete = async (staffId: string) => {
    if (!confirm('このスタッフを削除してもよろしいですか？')) {
      return;
    }

    try {
      setError(null);
      const result = await deleteStaff(staffId);

      if (result.error) {
        setError(result.error);
        return;
      }

      await loadStaff();
    } catch (error) {
      setError('削除に失敗しました');
      console.error('削除エラー:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStaff(null);
  };

  const handleNewStaff = () => {
    setEditingStaff(null);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}
        <StaffForm
          staff={editingStaff}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={saving}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>スタッフ管理</span>
              <span className="text-sm font-normal text-gray-500">
                ({staff.length}人)
              </span>
            </div>
            <Button onClick={handleNewStaff} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              新規登録
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* エラー表示 */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-red-800">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError(null)}
              >
                ✕
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* スタッフ一覧 */}
      <StaffList
        staff={staff}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* リロードボタン */}
      {!loading && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadStaff}
            className="w-32"
          >
            再読み込み
          </Button>
        </div>
      )}
    </div>
  );
}