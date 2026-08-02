import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import LoginModal from "@/components/layout/LoginModal";

export default function Layout({
  children,
  settings,
  compactHeader = false,
  hideFooter = false,
}: {
  children: ReactNode;
  settings?: any;
  compactHeader?: boolean;
  hideFooter?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header compact={compactHeader} />
      <main className="flex-1">{children}</main>
      {hideFooter ? null : <Footer settings={settings} />}
      <LoginModal />
    </div>
  );
}
