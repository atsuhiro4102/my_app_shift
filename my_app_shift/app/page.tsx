import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Calendar, Users, Database, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex-1 w-full flex flex-col gap-12 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-white shadow-sm">
          <div className="w-full max-w-6xl flex justify-between items-center p-3 px-5">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"} className="text-xl text-blue-700">
                福祉事業所シフト管理
              </Link>
            </div>
            <ThemeSwitcher />
          </div>
        </nav>

        <div className="flex-1 flex flex-col gap-12 max-w-6xl p-5 w-full">
          {/* ヒーローセクション */}
          <div className="text-center space-y-4 pt-8">
            <h1 className="text-4xl font-bold text-gray-900">
              シフト管理を<span className="text-blue-600">デジタル化</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              手書きシフト作成からの脱却。直感的で視覚的に分かりやすいシフト管理システム
            </p>
          </div>

          {/* 機能カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  スタッフ管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  スタッフの基本情報と勤務パターンを一元管理
                </p>
                <Link href="/staff">
                  <Button className="w-full flex items-center gap-2">
                    スタッフ管理へ
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  シフト表
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  2週間分のシフト表を視覚的に表示・管理
                </p>
                <Link href="/shift">
                  <Button className="w-full flex items-center gap-2">
                    シフト表へ
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  動作確認
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  データベース接続とシステムの動作を確認
                </p>
                <div className="space-y-2">
                  <Link href="/test-db">
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      テストページへ
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/debug">
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      デバッグページへ
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 勤務パターン説明 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                勤務パターン
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded text-sm bg-blue-100 text-blue-800">
                    日勤
                  </span>
                  <span className="text-gray-600">通常の日中勤務</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded text-sm bg-purple-100 text-purple-800">
                    夜勤ロング
                  </span>
                  <span className="text-gray-600">長時間夜勤</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded text-sm bg-green-100 text-green-800">
                    夜勤ショート
                  </span>
                  <span className="text-gray-600">短時間夜勤</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 特徴 */}
          <Card>
            <CardHeader>
              <CardTitle>アプリの特徴</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">✨ 直感的な操作</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>• ドラッグ&ドロップによる簡単シフト調整</li>
                    <li>• 視覚的に分かりやすいカラーコーディング</li>
                    <li>• レスポンシブデザインでPCとスマホ両対応</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">⚡ 効率的な管理</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 手書き作業からの完全脱却</li>
                    <li>• リアルタイムでの確認・更新</li>
                    <li>• 欠勤時の素早い代替調整</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-8 bg-white">
          <p className="text-gray-600">
            福祉事業所シフト管理アプリ - 手間を削減し、視認性を向上
          </p>
        </footer>
      </div>
    </main>
  );
}
