import StaffManagement from '@/components/staff/StaffManagement';

export default function StaffPage() {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="space-y-6">
        {/* ページヘッダー */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            スタッフ管理
          </h1>
          <p className="text-gray-600">
            福祉事業所のスタッフ情報を管理します
          </p>
        </div>

        {/* メインコンテンツ */}
        <StaffManagement />
      </div>
    </div>
  );
}