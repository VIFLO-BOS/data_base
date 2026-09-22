import { FileBarChart } from 'lucide-react';
export default function ReportsPage() {
  return <div className="w-full rounded-xl bg-white p-6 shadow-md">
    <div className="flex items-center gap-3">
      <FileBarChart className="h-5 w-5 text-indigo-600" />
      <h1 className="text-2xl font-semibold text-stone-900">Reports</h1>
    </div>
    <p className="mt-4 text-stone-600">Report generation and file exports are currently unavailable.</p>
  </div>;
}
