import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-sm text-body">That address does not exist.</p>
      <Link href="/" className="mt-6 inline-block text-sm font-semibold text-teal">
        Back to MFD Studio
      </Link>
    </main>
  );
}
