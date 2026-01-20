export default function UsageCard({ usageCount }) {
  return (
    <div className="bg-indigo-50 p-4 rounded-xl mb-8">
      <p className="text-sm text-gray-600">AI Usage</p>
      <p className="text-3xl font-bold text-indigo-700">{usageCount} ครั้ง</p>
    </div>
  );
}
