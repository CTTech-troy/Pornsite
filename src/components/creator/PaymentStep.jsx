import React, { useState } from 'react'
import { CreditCardIcon, Building2Icon, SmartphoneIcon } from 'lucide-react'
const NIGERIAN_BANKS = [
  'Access Bank',
  'Citibank Nigeria',
  'Ecobank Nigeria',
  'Fidelity Bank',
  'First Bank of Nigeria',
  'First City Monument Bank (FCMB)',
  'Globus Bank',
  'Guaranty Trust Bank (GTBank)',
  'Heritage Bank',
  'Jaiz Bank',
  'Keystone Bank',
  'Kuda Bank',
  'Lotus Bank',
  'Mutual Trust Bank',
  'Optimus Bank',
  'Parallex Bank',
  'Polaris Bank',
  'Premium Trust Bank',
  'Providus Bank',
  'Signature Bank',
  'Stanbic IBTC Bank',
  'Standard Chartered',
  'Sterling Bank',
  'SunTrust Bank',
  'TAJ Bank',
  'Titan Trust Bank',
  'Union Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Unity Bank',
  'VFD Microfinance Bank',
  'Wema Bank',
  'Zenith Bank',
]
const MOBILE_MONEY = ['OPay', 'PalmPay', 'Moniepoint']

export function PaymentStep({
  data,
  updateData,
  onNext,
  onBack,
}) {
  const [errors, setErrors] = useState({})
  const validate = () => {
    const newErrors = {}
    if (!data.bvn.trim()) {
      newErrors.bvn = 'BVN is required'
    } else if (!/^\d{11}$/.test(data.bvn.trim())) {
      newErrors.bvn = 'BVN must be exactly 11 digits'
    }
    if (data.paymentMethod === 'bank') {
      if (!data.bankName) newErrors.bankName = 'Select a bank'
      if (!data.accountNumber.trim()) {
        newErrors.accountNumber = 'Account number is required'
      } else if (!/^\d{10}$/.test(data.accountNumber.trim())) {
        newErrors.accountNumber = 'Account number must be exactly 10 digits'
      }
      if (!data.accountName.trim())
        newErrors.accountName = 'Account name is required'
    } else {
      if (!data.mobileProvider) newErrors.mobileProvider = 'Select a provider'
      if (!data.mobileNumber.trim())
        newErrors.mobileNumber = 'Phone number is required'
      if (!data.mobileAccountName.trim())
        newErrors.mobileAccountName = 'Account name is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleNext = () => {
    if (validate()) onNext()
  }
  const inputClass = (field) =>
    `w-full h-12 px-4 rounded-lg border text-sm transition-colors duration-150 bg-white ${errors[field] ? 'border-red-400 focus:border-red-500' : 'border-gray-200 hover:border-gray-300 focus:border-[#008751]'}`
  return (
    <div className="step-transition">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#f0fdf6] flex items-center justify-center">
          <CreditCardIcon className="w-5 h-5 text-[#008751]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Payment Details
          </h2>
          <p className="text-sm text-gray-500">How should we pay you?</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* BVN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Bank Verification Number (BVN) *
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={11}
            value={data.bvn}
            onChange={(e) =>
              updateData({
                bvn: e.target.value.replace(/\D/g, '').slice(0, 11),
              })
            }
            placeholder="11-digit BVN"
            className={inputClass('bvn')}
          />
          {errors.bvn && (
            <p className="text-xs text-red-500 mt-1">{errors.bvn}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Required for identity verification
          </p>
        </div>

        {/* Method toggle */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Payment Method
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                updateData({
                  paymentMethod: 'bank',
                })
              }
              className={`flex items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-150 text-left ${data.paymentMethod === 'bank' ? 'border-[#008751] bg-[#f0fdf6]' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <Building2Icon
                className={`w-5 h-5 shrink-0 ${data.paymentMethod === 'bank' ? 'text-[#008751]' : 'text-gray-400'}`}
              />
              <div>
                <p
                  className={`text-sm font-medium ${data.paymentMethod === 'bank' ? 'text-[#008751]' : 'text-gray-700'}`}
                >
                  Bank Transfer
                </p>
                <p className="text-xs text-gray-400">Direct to bank</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() =>
                updateData({
                  paymentMethod: 'mobile',
                })
              }
              className={`flex items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-150 text-left ${data.paymentMethod === 'mobile' ? 'border-[#008751] bg-[#f0fdf6]' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <SmartphoneIcon
                className={`w-5 h-5 shrink-0 ${data.paymentMethod === 'mobile' ? 'text-[#008751]' : 'text-gray-400'}`}
              />
              <div>
                <p
                  className={`text-sm font-medium ${data.paymentMethod === 'mobile' ? 'text-[#008751]' : 'text-gray-700'}`}
                >
                  Mobile Money
                </p>
                <p className="text-xs text-gray-400">OPay, PalmPay, etc.</p>
              </div>
            </button>
          </div>
        </div>

        {/* Bank Transfer fields */}
        {data.paymentMethod === 'bank' && (
          <div className="space-y-4 step-transition">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Bank Name *
              </label>
              <select
                value={data.bankName}
                onChange={(e) =>
                  updateData({
                    bankName: e.target.value,
                  })
                }
                className={inputClass('bankName')}
              >
                <option value="">Select your bank</option>
                {NIGERIAN_BANKS.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
              {errors.bankName && (
                <p className="text-xs text-red-500 mt-1">{errors.bankName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Account Number *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={data.accountNumber}
                  onChange={(e) =>
                    updateData({
                      accountNumber: e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 10),
                    })
                  }
                  placeholder="10-digit account number"
                  className={inputClass('accountNumber')}
                />
                {errors.accountNumber && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.accountNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={data.accountName}
                  onChange={(e) =>
                    updateData({
                      accountName: e.target.value,
                    })
                  }
                  placeholder="As shown on your account"
                  className={inputClass('accountName')}
                />
                {errors.accountName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.accountName}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Money fields */}
        {data.paymentMethod === 'mobile' && (
          <div className="space-y-4 step-transition">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Provider *
              </label>
              <select
                value={data.mobileProvider}
                onChange={(e) =>
                  updateData({
                    mobileProvider: e.target.value,
                  })
                }
                className={inputClass('mobileProvider')}
              >
                <option value="">Select provider</option>
                {MOBILE_MONEY.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {errors.mobileProvider && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.mobileProvider}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={data.mobileNumber}
                  onChange={(e) =>
                    updateData({
                      mobileNumber: e.target.value,
                    })
                  }
                  placeholder="+234 801 234 5678"
                  className={inputClass('mobileNumber')}
                />
                {errors.mobileNumber && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.mobileNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={data.mobileAccountName}
                  onChange={(e) =>
                    updateData({
                      mobileAccountName: e.target.value,
                    })
                  }
                  placeholder="Name on your account"
                  className={inputClass('mobileAccountName')}
                />
                {errors.mobileAccountName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.mobileAccountName}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8 gap-3">
        <button
          onClick={onBack}
          className="h-12 px-6 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors duration-150"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="h-12 px-8 bg-[#008751] hover:bg-[#006b40] text-white text-sm font-semibold rounded-xl transition-colors duration-150 active:scale-[0.98]"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default PaymentStep  