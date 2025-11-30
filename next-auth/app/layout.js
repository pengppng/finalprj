// "use client";
// import "./globals.css";
// import { SessionProvider } from "next-auth/react";
// // export default function RootLayout({ children }) {
// //   return (
// //     <html lang="en">
// //       <body>
// //         <SessionProvider>{children}</SessionProvider>
// //       </body>
// //     </html>
// //   );
// // }
// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body>
//         <SessionProvider>{children}</SessionProvider>
//       </body>
//     </html>
//   );
// }

// ✅ app/layout.js (Server Component)
import "./globals.css";
import Providers from "./SessionProvider";

export const metadata = {
  title: "Breast Cancer AI Detection",
  description: "AI-Powered Medical Imaging Analysis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}