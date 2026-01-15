import "./globals.css";
import Providers from "./provider";

export const metadata = {
  title: "Breast Cancer AI Detection",
  description: "AI-Powered Medical Imaging Analysis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
