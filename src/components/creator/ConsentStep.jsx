import React, { useState } from 'react'
import { ShieldCheckIcon, CheckIcon } from 'lucide-react'

function Checkbox({
  checked,
  onChange,
  label,
  description,
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${checked ? 'bg-[#008751] border-[#008751]' : 'border-gray-300 group-hover:border-gray-400'}`}
      >
        {checked && (
          <CheckIcon className="w-3 h-3 text-white" strokeWidth={3} />
        )}
      </button>
      <div>
        <p className="text-sm font-medium text-gray-800 leading-snug">
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </label>
  )
}
export function ConsentStep({
  data,
  updateData,
  onBack,
  onSubmit,
}) {
  const [submitting, setSubmitting] = useState(false)
  const allAccepted =
    data.termsAccepted &&
    data.privacyAccepted &&
    data.dataProcessingAccepted &&
    data.ageConfirmed
  const handleSubmit = () => {
    if (!allAccepted) return
    setSubmitting(true)
    setTimeout(() => {
      onSubmit()
      setSubmitting(false)
    }, 1500)
  }
  return (
    <div className="step-transition">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#f0fdf6] flex items-center justify-center">
          <ShieldCheckIcon className="w-5 h-5 text-[#008751]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Review & Consent
          </h2>
          <p className="text-sm text-gray-500">
            Almost done — please review and accept
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-600 leading-relaxed">
          By submitting this application, you agree to our platform's terms and
          conditions. Your personal data will be processed in accordance with
          Nigerian data protection regulations (NDPR) and used solely for the
          purpose of verifying your identity and processing payments.
        </p>
      </div>

      <div className="space-y-5">
        <Checkbox
          checked={data.termsAccepted}
          onChange={(v) =>
            updateData({
              termsAccepted: v,
            })
          }
          label="I accept the Terms of Service *"
          description="You agree to abide by the platform's creator guidelines and policies."
        />
        <Checkbox
          checked={data.privacyAccepted}
          onChange={(v) =>
            updateData({
              privacyAccepted: v,
            })
          }
          label="I accept the Privacy Policy *"
          description="Your data is handled in accordance with NDPR and our privacy policy."
        />
        <Checkbox
          checked={data.dataProcessingAccepted}
          onChange={(v) =>
            updateData({
              dataProcessingAccepted: v,
            })
          }
          label="I consent to data processing *"
          description="We may process your ID and banking details for verification purposes."
        />
        <Checkbox
          checked={data.ageConfirmed}
          onChange={(v) =>
            updateData({
              ageConfirmed: v,
            })
          }
          label="I confirm I am 18 years or older *"
          description="You must be at least 18 years old to apply as a creator."
        />
      </div>

      <div className="flex justify-between mt-8 gap-3">
        <button
          onClick={onBack}
          className="h-12 px-6 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors duration-150"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!allAccepted || submitting}
          className={`h-12 px-8 text-sm font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] ${allAccepted && !submitting ? 'bg-[#008751] hover:bg-[#006b40] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-75"
                />
              </svg>
              Submitting…
            </span>
          ) : (
            'Submit Application'
          )}
        </button>
      </div>
    </div>
  )
}


export default ConsentStep