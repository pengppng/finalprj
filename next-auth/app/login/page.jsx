// "use client";

// import { GoogleLogin } from "@react-oauth/google";

// export default function LoginPage() {

//   const handleGoogleLogin = async (credentialResponse) => {
//     const idToken = credentialResponse.credential;

//     await fetch("http://localhost:5000/auth/google", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({ token: idToken }),
//     });

//     window.location.href = "/dashboard";
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">

//       <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

//         {/* HEADER */}
//         <div className="text-center mb-8">
//           <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
//             🛡️
//           </div>
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">
//             Breast Cancer Detection
//           </h1>
//           <p className="text-gray-600">
//             AI-Powered Medical Imaging Analysis
//           </p>
//         </div>

//         {/* LOGIN FORM (เดิมของคุณ ใช้ได้) */}
//         <div className="flex flex-col gap-5">
//           <input
//             type="text"
//             placeholder="Username"
//             className="border p-3 rounded-lg"
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             className="border p-3 rounded-lg"
//           />

//           <button className="w-full bg-indigo-600 text-white py-3 rounded-lg">
//             Login
//           </button>
//         </div>

//         {/* DIVIDER */}
//         <div className="my-6 flex items-center gap-3">
//           <div className="flex-1 h-px bg-gray-300"></div>
//           <span className="text-gray-500 text-sm">OR</span>
//           <div className="flex-1 h-px bg-gray-300"></div>
//         </div>

//         {/* GOOGLE LOGIN */}
//         <div className="flex justify-center">
//           <GoogleLogin
//             onSuccess={handleGoogleLogin}
//             onError={() => console.log("Google Login Failed")}
//           />
//         </div>

//       </div>
//     </div>
//   );
// }
// console.log("CLIENT ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

"use client";

import { GoogleLogin } from "@react-oauth/google";

export default function Test() {
  return (
    <div style={{ padding: 40 }}>
      <GoogleLogin
        onSuccess={(res) => {
          console.log("Google Login Success:", res);
        }}
        onError={() => {
          console.log("Google Login Error");
        }}
      />
    </div>
  );
}
