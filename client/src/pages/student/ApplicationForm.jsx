import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { createApplication, updateApplication, submitApplication, fetchApplication, setCurrentStep } from '../../store/slices/applicationSlice';
import { addToast } from '../../store/slices/uiSlice';
import AppLayout from '../../components/layout/AppLayout';
import PersonalDetails from '../../components/forms/PersonalDetails';
import ContactDetails from '../../components/forms/ContactDetails';
import ParentDetails from '../../components/forms/ParentDetails';
import AcademicHistory from '../../components/forms/AcademicHistory';
import MarksEntry from '../../components/forms/MarksEntry';
import EducationalHistory from '../../components/forms/EducationalHistory';
import SpecialCategory from '../../components/forms/SpecialCategory';
import CollegeChoice from '../../components/forms/CollegeChoice';
import PreviewSubmit from '../../components/forms/PreviewSubmit';
import Spinner from '../../components/common/Spinner';
import { CheckCircle, ChevronLeft, ChevronRight, Save } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Personal', component: PersonalDetails },
  { id: 2, label: 'Contact', component: ContactDetails },
  { id: 3, label: 'Parent', component: ParentDetails },
  { id: 4, label: 'Academic', component: AcademicHistory },
  { id: 5, label: 'Marks', component: MarksEntry },
  { id: 6, label: 'Education', component: EducationalHistory },
  { id: 7, label: 'Special', component: SpecialCategory },
  { id: 8, label: 'Colleges', component: CollegeChoice },
  { id: 9, label: 'Submit', component: null },
];

export default function ApplicationForm() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, currentStep, formData, loading } = useSelector((s) => s.application);
  const [declaration, setDeclaration] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (id) {
        await dispatch(fetchApplication(id));
      } else {
        const res = await dispatch(createApplication());
        if (res.meta.requestStatus === 'fulfilled') {
          navigate(`/student/apply/${res.payload.application_id}`, { replace: true });
        }
      }
    };
    init();
  }, []);

  const appId = current?.application_id || id;

  const saveProgress = async () => {
    if (!appId) return;
    setSaving(true);
    await dispatch(updateApplication({ id: appId, data: formData }));
    setSaving(false);
    dispatch(addToast({ type: 'success', message: 'Progress saved!' }));
  };

  const next = async () => {
    await saveProgress();
    if (currentStep < 9) dispatch(setCurrentStep(currentStep + 1))
  };

  const prev = () => {
    if (currentStep > 1) dispatch(setCurrentStep(currentStep - 1));
  };

  const handleSubmit = async () => {
    if (!declaration) {
      dispatch(addToast({ type: 'error', message: 'Please accept the declaration to proceed.' }));
      return;
    }
    if (!formData.college_preferences?.length) {
      dispatch(addToast({ type: 'error', message: 'Please add at least one college preference.' }));
      return;
    }
    await saveProgress();
    const res = await dispatch(submitApplication(appId));
    if (res.meta.requestStatus === 'fulfilled') {
      const { paymentRequired, orderId, amount } = res.payload.data || {};
      if (paymentRequired) {
        // Trigger CCAvenue payment
        dispatch(addToast({ type: 'info', message: 'Redirecting to payment gateway...' }));
        initiatePayment(appId, orderId, amount);
      } else {
        dispatch(addToast({ type: 'success', message: 'Application submitted successfully!' }));
        navigate('/student/status');
      }
    } else {
      dispatch(addToast({ type: 'error', message: res.payload || 'Submission failed' }));
    }
  };

  const initiatePayment = async (applicationId) => {
    try {
      const api = (await import('../../services/api')).default;
      const res = await api.post('/payment/initiate', { application_id: applicationId });
      const { encRequest, access_code, action } = res.data.data;
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = action;
      [['encRequest', encRequest], ['access_code', access_code]].forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden'; input.name = name; input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: 'Payment initiation failed' }));
    }
  };

  const StepComponent = STEPS[currentStep - 1]?.component;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Application Form</h1>
            {current?.application_no && <p className="text-sm text-gray-500">Application No: {current.application_no}</p>}
          </div>
          <button onClick={saveProgress} disabled={saving} className="btn-secondary flex items-center gap-2 text-sm">
            {saving ? <Spinner size="sm" /> : <Save size={15} />}
            Save Progress
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8 overflow-x-auto pb-2">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <button
                onClick={() => dispatch(setCurrentStep(step.id))}
                className={`flex flex-col items-center gap-1 ${i < STEPS.length - 1 ? 'mr-1' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep === step.id ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                  : currentStep > step.id ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.id ? <CheckCircle size={14} /> : step.id}
                </div>
                <span className={`text-xs ${currentStep === step.id ? 'text-primary font-medium' : 'text-gray-500'}`}>{step.label}</span>
              </button>
              {i < STEPS.length - 1 && <div className={`h-0.5 w-6 sm:w-10 mx-1 mt-[-12px] ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="card min-h-64">
          {loading && !current ? (
            <Spinner size="lg" className="py-20" />
          ) : currentStep === 9 ? (
            <PreviewSubmit onDeclarationChange={setDeclaration} declarationChecked={declaration} />
          ) : StepComponent ? (
            <StepComponent />
          ) : null}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={prev} disabled={currentStep === 1} className="btn-secondary flex items-center gap-2 disabled:opacity-50">
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="text-sm text-gray-500">Step {currentStep} of {STEPS.length}</span>
          {currentStep < 9 ? (
            <button onClick={next} disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <Spinner size="sm" /> : null}
              Save & Next <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!declaration || loading} className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50">
              {loading ? <Spinner size="sm" /> : <CheckCircle size={16} />}
              Submit Application
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
