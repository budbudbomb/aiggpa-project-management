import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SurveyStore from '../stores/surveyStore';
import SurveyFillForm from '../components/surveys/SurveyFillForm';

export default function FillSurveyPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const survey = useMemo(() => {
    if (!id) return null;
    return SurveyStore.getSurveyById(id) || null;
  }, [id]);

  useEffect(() => {
    document.title = survey
      ? `Fill Survey — ${survey.title}`
      : 'Survey Answering';
  }, [survey]);

  if (!survey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-slate-800">
            Survey Not Found
          </h2>
          <p className="text-xs text-slate-500">
            The survey you are looking for may have been archived or removed.
          </p>
          <button
            type="button"
            onClick={() => navigate('/surveys')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Back to Surveys
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <SurveyFillForm
          survey={survey}
          onSuccess={() => navigate('/surveys?submitted=true')}
          onClose={() => navigate('/surveys')}
        />
      </div>
    </div>
  );
}
