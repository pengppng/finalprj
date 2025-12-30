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

  // ✅ ใช้เช็คอายุ/วันเกิดเบื้องต้น (optional)
  const dobString = useMemo(() => {
    if (!year || !month || !day) return "";
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`; // YYYY-MM-DD
  }, [year, month, day]);

  // ✅ (ถ้ามี endpoint /me) เช็คว่า login อยู่ไหม
  // ถ้ายังไม่มี /me ใน backend ให้ comment ทิ้งได้
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/me`, { credentials: "include" });
        if (r.status === 401) router.replace("/");
      } catch {
        // ถ้า backend ยังไม่มี /me หรือยังไม่ได้ทำ session ก็ไม่เป็นไร
      }
    })();
  }, [router]);

  const validate = () => {
    setErr("");

    if (!gender) return "กรุณาเลือกเพศ (gender)";
    if (!year || !month || !day) return "กรุณากรอกวันเกิดให้ครบ";

    const y = Number(year);
    const m = Number(month);
    const d = Number(day);

    if (y < 1900 || y > new Date().getFullYear()) return "ปีเกิดไม่ถูกต้อง";
    if (m < 1 || m > 12) return "เดือนเกิดไม่ถูกต้อง";
    if (d < 1 || d > 31) return "วันที่ไม่ถูกต้อง";

    // ตรวจวันจริงแบบง่าย ๆ
    const dt = new Date(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T00:00:00`);
    if (dt.getFullYear() !== y || dt.getMonth() + 1 !== m || dt.getDate() !== d) {
      return "วันเกิดไม่ถูกต้อง (เช่น 31/02 ไม่มีจริง)";
    }

    return "";
  };

  const onSubmit = async () => {
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setLoading(true);
    setErr("");

    try {
      const r = await fetch(`${API_BASE}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          gender,
          date_of_birth: dobString, // ส่งเป็น YYYY-MM-DD
          is_doctor: isDoctor,
        }),
      });

      if (!r.ok) {
        const msg = await r.text();
        throw new Error(msg || "Failed to save profile");
      }

      // ✅ บันทึกสำเร็จ → ไป dashboard
      router.push("/dashboard");
    } catch (e) {
      setErr("บันทึกข้อมูลไม่สำเร็จ: " + (e?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-xl">
        <h1 className="text-5xl font-bold text-center mb-14">Create your account</h1>

        {/* Gender */}
        <label className="block text-xl text-gray-600 mb-3">Gender</label>
        <div className="mb-10">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full h-16 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-xl text-gray-700"
          >
            <option value="">Gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        {/* DOB */}
        <div className="grid grid-cols-3 gap-6 mb-16">
          <div>
            <label className="block text-xl text-gray-600 mb-3">Month</label>
            <input
              value={month}
              onChange={(e) => setMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder="mm"
              className="w-full h-16 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-xl"
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="block text-xl text-gray-600 mb-3">Day</label>
            <input
              value={day}
              onChange={(e) => setDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder="dd"
              className="w-full h-16 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-xl"
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="block text-xl text-gray-600 mb-3">Year</label>
            <input
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="yyyy"
              className="w-full h-16 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-xl"
              inputMode="numeric"
            />
          </div>

          <label className="block text-xl text-gray-600 mb-3">Occupation</label>
          <div className="mb-10">
              <select
                value={isDoctor}
                onChange={(e) => setIsDoctor(Number(e.target.value))}
                className="w-full h-16 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-xl"
              >
                <option value={0}>Not a doctor</option>
                <option value={1}>Doctor</option>
              </select>
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {err}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full h-20 rounded-2xl bg-gray-200 text-2xl font-semibold disabled:opacity-60"
        >
          {loading ? "saving..." : "submit"}
        </button>
      </div>
    </div>
  );
}
