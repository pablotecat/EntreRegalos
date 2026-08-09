import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">🎁 EntreRegalos</h1>
        <Outlet />
      </div>
    </div>
  );
}
