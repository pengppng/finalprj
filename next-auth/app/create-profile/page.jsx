"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function CreateProfilePage() {
  const router = useRouter();

  const [gender, setGender] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [isDoctor, setIsDoctor] = useState(0);

  // ✅ DOB string
  const dobString = useMemo(() => {
    if (!year || !month || !day) return "";
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  }, [year, month, day]);

  // ✅ check login
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/me`, { credentials: "include" });
        if (r.status === 401) router.replace("/");
      } catch {}
    })();
  }, [router]);

  const validate = () => {
    setErr("");

    if (!gender) return "กรุณาเลือกเพศ";
    if (!year || !month || !day) return "กรุณากรอกวันเกิดให้ครบ";

    const y = Number(year);
    const m = Number(month);
    const d = Number(day);

    if (y < 1900 || y > new Date().getFullYear()) return "ปีเกิดไม่ถูกต้อง";
    if (m < 1 || m > 12) return "เดือนเกิดไม่ถูกต้อง";
    if (d < 1 || d > 31) return "วันที่ไม่ถูกต้อง";

    const dt = new Date(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    if (dt.getFullYear() !== y || dt.getMonth() + 1 !== m || dt.getDate() !== d) {
      return "วันเกิดไม่ถูกต้อง";
    }

    return "";
  };

  const onSubmit = async () => {
    const v = validate();
    if (v) return setErr(v);

    setLoading(true);
    setErr("");

    try {
      const r = await fetch(`${API_BASE}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          gender,
          date_of_birth: dobString,
          is_doctor: isDoctor,
        }),
      });

      if (!r.ok) throw new Error(await r.text());
      router.push("/dashboard");
    } catch (e) {
      setErr("บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-xl">
        <h1 className="text-5xl font-bold text-center mb-14">
          Create your account
        </h1>

        {/* Gender */}
        <label className="block text-xl text-gray-600 mb-3">Gender</label>
        <div className="grid grid-cols-2 gap-6 mb-10">
          {[
            { value: "female", label: "Female", icon: "👩" },
            { value: "male", label: "Male", icon: "👨" },
          ].map((g) => (
            <label
              key={g.value}
              className={`w-full h-16 flex items-center justify-center gap-3 rounded-2xl border cursor-pointer text-xl
                ${gender === g.value
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 bg-gray-50"}
              `}
            >
              <input
                type="radio"
                name="gender"
                value={g.value}
                checked={gender === g.value}
                onChange={() => setGender(g.value)}
                className="hidden"
              />
              <span className="text-2xl">{g.icon}</span>
              <span>{g.label}</span>
            </label>
          ))}
        </div>

        {/* DOB */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {/* Month */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-600">
              Month
            </label>
            <input
              placeholder="MM"
              value={month}
              onChange={(e) =>
                setMonth(e.target.value.replace(/\D/g, "").slice(0, 2))
              }
              className="w-full h-16 px-6 rounded-2xl bg-gray-50 border text-xl"
              inputMode="numeric"
            />
          </div>

          {/* Day */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-600">
              Day
            </label>
            <input
              placeholder="DD"
              value={day}
              onChange={(e) =>
                setDay(e.target.value.replace(/\D/g, "").slice(0, 2))
              }
              className="w-full h-16 px-6 rounded-2xl bg-gray-50 border text-xl"
              inputMode="numeric"
            />
          </div>

          {/* Year */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-600">
              Year
            </label>
            <input
              placeholder="YYYY"
              value={year}
              onChange={(e) =>
                setYear(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              className="w-full h-16 px-6 rounded-2xl bg-gray-50 border text-xl"
              inputMode="numeric"
            />
          </div>
        </div>



        {/* Occupation */}
        <label className="block text-xl text-gray-600 mb-3">Occupation</label>
        <div className="grid grid-cols-2 gap-6 mb-12">
          {[
            { v: 0, label: "Not a doctor", icon: "👤" },
            { v: 1, label: "Doctor", icon: "👨‍⚕️" },
          ].map((o) => (
            <label
              key={o.v}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl border cursor-pointer
                ${isDoctor === o.v ? "border-indigo-600 bg-indigo-50" : "border-gray-200 bg-gray-50"}
              `}
            >
              <input
                type="radio"
                checked={isDoctor === o.v}
                onChange={() => setIsDoctor(o.v)}
                className="hidden"
              />
              <span className="text-3xl">{o.icon}</span>
              <span className="text-xl">{o.label}</span>
            </label>
          ))}
        </div>

        {err && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700">
            {err}
          </div>
        )}

        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full h-20 rounded-2xl bg-gray-200 text-2xl font-semibold"
        >
          {loading ? "saving..." : "submit"}
        </button>
      </div>
    </div>
  );
}
