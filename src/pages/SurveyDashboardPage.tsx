import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import SurveyDashboardClient from '@/components/surveys/analytics/SurveyDashboardClient';
import { PageContainer } from '@/components';
import { useAuthStore } from '@/auth/store/authStore';

export default function SurveyDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  if (
    user?.role !== 'Center Head' &&
    user?.role !== 'Advisor' &&
    user?.role !== 'Super Admin'
  ) {
    return <Navigate to="/activities" replace />;
  }

  return (
    <PageContainer>
      <SurveyDashboardClient surveyId={id || 'survey-01'} />
    </PageContainer>
  );
}
