import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router';
import AppLayout from './layout';
import Features from './features';
import { useAuthStore } from './store/authStore';
import { isRouteAllowedForRole } from './config/menuConfig';

// Project Management Pages
import DashboardPage from '../pages/DashboardPage';
import CreateProjectPage from '../pages/CreateProjectPage';
import ActivitiesPage from '../pages/ActivitiesPage';
import SurveysPage from '../pages/SurveysPage';
import CreateSurveyPage from '../pages/CreateSurveyPage';
import SurveyDashboardPage from '../pages/SurveyDashboardPage';
import ComplaintsPage from '../pages/ComplaintsPage';
import QuestionBankPage from '../pages/QuestionBankPage';
import {
  EmployeeMasterPage,
  CenterMasterPage,
  FinancialYearMasterPage,
  SchemeMasterPage,
  BudgetHeadMasterPage,
  QuestionCategoryMasterPage,
  GrievanceCategoryMasterPage,
  MilestoneMasterPage,
} from '../pages/masters';

function RoleRouteGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!isRouteAllowedForRole(location.pathname, user?.role)) {
    const fallback = user?.defaultLandingPath || '/home';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

function BudgetRedirect(): React.ReactElement {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const projectId = params.get('projectId') || params.get('id');
  const to =
    '/create-project?view=budget' +
    (projectId ? `&projectId=${encodeURIComponent(projectId)}` : '');
  return <Navigate to={to} replace />;
}

export function AppLayoutFeatures() {
  return (
    <AppLayout>
      <RoleRouteGuard>
        <Routes>
          {/* Landing / Home */}
          <Route path="" element={<Navigate to="/create-project" replace />} />
          <Route path="home" element={<Features />} />

          {/* Project Management Core Suite */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="create-project" element={<CreateProjectPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="surveys" element={<SurveysPage />} />
          <Route path="surveys/:id/dashboard" element={<SurveyDashboardPage />} />
          <Route path="create-survey" element={<CreateSurveyPage />} />
          <Route path="complaints" element={<ComplaintsPage />} />
          <Route path="question-bank" element={<QuestionBankPage />} />

          {/* Master Data Management */}
          <Route
            path="masters"
            element={<Navigate to="/masters/employees" replace />}
          />
          <Route path="masters/employees" element={<EmployeeMasterPage />} />
          <Route path="masters/centers" element={<CenterMasterPage />} />
          <Route
            path="masters/financial-years"
            element={<FinancialYearMasterPage />}
          />
          <Route path="masters/schemes" element={<SchemeMasterPage />} />
          <Route
            path="masters/budget-heads"
            element={<BudgetHeadMasterPage />}
          />
          <Route
            path="masters/question-categories"
            element={<QuestionCategoryMasterPage />}
          />
          <Route
            path="masters/grievance-categories"
            element={<GrievanceCategoryMasterPage />}
          />
          <Route
            path="masters/milestones"
            element={<MilestoneMasterPage />}
          />

          {/* Legacy redirects & aliases */}
          <Route path="budget" element={<BudgetRedirect />} />
          <Route
            path="question-list"
            element={<Navigate to="/question-bank#list" replace />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/create-project" replace />} />
        </Routes>
      </RoleRouteGuard>
    </AppLayout>
  );
}

export default function AuthorizedApp() {
  return <AppLayoutFeatures />;
}
