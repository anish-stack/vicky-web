import { GetServerSideProps } from "next";
import { WebsiteProvider } from "@/context/WebsiteContext";
import ThemeRenderer from "@/src/themes/ThemeRenderer";
import { AlertCircle, Lock, Clock, Mail, RefreshCw } from "lucide-react";

type Props = {
  driverId: string;
  themeId: string;
  blocked: boolean;
  reason?: string;
  blockType?: 'expired' | 'not_live' | 'payment_failed';
};

export default function SlugThemePage({ driverId, themeId, blocked, reason, blockType }: Props) {
  // ❌ Block UI with Tailwind
  if (blocked) {
    const getBlockIcon = () => {
      switch (blockType) {
        case 'expired':
          return <Clock className="text-amber-500" size={48} />;
        case 'not_live':
          return <Lock className="text-red-500" size={48} />;
        case 'payment_failed':
          return <AlertCircle className="text-orange-500" size={48} />;
        default:
          return <Lock className="text-gray-500" size={48} />;
      }
    };

    const getBlockColor = () => {
      switch (blockType) {
        case 'expired':
          return 'amber';
        case 'not_live':
          return 'red';
        case 'payment_failed':
          return 'orange';
        default:
          return 'gray';
      }
    };

    const color = getBlockColor();

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 sm:p-6">
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-red-100/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-100/20 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header with Icon */}
            <div className={`bg-gradient-to-r from-${color}-50 to-${color}-100/50 px-6 py-8 text-center border-b border-${color}-200/50`}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-md mb-4">
                {getBlockIcon()}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Website Unavailable
              </h1>
              <p className={`text-sm text-${color}-700 font-medium`}>
                {blockType === 'expired' && '⏰ Subscription Expired'}
                {blockType === 'not_live' && '🚫 Not Live'}
                {blockType === 'payment_failed' && '💳 Payment Required'}
                {!blockType && '🔒 Access Denied'}
              </p>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
              {/* Reason */}
              <div className={`bg-${color}-50 border border-${color}-200 rounded-xl p-4 mb-6`}>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  {reason || "This website is currently not accessible. Please contact support."}
                </p>
              </div>

              {/* What to do */}
              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  What you can do:
                </h3>
                
                {blockType === 'expired' && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <RefreshCw size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <p>Renew your subscription to reactivate your website</p>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <Mail size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <p>Contact our support team for assistance</p>
                    </div>
                  </div>
                )}

                {blockType === 'not_live' && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <Lock size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <p>This website is currently set to "Not Live" status</p>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <Mail size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <p>Contact the website owner to enable it</p>
                    </div>
                  </div>
                )}

                {blockType === 'payment_failed' && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <AlertCircle size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
                      <p>Payment verification required</p>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <Mail size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <p>Please complete payment or contact support</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href="mailto:support@taxisafar.com"
                  className={`w-full bg-${color}-600 hover:bg-${color}-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base`}
                >
                  <Mail size={18} />
                  Contact Support
                </a>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <RefreshCw size={18} />
                  Refresh Page
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-center text-gray-500">
                Need help? Contact us at{" "}
                <a href="mailto:support@taxisafar.com" className="text-blue-600 hover:underline font-medium">
                  support@taxisafar.com
                </a>
              </p>
            </div>
          </div>

          {/* Bottom Text */}
          <p className="text-center text-xs text-gray-500 mt-4">
            Powered by <span className="font-semibold">Taxi Safar</span>
          </p>
        </div>
      </div>
    );
  }

  // ✅ Normal Theme Render
  return (
    <WebsiteProvider driverId={driverId} themeId={themeId}>
      <ThemeRenderer />
    </WebsiteProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const slug = params?.slug as string;

    if (!slug) {
      return { notFound: true };
    }

    // Fetch website details
    const res = await fetch(`https://www.driverwebiste.taxisafar.com/api/website/detail/${slug}`);
    
    if (!res.ok) {
      return { notFound: true };
    }

    const json = await res.json();

    if (!json?.success || !json?.data) {
      return { notFound: true };
    }

    const website = json.data;
    const driverId = website.driverId;
    const themeId = website?.themeId?.themeId;

    // Safety check
    if (!driverId || !themeId) {
      return { notFound: true };
    }

    // ✅ Check subscription and live status
    const paidTill = website?.paidTill ? new Date(website.paidTill) : null;
    const now = new Date();
    const isExpired = !paidTill || paidTill.getTime() < now.getTime();
    const isPaid = website?.subscription?.status === "paid";
    const isLive = website?.isLive === true;

    // ❌ Block conditions with specific types

    // Priority 1: Check if website is live
    if (!isLive) {
      return {
        props: {
          driverId,
          themeId,
          blocked: true,
          blockType: 'not_live',
          reason: "This website is currently not live. The owner has disabled public access.",
        },
      };
    }

    // Priority 2: Check subscription status
    if (!isPaid) {
      return {
        props: {
          driverId,
          themeId,
          blocked: true,
          blockType: 'payment_failed',
          reason: "Payment verification pending. Please complete the payment process to activate your website.",
        },
      };
    }

    // Priority 3: Check expiry
    if (isExpired) {
      return {
        props: {
          driverId,
          themeId,
          blocked: true,
          blockType: 'expired',
          reason: `Subscription expired on ${paidTill?.toLocaleDateString()}. Please renew to continue using your website.`,
        },
      };
    }

    // ✅ All checks passed - render normally
    return {
      props: {
        driverId,
        themeId,
        blocked: false,
      },
    };
  } catch (err) {
    console.error("Slug SSR error:", err);
    return { notFound: true };
  }
};