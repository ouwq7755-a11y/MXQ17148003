import { SparklesIcon } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-800">美甲学院</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              AI驱动的美甲教学平台，从零基础到专业级，系统学习各类美甲技法。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">快速导航</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/tutorials" className="hover:text-primary-500 transition-colors">教程中心</a></li>
              <li><a href="/materials" className="hover:text-primary-500 transition-colors">材料数据库</a></li>
              <li><a href="/tools" className="hover:text-primary-500 transition-colors">工具教学</a></li>
            </ul>
          </div>

          {/* Tutorial Categories */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">热门教程</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/tutorials?category=1" className="hover:text-primary-500 transition-colors">基础入门</a></li>
              <li><a href="/tutorials?category=3" className="hover:text-primary-500 transition-colors">法式美甲</a></li>
              <li><a href="/tutorials?category=5" className="hover:text-primary-500 transition-colors">猫眼美甲</a></li>
              <li><a href="/tutorials?category=10" className="hover:text-primary-500 transition-colors">穿戴甲</a></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">关于</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>自动采集更新教程</li>
              <li>内置10+美甲分类</li>
              <li>20+材料数据档案</li>
              <li>15+工具使用教学</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-400">
          © 2024 美甲学院 Nail Art Academy — AI Powered Learning Platform
        </div>
      </div>
    </footer>
  )
}
