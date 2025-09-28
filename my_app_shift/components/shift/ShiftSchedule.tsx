'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Staff, Shift, WORK_PATTERNS } from '@/types';
import { getStaff, getShifts, initializeShifts, updateShiftStaff } from '@/lib/supabase-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, RotateCcw, Users } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';

// ドラッグ可能なスタッフコンポーネント
function DraggableStaff({ staff }: { staff: Staff }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `staff-${staff.id}`,
    data: { staff }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 border border-blue-200 rounded-lg bg-blue-50 cursor-move hover:bg-blue-100 transition-colors shadow-sm ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="font-medium text-blue-900">{staff.name}</div>
      <div className="text-sm text-blue-700 mt-1">
        {Object.entries(staff.work_schedule).map(([day, pattern]) => (
          <span key={day} className={`inline-block px-1 py-0.5 rounded text-xs mr-1 mb-1 ${WORK_PATTERNS[pattern].color}`}>
            {day}
          </span>
        ))}
      </div>
    </div>
  );
}

// ドロップ可能なシフトセルコンポーネント
function DroppableShiftCell({
  shift,
  assignedStaff,
  date,
  timeSlot,
  onRemoveStaff
}: {
  shift: Shift | undefined;
  assignedStaff: Staff | null;
  date: Date;
  timeSlot: 'day' | 'nightLong' | 'nightShort';
  onRemoveStaff: (shiftId: string) => void;
}) {
  const {
    isOver,
    setNodeRef
  } = useDroppable({
    id: `shift-${format(date, 'yyyy-MM-dd')}-${timeSlot}`,
    data: { shift, date, timeSlot }
  });

  const [isHovered, setIsHovered] = useState(false);

  const handleRemoveStaff = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (shift && assignedStaff) {
      if (confirm(`${assignedStaff.name}をシフトから削除しますか？`)) {
        onRemoveStaff(shift.id);
      }
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (shift && assignedStaff) {
      if (confirm(`${assignedStaff.name}をシフトから削除しますか？`)) {
        onRemoveStaff(shift.id);
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`min-h-16 flex items-center justify-center transition-colors ${
        isOver ? 'bg-green-100 border-2 border-green-300' : ''
      }`}
    >
      {assignedStaff ? (
        <div
          className={`text-center p-2 bg-blue-50 rounded border border-blue-200 w-full relative transition-colors ${
            isHovered ? 'bg-blue-100' : ''
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className="font-medium text-sm text-blue-900 cursor-pointer"
            onContextMenu={handleRemoveStaff}
            onDoubleClick={handleRemoveStaff}
            title="右クリックまたはダブルクリックで削除"
          >
            {assignedStaff.name}
          </div>

          {/* 常に表示される小さな削除ボタン */}
          <button
            className={`absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold cursor-pointer z-10 border border-white shadow-sm transition-opacity ${
              isHovered ? 'opacity-100' : 'opacity-30'
            }`}
            onClick={handleDeleteClick}
            onMouseDown={(e) => e.stopPropagation()}
            title="削除"
          >
            ×
          </button>

          {/* ホバー時の大きな削除ボタン */}
          {isHovered && (
            <button
              className="absolute top-0 left-0 w-full h-full bg-red-500 bg-opacity-20 hover:bg-opacity-30 rounded flex items-center justify-center text-red-700 font-bold cursor-pointer transition-all"
              onClick={handleDeleteClick}
              onMouseDown={(e) => e.stopPropagation()}
              title="クリックして削除"
            >
              削除
            </button>
          )}
        </div>
      ) : shift ? (
        <div className="text-center p-2 bg-gray-50 rounded border border-gray-200 w-full cursor-pointer hover:bg-gray-100">
          <div className="text-xs text-gray-700 font-medium">
            未配置
          </div>
        </div>
      ) : (
        <div className="text-center p-2 text-gray-600 text-xs font-medium">
          —
        </div>
      )}
    </div>
  );
}

export default function ShiftSchedule() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }) // 月曜日開始
  );
  const [activeStaff, setActiveStaff] = useState<Staff | null>(null);

  // タッチとマウスセンサーを設定
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    loadData();
  }, [currentWeekStart]);

  // ドラッグ開始
  const handleDragStart = (event: DragStartEvent) => {
    const staffData = event.active.data.current?.staff;
    if (staffData) {
      setActiveStaff(staffData);
    }
  };

  // ドラッグ終了
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveStaff(null);

    if (!over) return;

    const staffData = active.data.current?.staff;
    const shiftData = over.data.current?.shift;

    if (staffData && shiftData) {
      try {
        setError(null);
        const result = await updateShiftStaff(shiftData.id, staffData.id);

        if (result.error) {
          setError(result.error);
          return;
        }

        // シフトデータを再読み込み
        await loadData();
      } catch (error) {
        setError('シフトの更新に失敗しました');
        console.error('シフト更新エラー:', error);
      }
    }
  };

  // スタッフ削除機能
  const handleRemoveStaff = async (shiftId: string) => {
    try {
      setError(null);
      const result = await updateShiftStaff(shiftId, null);

      if (result.error) {
        setError(result.error);
        return;
      }

      // シフトデータを再読み込み
      await loadData();
    } catch (error) {
      setError('スタッフの削除に失敗しました');
      console.error('スタッフ削除エラー:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // スタッフとシフトデータを並行して取得
      const [staffResult, shiftsResult] = await Promise.all([
        getStaff(),
        getShifts(
          format(currentWeekStart, 'yyyy-MM-dd'),
          format(addDays(currentWeekStart, 13), 'yyyy-MM-dd') // 2週間分
        )
      ]);

      if (staffResult.error) {
        setError(staffResult.error);
        return;
      }

      if (shiftsResult.error) {
        setError(shiftsResult.error);
        return;
      }

      setStaff(staffResult.data || []);
      setShifts(shiftsResult.data || []);
    } catch (error) {
      setError('データの読み込みに失敗しました');
      console.error('データ読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeShifts = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await initializeShifts(format(currentWeekStart, 'yyyy-MM-dd'));

      if (result.error) {
        setError(result.error);
        return;
      }

      // シフトデータを再読み込み
      await loadData();
    } catch (error) {
      setError('シフト初期化に失敗しました');
      console.error('シフト初期化エラー:', error);
    }
  };

  const getShiftForDateAndTime = (date: Date, timeSlot: 'day' | 'nightLong' | 'nightShort') => {
    const dateString = format(date, 'yyyy-MM-dd');
    return shifts.find(shift => shift.date === dateString && shift.time_slot === timeSlot);
  };

  const getStaffForShift = (shift: Shift | undefined) => {
    if (!shift || !shift.staff_id) return null;
    return staff.find(s => s.id === shift.staff_id);
  };

  // 2週間分の日付配列を生成
  const dates = Array.from({ length: 14 }, (_, i) => addDays(currentWeekStart, i));
  const timeSlots: { key: 'day' | 'nightLong' | 'nightShort'; label: string }[] = [
    { key: 'day', label: '日勤' },
    { key: 'nightLong', label: '夜勤ロング' },
    { key: 'nightShort', label: '夜勤ショート' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">シフト表を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
      {/* ヘッダー */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>シフト表</span>
              <span className="text-sm font-normal text-gray-500">
                {format(currentWeekStart, 'yyyy年M月d日', { locale: ja })} ～ {format(addDays(currentWeekStart, 13), 'yyyy年M月d日', { locale: ja })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -14))}
              >
                ← 前の2週間
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
              >
                今週
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 14))}
              >
                次の2週間 →
              </Button>
              <Button
                onClick={handleInitializeShifts}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <RotateCcw className="h-4 w-4" />
                シフト枠初期化
              </Button>
            </div>
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

      {/* シフト表 */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 bg-gray-50 w-24">時間帯</th>
                  {dates.map((date, index) => (
                    <th key={index} className="border border-gray-300 p-2 bg-gray-50 min-w-32">
                      <div className="text-center">
                        <div className="font-medium">
                          {format(date, 'M/d')}
                        </div>
                        <div className="text-xs text-gray-600">
                          ({format(date, 'E', { locale: ja })})
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot.key}>
                    <td className="border border-gray-300 p-2 bg-gray-50 font-medium text-center">
                      <div className={`px-2 py-1 rounded text-xs ${WORK_PATTERNS[timeSlot.key].color}`}>
                        {timeSlot.label}
                      </div>
                    </td>
                    {dates.map((date, dateIndex) => {
                      const shift = getShiftForDateAndTime(date, timeSlot.key);
                      const assignedStaff = getStaffForShift(shift);

                      return (
                        <td key={dateIndex} className="border border-gray-300 p-1">
                          <DroppableShiftCell
                            shift={shift}
                            assignedStaff={assignedStaff || null}
                            date={date}
                            timeSlot={timeSlot.key}
                            onRemoveStaff={handleRemoveStaff}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* スタッフ一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>配置可能スタッフ</span>
            <span className="text-sm font-normal text-gray-500">
              ({staff.length}人)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {staff.map((member) => (
              <DraggableStaff key={member.id} staff={member} />
            ))}
          </div>
          {staff.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              スタッフが登録されていません。<br />
              <a href="/staff" className="text-blue-600 hover:underline">スタッフ管理ページ</a>でスタッフを登録してください。
            </p>
          )}
        </CardContent>
      </Card>

      {/* 操作説明 */}
      <Card>
        <CardHeader>
          <CardTitle>操作方法</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• 「シフト枠初期化」ボタンで2週間分のシフト枠を作成します</p>
            <p>• スタッフ一覧からシフト表のセルにドラッグ&ドロップでスタッフを配置できます</p>
            <p>• 配置済みスタッフの右上の「×」ボタン、右クリック、またはダブルクリックで削除できます</p>
            <p>• 配置済みスタッフにホバーすると「削除」ボタンが表示されます</p>
            <p>• 青色のセルは配置済み、グレーのセルは未配置を表します</p>
            <p>• スマートフォンでは長押ししてからドラッグしてください</p>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* ドラッグオーバーレイ */}
      <DragOverlay>
        {activeStaff ? (
          <div className="p-3 border border-blue-300 rounded-lg bg-blue-100 shadow-lg opacity-90">
            <div className="font-medium text-blue-900">{activeStaff.name}</div>
            <div className="text-sm text-blue-700 mt-1">
              {Object.entries(activeStaff.work_schedule).map(([day, pattern]) => (
                <span key={day} className={`inline-block px-1 py-0.5 rounded text-xs mr-1 mb-1 ${WORK_PATTERNS[pattern].color}`}>
                  {day}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}