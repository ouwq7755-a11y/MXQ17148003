/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#F499BB',        // 主品牌色 柔雾裸粉
          light: '#FFE6EF',       // 主色浅底 淡裸粉
          purple: '#9D76E8',      // AI辅助紫 芋泥紫
          green: '#62C490',       // 教学辅助绿 奶薄荷绿
          blue: '#48A8E6',        // 材料辅助蓝 晴空浅蓝
        },
        surface: {
          page: '#FFFCFD',        // 页面底色 奶白
          card: '#FFFFFF',        // 卡片底色
          divider: '#F4E8ED',     // 分割线 浅粉灰
          ai: '#F3EDFF',          // AI设计浅紫底
          teach: '#E6F7EF',       // 教程浅绿底
          material: '#E6F3FF',    // 材料浅蓝底
          skin: '#FFF0E6',        // 肤色浅橙底
          media: '#FFE6F0',       // 素材浅粉底
          tool: '#F0F4FF',        // 工具浅蓝灰底
        },
        text: {
          title: '#222222',       // 大标题 深炭灰
          body: '#555555',        // 正文 中度灰
          caption: '#999999',     // 辅助小字 浅灰
        },
        primary: {
          50: '#FFF5F8',
          100: '#FFE6EF',
          200: '#FFCDDF',
          300: '#FFA8C8',
          400: '#F57DA5',
          500: '#F28FB2',
          600: '#E07098',
          700: '#C05078',
          800: '#A03860',
          900: '#802848',
        },
      },
      borderRadius: {
        card: '24rpx',
        thumb: '16rpx',
        pill: '999rpx',
      },
      spacing: {
        safe: '32rpx',
        section: '40rpx',
        card: '24rpx',
        inner: '32rpx',
      },
      boxShadow: {
        card: '0 4rpx 16rpx rgba(242, 143, 178, 0.08)',
      },
    },
  },
  plugins: [],
}
