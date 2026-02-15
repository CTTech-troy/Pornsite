import React from 'react'
import {
  UserIcon,
  PhoneIcon,
  FingerprintIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  CheckIcon,
} from 'lucide-react'

const steps = [
  {
    label: 'Profile',
    icon: UserIcon,
  },
  {
    label: 'Contact',
    icon: PhoneIcon,
  },
  {
    label: 'Identity',
    icon: FingerprintIcon,
  },
  {
    label: 'Payment',
    icon: CreditCardIcon,
  },
  {
    label: 'Consent',
    icon: ShieldCheckIcon,
  },
]
export default function StepSidebar({ currentStep, completedSteps }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 lg:w-64 bg-[#008751] text-white p-6 rounded-l-2xl shrink-0">
        <div className="mb-8">
          <h2 className="text-lg font-bold tracking-tight">
            Creator Application
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Complete all steps to apply
          </p>
        </div>
        <nav className="flex-1 space-y-1" aria-label="Application steps">
          {steps.map((step, idx) => {
            const isActive = currentStep === idx
            const isCompleted = completedSteps.includes(idx)
            const StepIcon = step.icon
            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-white/20 text-white' : isCompleted ? 'text-white/80' : 'text-white/40'}`}
                aria-current={isActive ? 'step' : undefined}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${isActive ? 'bg-white text-[#008751]' : isCompleted ? 'bg-white/30 text-white' : 'bg-white/10 text-white/40'}`}
                >
                  {isCompleted && !isActive ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{step.label}</p>
                  <p className="text-[11px] opacity-60">
                    Step {idx + 1} of {steps.length}
                  </p>
                </div>
              </div>
            )
          })}
        </nav>
        <div className="mt-auto pt-6 border-t border-white/10">
          <p className="text-xs text-white/40">
            Your data is secure and encrypted
          </p>
        </div>
      </aside>

      {/* Mobile horizontal steps */}
      <div className="md:hidden w-full bg-[#008751] px-4 py-3 rounded-t-2xl">
        <p className="text-white/70 text-xs font-medium mb-2 px-1">
          Step {currentStep + 1} of {steps.length}
        </p>
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {steps.map((step, idx) => {
            const isActive = currentStep === idx
            const isCompleted = completedSteps.includes(idx)
            const StepIcon = step.icon
            return (
              <div
                key={step.label}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg shrink-0 transition-all duration-200 ${isActive ? 'bg-white/20 text-white' : isCompleted ? 'text-white/70' : 'text-white/30'}`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${isActive ? 'bg-white text-[#008751]' : isCompleted ? 'bg-white/25 text-white' : 'bg-white/10'}`}
                >
                  {isCompleted && !isActive ? (
                    <CheckIcon className="w-3 h-3" />
                  ) : (
                    <StepIcon className="w-3 h-3" />
                  )}
                </div>
                <span className="text-xs font-medium whitespace-nowrap">
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
