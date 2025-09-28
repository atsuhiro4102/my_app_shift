'use client';

import { Staff, WORK_PATTERNS } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit } from 'lucide-react';

interface StaffListProps {
  staff: Staff[];
  onEdit: (staff: Staff) => void;
  onDelete: (staffId: string) => void;
  loading?: boolean;
}

export default function StaffList({ staff, onEdit, onDelete, loading = false }: StaffListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <div className="text-gray-500">
            <p className="text-lg font-medium">スタッフが登録されていません</p>
            <p className="text-sm mt-2">新しいスタッフを追加してください</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {staff.map((member) => (
        <Card key={member.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span>{member.name}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(member)}
                  className="h-8 w-8 p-0 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4 text-blue-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(member.id)}
                  className="h-8 w-8 p-0 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* 勤務スケジュール */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">勤務スケジュール:</p>
                <div className="space-y-2">
                  {Object.entries(member.work_schedule).map(([day, pattern]) => (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{day}:</span>
                      <Badge
                        className={`${WORK_PATTERNS[pattern as keyof typeof WORK_PATTERNS].color} border-0 text-xs`}
                      >
                        {WORK_PATTERNS[pattern as keyof typeof WORK_PATTERNS].label}
                      </Badge>
                    </div>
                  ))}
                  {Object.keys(member.work_schedule).length === 0 && (
                    <p className="text-xs text-gray-500">勤務スケジュールが設定されていません</p>
                  )}
                </div>
              </div>

              {/* 登録日 */}
              <div className="text-xs text-gray-500 pt-2 border-t">
                登録: {new Date(member.created_at).toLocaleDateString('ja-JP')}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}