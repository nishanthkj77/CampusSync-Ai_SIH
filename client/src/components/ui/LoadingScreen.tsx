interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({
  message = "Loading CampusSync AI...",
}: LoadingScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />
        <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>
      </div>
    </main>
  );
}