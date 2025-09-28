import ShiftSchedule from '@/components/shift/ShiftSchedule';

export default function ShiftPage() {
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="space-y-6">
        {/* ページヘッダー */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            シフト管理
          </h1>
          <p className="text-gray-600">
            福祉事業所のシフト表を管理します
          </p>
        </div>

        {/* メインコンテンツ */}
        <ShiftSchedule />
      </div>
    </div>
  );
}