import React from 'react';
import { useParams } from 'react-router-dom';
import SurveyDashboardClient from '@/components/surveys/analytics/SurveyDashboardClient';
import { PageContainer } from '@/components';

export default function SurveyDashboardPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <PageContainer>
      <SurveyDashboardClient surveyId={id || 'survey-01'} />
    </PageContainer>
  );
}
