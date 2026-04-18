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
import { CheckCircle, ChevronLeft, ChevronRight, Save, AlertCircle } from 'lucide-react';

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

function validateStep(step, formData) {
  switch (step) {
    case 1:
      if (!formData.name?.trim()) return 'Full name is required';
      if (!formData.dob) return 'Date of birth is required';
      if (!formData.gender) return 'Gender is required';
      if (!formData.aadhaar || !/^\d{12}$/.test(formData.aadhaar)) return 'Valid 12-digit Aadhaar number is required';
      if (!formData.community_id) return 'Community is required';
      if (!formData.admission_type) return 'Admission type is required';
      return null;
    case 2:
      if (!formData.comm_address?.trim()) return 'Communication address is required';
      if (!formData.comm_city?.trim()) return 'City / Town is required';
      if (!formData.comm_district_id) return 'District is required';
      return null;
    case 3:
      if (!formData.father_name?.trim()) return "Father's name is required";
      if (!formData.mother_name?.trim()) return "Mother's name is required";
      return null;
    case 4:
      if (!formData.board) return 'Qualifying examination board is required';
      if (!formData.register_no?.trim()) return 'Register number is required';
      if (!formData.last_school?.trim()) return 'Name of last school / institute is required';
      return null;
    case 5: {
      if (!formData.marks?.length) return 'Please add at least one mark entry';
      const incomplete = formData.marks.find(m => !m.subject_name?.trim() || m.marks_obtained === '' || m.marks_obtained == null);
      if (incomplete) return 'Please complete all mark entries (subject name and marks obtained)';
      return null;
    }
    case 6:
    case 7:
      return null;
    case 8:
      if (!formData.college_preferences?.length) return 'Please select at least one college preference';
      return null;
    default:
      return null;
  }
}

export default function ApplicationForm() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, currentStep, formData, loading } = useSelector((s) => s.application);
  const [declaration, setDeclaration] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stepError, setStepError] = useState('');
  const [maxReachedStep, setMaxReachedStep] = useState(currentStep);

  useEffect(() => {
    const init = async () => {
      if (id) {
        const res = await dispatch(fetchApplication(id));
        if (res.meta.requestStatus === 'fulfilled') {
          setMaxReachedStep(9);
        }
      } else {
        const res = await dispatch(createApplication());
        if (res.meta.requestStatus === 'fulfilled') {
          navigate(`/student/apply/${res.payload.application_id}`, { replace: true });
        } else {
          dispatch(addToast({ type: 'error', message: res.payload || 'Failed to create application' }));
          navigate('/student/dashboard');
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
  };

  const next = async () => {
    const err = validateStep(currentStep, formData);
    if (err) {
      setStepError(err);
      dispatch(addToast({ type: 'error', message: err }));
      return;
    }
    setStepError('');
    await saveProgress();
    const nextStep = currentStep + 1;
    dispatch(setCurrentStep(nextStep));
    setMaxReachedStep((prev) => Math.max(prev, nextStep));
  };

  const prev = () => {
    setStepError('');
    if (currentStep > 1) dispatch(setCurrentStep(currentStep - 1));
  };

  const goToStep = (stepId) => {
    if (stepId <= maxReachedStep) {
      setStepError('');
      dispatch(setCurrentStep(stepId));
    }
  };

  const handleSave = async () => {
    await saveProgress();
    dispatch(addToast({ type: 'success', message: 'Progress saved!' }));
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
    if (!photoUploaded) {
      dispatch(addToast({ type: 'error', message: 'Passport size photo upload is required before submitting.' }));
      return;
    }

    await saveProgress();
    const res = await dispatch(submitApplication(appId));
    if (res.meta.requestStatus === 'fulfilled') {
      const { paymentRequired, orderId, amount } = res.payload.data || {};
      if (paymentRequired) {
        dispatch(addToast({ type: 'info', message: 'Redirecting to payment gateway...' }));
        initiatePayment(appId, orderId, amount);
      } else {
        dispatch(addToast({ type: 'success', message: 'Application submitted successfully!' }));
        navigate('/student/status');
      }
    } else {
      dispatch(addToast({ type: 'error', message: res.payload || 'Submission failed. Please check all required fields.' }));
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
    } catch {
      dispatch(addToast({ type: 'error', message: 'Payment initiation failed' }));
    }
  };

  const StepComponent = STEPS[currentStep - 1]?.component;
  const canSubmit = declaration && photoUploaded && !loading;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Application Form</h1>
            {current?.application_no && <p className="text-sm text-gray-500">No: {current.application_no}</p>}
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-secondary flex items-center gap-2 text-sm">
            {saving ? <Spinner size="sm" /> : <Save size={15} />}
            Save Progress
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-6 overflow-x-auto pb-2">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <button
                onClick={() => goToStep(step.id)}
                disabled={step.id > maxReachedStep}
                className={`flex flex-col items-center gap-1 ${i < STEPS.length - 1 ? 'mr-1' : ''} disabled:cursor-not-allowed`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep === step.id
                    ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                    : currentStep > step.id || step.id < maxReachedStep
                    ? 'bg-green-500 text-white'
                    : step.id <= maxReachedStep
                    ? 'bg-primary/20 text-primary'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {step.id < maxReachedStep || (currentStep > step.id) ? <CheckCircle size={14} /> : step.id}
                </div>
                <span className={`text-xs ${currentStep === step.id ? 'text-primary font-medium' : step.id > maxReachedStep ? 'text-gray-400' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-6 sm:w-8 mx-1 mt-[-12px] ${step.id < maxReachedStep ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step error banner */}
        {stepError && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="flex-shrink-0" />
            {stepError}
          </div>
        )}

        {/* Step content */}
        <div className="card min-h-64">
          {loading && !current ? (
            <Spinner size="lg" className="py-20" />
          ) : currentStep === 9 ? (
            <PreviewSubmit
              onDeclarationChange={setDeclaration}
              declarationChecked={declaration}
              onPhotoUploaded={setPhotoUploaded}
            />
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
            <button onClick={next} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
              {saving ? <Spinner size="sm" /> : null}
              Save & Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              title={!declaration ? 'Accept declaration first' : !photoUploaded ? 'Upload passport photo first' : ''}
              className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Spinner size="sm" /> : <CheckCircle size={16} />}
              Submit Application
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
