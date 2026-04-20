import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero 区域 */}
      <section className="relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-20 md:py-32 text-center">
          {/* 主标题 */}
          <div className="animate-slide-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              让 AI 用最毒舌的方式
              <br />
              <span className="gradient-text">吐槽你的一切</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              输入你的社交媒体主页，AI 会用幽默犀利的方式吐槽你，
              <br className="hidden md:block" />
              生成一份可分享的趣味报告。
            </p>
          </div>

          {/* CTA 按钮 */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/roast"
              className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-4"
            >
              🔥 立即开始吐槽
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>

          {/* 统计数据 */}
          <div
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <div>
              <div className="text-2xl md:text-3xl font-bold gradient-text">5+</div>
              <div className="text-sm text-gray-500 mt-1">支持平台</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold gradient-text">3s</div>
              <div className="text-sm text-gray-500 mt-1">极速生成</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold gradient-text">∞</div>
              <div className="text-sm text-gray-500 mt-1">笑点保证</div>
            </div>
          </div>
        </div>
      </section>

      {/* 支持的平台 */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            支持吐槽的平台
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: '微博', icon: '📱', desc: '你的微博人设' },
              { name: '小红书', icon: '📕', desc: '你的种草日常' },
              { name: '抖音', icon: '🎵', desc: '你的短视频品味' },
              { name: 'B站', icon: '📺', desc: '你的二次元浓度' },
              { name: '知乎', icon: '💡', desc: '你的逼格指数' },
            ].map((platform) => (
              <div
                key={platform.name}
                className="glass-card p-6 text-center hover:scale-105 transition-transform"
              >
                <div className="text-4xl mb-3">{platform.icon}</div>
                <div className="font-semibold text-white">{platform.name}</div>
                <div className="text-sm text-gray-500 mt-1">{platform.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 使用流程 */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            三步完成吐槽
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: '选择平台',
                desc: '选择你要吐槽的社交媒体平台',
                icon: '🎯',
              },
              {
                step: '02',
                title: '输入用户名',
                desc: '输入你的社交媒体用户名',
                icon: '✍️',
              },
              {
                step: '03',
                title: '获取报告',
                desc: 'AI 生成专属吐槽报告，一键分享',
                icon: '🎉',
              },
            ].map((item) => (
              <div key={item.step} className="glass-card p-8 text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-sm text-purple-400 font-mono mb-2">
                  STEP {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 报告预览 */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            你将获得这样的报告
          </h2>
          <p className="text-gray-400 text-center mb-12">
            每份报告都是一张精美的社交卡片，分享出去就是天然广告
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {/* 报告内容预览 */}
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">📱 微博主页吐槽</span>
                <span className="text-xs text-gray-600">示例报告</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-lg">
                  👤
                </div>
                <span className="font-semibold">@示例用户</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['深夜emo型选手', '正能量传销员', '美食博主（自封的）'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-sm"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
              <div className="space-y-2 text-sm text-gray-400">
                <p>💬 你的微博简介写了3个emoji，没有一个能说明你是干什么的</p>
                <p>💬 你80%的帖子发在晚上11点-凌晨2点，建议早点睡</p>
                <p>💬 转发比原创多3倍，你是微博搬运工吧</p>
              </div>
              <div className="pt-2 border-t border-[#2a2a3e]">
                <p className="text-sm text-purple-300 italic">
                  &ldquo;你是一个热爱生活的普通人，但你的主页看起来像微商&rdquo;
                </p>
              </div>
            </div>

            {/* 评分预览 */}
            <div className="glass-card p-6 flex flex-col items-center justify-center">
              <div className="text-sm text-gray-500 mb-4">社交主页评分</div>
              <div className="relative w-40 h-40 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="#2a2a3e"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(37 / 100) * 327} 327`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-orange-500">37</span>
                  <span className="text-sm text-gray-500">/100</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm">还有救</p>
              <p className="text-gray-600 text-xs mt-2">
                （以上为示例，实际结果因人而异）
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            准备好被吐槽了吗？
          </h2>
          <p className="text-gray-400 mb-8">
            被吐槽，是一种新型社交货币。
            <br />
            来看看 AI 会怎么评价你的社交主页吧！
          </p>
          <Link
            href="/roast"
            className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-4"
          >
            🔥 开始吐槽
          </Link>
        </div>
      </section>
    </div>
  );
}
