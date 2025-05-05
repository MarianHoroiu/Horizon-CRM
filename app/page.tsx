import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-5xl items-center justify-between lg:flex">
        <div className="text-center lg:text-left">
          <h1 className="text-6xl font-bold">
            Horizon <span className="text-blue-600">CRM</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Manage your contacts and tasks efficiently
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 lg:flex-row lg:justify-start">
            <Link
              href="/contacts"
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
              View Contacts
            </Link>
            <Link
              href="/tasks"
              className="rounded-lg border border-blue-600 px-6 py-3 font-medium text-blue-600 hover:bg-blue-50">
              Manage Tasks
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
