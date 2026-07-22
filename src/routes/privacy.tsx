import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: 'سياسة الخصوصية — جاوب | Privacy Policy' },
      { name: 'description', content: 'سياسة خصوصية تطبيق جاوب' },
    ],
  }),
  component: PrivacyPage,
})

const EFFECTIVE_DATE = '1 June 2025'

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-jawwib-bg text-jawwib-text" dir="rtl">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-gold-gradient">سياسة الخصوصية</h1>
          <p className="text-sm text-jawwib-text-dim">تاريخ السريان: {EFFECTIVE_DATE}</p>
        </div>

        {/* Arabic */}
        <section className="space-y-6 text-sm leading-relaxed text-jawwib-text">
          <div>
            <h2 className="text-lg font-bold mb-2">مرحباً بك في جاوب</h2>
            <p>
              جاوب هي لعبة ثقافة عامة مصمَّمة للاستخدام الشخصي والعائلي.
              نحن نأخذ خصوصيتك على محمل الجد ونلتزم بحمايتها.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-2">البيانات التي نجمعها</h2>
            <p>
              <strong>لا نجمع أي بيانات شخصية.</strong> جميع بيانات اللعبة (الاسم المُدخَل،
              النقاط، الإعدادات) تُخزَّن محلياً على جهازك فقط ولا تُرسَل إلى أي خادم.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-2">المشتريات داخل التطبيق</h2>
            <p>
              على iOS وAndroid تتم المشتريات عبر RevenueCat وApp Store / Google Play.
              لا نطّلع على معلومات بطاقتك الائتمانية. تخضع البيانات المُعالَجة من RevenueCat
              لسياسة خصوصيتهم على{' '}
              <a href="https://www.revenuecat.com/privacy" className="text-jawwib-gold underline" dir="ltr">
                revenuecat.com/privacy
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-2">اللعب عبر الإنترنت</h2>
            <p>
              عند تفعيل اللعب الجماعي عبر الإنترنت، يتم إرسال حالة اللعبة (لا تتضمن بيانات
              شخصية محددة) إلى خادم PartyKit المؤقت لمزامنة الأجهزة. لا تُحفَظ هذه البيانات
              بعد انتهاء الجلسة.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-2">التتبع والإعلانات</h2>
            <p>
              لا نتتبعك عبر التطبيقات أو المواقع الإلكترونية الأخرى. لا توجد إعلانات في التطبيق.
              لا نستخدم مُعرِّف IDFA أو أي تقنية تتبع مماثلة.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-2">حقوقك</h2>
            <p>
              يمكنك حذف جميع بيانات التطبيق في أي وقت عن طريق حذف التطبيق من جهازك.
              للتواصل معنا يُرجى مراسلتنا عبر البريد الإلكتروني أو قسم الدعم داخل التطبيق.
            </p>
          </div>
        </section>

        <hr className="border-jawwib-text-dim/20" />

        {/* English */}
        <section dir="ltr" className="space-y-6 text-sm leading-relaxed text-jawwib-text">
          <div>
            <h2 className="text-lg font-bold mb-2">Privacy Policy — Jawib</h2>
            <p className="text-jawwib-text-dim text-xs mb-3">Effective: {EFFECTIVE_DATE}</p>
            <p>
              Jawib is a general-knowledge trivia game designed for personal and family use.
              We take your privacy seriously.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-2">Data We Collect</h2>
            <p>
              <strong>We do not collect any personal data.</strong> All game data (entered name,
              scores, settings) is stored locally on your device only and is never sent to any server.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-2">In-App Purchases</h2>
            <p>
              On iOS and Android, purchases are processed through RevenueCat and the App Store /
              Google Play. We never see your payment card information. Data processed by RevenueCat
              is subject to their privacy policy at{' '}
              <a href="https://www.revenuecat.com/privacy" className="text-jawwib-gold underline">
                revenuecat.com/privacy
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-2">Online Multiplayer</h2>
            <p>
              When online multiplayer is active, game state (containing no individually identifiable
              personal data) is relayed through a temporary PartyKit session to synchronise devices.
              This data is not retained after the session ends.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-2">Tracking &amp; Advertising</h2>
            <p>
              We do not track you across other apps or websites. The app contains no advertisements.
              We do not access IDFA or any equivalent tracking identifier.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-2">Your Rights</h2>
            <p>
              You can delete all app data at any time by uninstalling the app from your device.
              To contact us, please use the in-app support option or reach us by email.
            </p>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-xs text-jawwib-text-dim pt-4">
          © 2025 Jawib. All rights reserved.
        </div>

      </div>
    </div>
  )
}
