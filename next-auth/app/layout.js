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
