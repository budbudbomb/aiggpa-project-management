import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../auth/store/authStore';
import ProjectsDashboard from '../auth/features/dashboard/ProjectsDashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const canViewDashboard =
    user?.role === 'Center Head' ||
    user?.role === 'Advisor' ||
    user?.role === 'Super Admin';

  if (!canViewDashboard) {
    return <Navigate to="/activities" replace />;
  }

  return <ProjectsDashboard />;
}
