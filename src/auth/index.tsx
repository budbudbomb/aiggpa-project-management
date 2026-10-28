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
import FillSurveyPage from '../pages/FillSurveyPage';
import ComplaintsPage from '../pages/ComplaintsPage';
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

function RootRedirect() {
  const { user } = useAuthStore();
  const isTier3 =
    user?.role === 'Fellow' ||
    user?.role === 'Intern' ||
    user?.role === 'Field Instructor' ||
    user?.role === 'Research Analyst';

  return <Navigate to={isTier3 ? '/activities' : '/dashboard'} replace />;
}

function RoleRouteGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!isRouteAllowedForRole(location.pathname, user?.role)) {
    const isTier3 =
      user?.role === 'Fellow' ||
      user?.role === 'Intern' ||
      user?.role === 'Field Instructor' ||
      user?.role === 'Research Analyst';
    const fallback = isTier3
      ? '/activities'
      : user?.defaultLandingPath || '/dashboard';
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
          <Route path="" element={<RootRedirect />} />
          <Route path="home" element={<Features />} />

          {/* Project Management Core Suite */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="create-project" element={<CreateProjectPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="surveys" element={<SurveysPage />} />
          <Route path="surveys/:id" element={<FillSurveyPage />} />
          <Route path="surveys/:id/fill" element={<FillSurveyPage />} />
          <Route
            path="surveys/:id/dashboard"
            element={<SurveyDashboardPage />}
          />
          <Route path="create-survey" element={<CreateSurveyPage />} />
          <Route path="complaints" element={<ComplaintsPage />} />
          <Route
            path="create-complaint"
            element={<Navigate to="/complaints" replace />}
          />
          <Route
            path="complaints/create"
            element={<Navigate to="/complaints" replace />}
          />
          <Route
            path="question-bank"
            element={<Navigate to="/surveys" replace />}
          />

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
          <Route path="masters/milestones" element={<MilestoneMasterPage />} />

          {/* Legacy redirects & aliases */}
          <Route path="budget" element={<BudgetRedirect />} />
          <Route
            path="question-list"
            element={<Navigate to="/surveys" replace />}
          />

          {/* Fallback */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </RoleRouteGuard>
    </AppLayout>
  );
}

export default function AuthorizedApp() {
  return <AppLayoutFeatures />;
}
