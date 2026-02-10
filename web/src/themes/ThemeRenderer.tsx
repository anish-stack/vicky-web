import dynamic from "next/dynamic";
import { useWebsite } from "@/context/WebsiteContext";
import { Loader2, AlertCircle, Globe } from "lucide-react";

const themes: Record<string, any> = {
  "driver-classic": dynamic(() => import("./driver-classic/Theme"), { ssr: false }),
  "driver-modern": dynamic(() => import("./driver-modern/ThemeTwo"), { ssr: false }),
};

export default function ThemeRenderer() {
  const { website, themeId, loading } = useWebsite();

  // ✅ Normalize themeId (string / object both supported)
  const finalThemeId =
    typeof themeId === "string"
      ? themeId
      : themeId?.themeId || themeId?._id || "";

  // 🔄 Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30 flex items-center justify-center p-4">
        <div className="text-center">
          {/* Animated Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-6">
            <Loader2 className="text-red-600 animate-spin" size={40} />
          </div>

          {/* Loading Text */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Loading Website...
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Please wait while we prepare your content
          </p>

          {/* Loading Bar */}
          <div className="mt-6 w-64 max-w-full mx-auto bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-loading-bar" />
          </div>
        </div>

        <style jsx>{`
          @keyframes loading-bar {
            0% {
              width: 0%;
              margin-left: 0%;
            }
            50% {
              width: 75%;
              margin-left: 0%;
            }
            100% {
              width: 0%;
              margin-left: 100%;
            }
          }
          .animate-loading-bar {
            animation: loading-bar 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // ❌ Website Not Found
  if (!website) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-5">
            <AlertCircle className="text-red-600" size={32} />
          </div>

          {/* Message */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Website Not Found
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6">
            The website you're looking for doesn't exist or has been removed.
          </p>

          {/* Action */}
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <Loader2 size={18} />
            Refresh Page
          </button>

          <p className="text-xs text-gray-500 mt-6">
            If the problem persists, please contact support
          </p>
        </div>
      </div>
    );
  }

  // ❌ Theme Not Found
  const ThemeComponent = themes[finalThemeId];

  if (!ThemeComponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-5">
              <Globe className="text-red-600" size={32} />
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Theme Not Available
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-sm sm:text-base mb-5">
              The theme configuration for this website is missing or invalid.
            </p>

            {/* Details Box */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Theme Details:</p>
                  <p className="text-xs text-gray-700 font-mono break-all">
                    ID: <span className="font-bold">{finalThemeId || "N/A"}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Available Themes */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Available Themes:</p>
              <div className="space-y-1">
                {Object.keys(themes).map((themeKey) => (
                  <div
                    key={themeKey}
                    className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded border border-gray-200"
                  >
                    • {themeKey}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Loader2 size={18} />
                Reload Page
              </button>

              <a
                href="mailto:support@taxisafar.com?subject=Theme%20Configuration%20Issue"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors text-center"
              >
                Contact Support
              </a>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-4">
            Error Code: THEME_NOT_FOUND
          </p>
        </div>
      </div>
    );
  }

  // ✅ Render Theme
  return <ThemeComponent website={website} />;
}