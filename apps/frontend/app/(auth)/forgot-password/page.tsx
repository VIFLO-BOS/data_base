import Link from 'next/link';
export default function ForgotPasswordPage() {
  return <div className="rounded-2xl border border-white/10 p-8 text-white">
    <h1 className="text-2xl font-semibold">Password recovery unavailable</h1>
    <p className="my-4 text-zinc-400">Contact your administrator for help accessing your account.</p>
    <Link href="/login" className="text-indigo-400">Return to login</Link>
  </div>;
}
