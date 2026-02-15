import React, { useState } from 'react'
import  StepSidebar  from './StepSidebar'
import  ProfileStep  from './ProfileStep'
import  ContactStep  from './ContactStep'
import  IdentityStep  from './IdentityStep'
import  PaymentStep  from './PaymentStep'
import  ConsentStep  from './ConsentStep'
import { CheckCircle2Icon } from 'lucide-react'
const initialFormData = {
  firstName: '',
  lastName: '',
  displayName: '',
  dateOfBirth: '',
  gender: '',
  bio: '',
  email: '',
  phone: '',
  houseDetails: '',
  streetAddress: '',
  city: '',
  lga: '',
  state: '',
  country: 'Nigeria',
  idType: '',
  idNumber: '',
  idFrontFile: null,
  idFrontPreview: '',
  idBackFile: null,
  idBackPreview: '',
  paymentMethod: 'bank',
  bankName: '',
  accountNumber: '',
  accountName: '',
  bvn: '',
  mobileProvider: '',
  mobileNumber: '',
  mobileAccountName: '',
  termsAccepted: false,
  privacyAccepted: false,
  dataProcessingAccepted: false,
  ageConfirmed: false,
}
export function CreatorApplicationModal({ isOpen = false, onClose = () => {}, onApply = () => {} }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [formData, setFormData] = useState(initialFormData)
  const [submitted, setSubmitted] = useState(false)
  const updateFormData = (partial) => {
    setFormData((prev) => {
      const next = {
        ...prev,
        ...partial,
      }
      try {
        console.log('CreatorApplicationModal - form update:', partial)
        console.log('CreatorApplicationModal - full form data:', next)
      } catch (err) {
        // ignore logging failures
      }
      return next
    })
  }
  const goNext = () => {
    setCompletedSteps((prev) =>
      prev.includes(currentStep) ? prev : [...prev, currentStep],
    )
    setCurrentStep((prev) => Math.min(prev + 1, 4))
  }
  const goBack = () => {
    setCurrentStep((prev) => {
      const next = Math.max(prev - 1, 0)
      console.log(`CreatorApplicationModal - navigate back: from ${prev} to ${next}`)
      return next
    })
  }
  const handleSubmit = () => {
    setCompletedSteps((prev) => (prev.includes(4) ? prev : [...prev, 4]))
    setSubmitted(true)
    try {
      console.log('CreatorApplicationModal - final submission payload:', formData)
    } catch (err) {
      // ignore
    }
    try {
      onApply(formData)
    } catch (err) {
      console.warn('onApply callback failed', err)
    }
  }
  if (!isOpen) return null

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={() => { setSubmitted(false); onClose(); }} />
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 max-w-md w-full text-center step-transition">
          <div className="w-16 h-16 rounded-full bg-[#f0fdf6] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2Icon className="w-8 h-8 text-[#008751]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Application Submitted!
          </h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            Thank you, {formData.firstName}! Your creator application has been
            received. We'll review your details and get back to you within 2–3
            business days.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium text-gray-700">Name:</span>{' '}
              {formData.firstName} {formData.lastName}
            </p>
            <p>
              <span className="font-medium text-gray-700">Email:</span>{' '}
              {formData.email}
            </p>
            <p>
              <span className="font-medium text-gray-700">State:</span>{' '}
              {formData.state}
            </p>
          </div>
          <button
            onClick={() => {
              setSubmitted(false)
              setCurrentStep(0)
              setCompletedSteps([])
              setFormData(initialFormData)
              try { onClose() } catch (err) {}
            }}
            className="mt-6 h-12 px-8 bg-[#008751] hover:bg-[#006b40] text-white text-sm font-semibold rounded-xl transition-colors duration-150"
          >
            Start New Application
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-0 md:p-6 lg:p-8">
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose()} />
      <div className="relative w-full max-w-4xl bg-white md:rounded-2xl md:shadow-xl overflow-hidden flex flex-col md:flex-row min-h-screen md:min-h-0 md:max-h-[90vh]">
        <button onClick={() => onClose()} className="absolute top-4 right-4 z-50 bg-white rounded-full p-2 shadow">
          ✕
        </button>
        <StepSidebar
          currentStep={currentStep}
          completedSteps={completedSteps}
        />

        <main className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-8">
          {currentStep === 0 && (
            <ProfileStep
              data={{
                firstName: formData.firstName,
                lastName: formData.lastName,
                displayName: formData.displayName,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                bio: formData.bio,
              }}
              updateData={updateFormData}
              onNext={goNext}
            />
          )}
          {currentStep === 1 && (
            <ContactStep
              data={{
                email: formData.email,
                phone: formData.phone,
                houseDetails: formData.houseDetails,
                streetAddress: formData.streetAddress,
                city: formData.city,
                lga: formData.lga,
                state: formData.state,
                country: formData.country,
              }}
              updateData={updateFormData}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 2 && (
            <IdentityStep
              data={{
                idType: formData.idType,
                idNumber: formData.idNumber,
                idFrontFile: formData.idFrontFile,
                idFrontPreview: formData.idFrontPreview,
                idBackFile: formData.idBackFile,
                idBackPreview: formData.idBackPreview,
              }}
              updateData={updateFormData}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 3 && (
            <PaymentStep
              data={{
                paymentMethod: formData.paymentMethod,
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                accountName: formData.accountName,
                bvn: formData.bvn,
                mobileProvider: formData.mobileProvider,
                mobileNumber: formData.mobileNumber,
                mobileAccountName: formData.mobileAccountName,
              }}
              updateData={updateFormData}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 4 && (
            <ConsentStep
              data={{
                termsAccepted: formData.termsAccepted,
                privacyAccepted: formData.privacyAccepted,
                dataProcessingAccepted: formData.dataProcessingAccepted,
                ageConfirmed: formData.ageConfirmed,
              }}
              updateData={updateFormData}
              onBack={goBack}
              onSubmit={handleSubmit}
            />
          )}
        </main>
      </div>
    </div>
  )
}


export default CreatorApplicationModal