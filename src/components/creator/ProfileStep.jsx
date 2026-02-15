import React, { useState } from 'react'
import { UserIcon } from 'lucide-react'

export function ProfileStep({ data, updateData, onNext }) {
  const [errors, setErrors] = useState({})
  const validate = () => {
    const newErrors = {}
    if (!data.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!data.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!data.displayName.trim())
      newErrors.displayName = 'Display name is required'
    if (!data.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
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
          <UserIcon className="w-5 h-5 text-[#008751]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Personal Profile
          </h2>
          <p className="text-sm text-gray-500">Tell us about yourself</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              First Name *
            </label>
            <input
              type="text"
              value={data.firstName}
              onChange={(e) =>
                updateData({
                  firstName: e.target.value,
                })
              }
              placeholder="e.g. Chioma"
              className={inputClass('firstName')}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Last Name *
            </label>
            <input
              type="text"
              value={data.lastName}
              onChange={(e) =>
                updateData({
                  lastName: e.target.value,
                })
              }
              placeholder="e.g. Okafor"
              className={inputClass('lastName')}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Display Name *
          </label>
          <input
            type="text"
            value={data.displayName}
            onChange={(e) =>
              updateData({
                displayName: e.target.value,
              })
            }
            placeholder="Your creator name"
            className={inputClass('displayName')}
          />
          {errors.displayName && (
            <p className="text-xs text-red-500 mt-1">{errors.displayName}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date of Birth *
            </label>
            <input
              type="date"
              value={data.dateOfBirth}
              onChange={(e) =>
                updateData({
                  dateOfBirth: e.target.value,
                })
              }
              className={inputClass('dateOfBirth')}
            />
            {errors.dateOfBirth && (
              <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Gender
            </label>
            <select
              value={data.gender}
              onChange={(e) =>
                updateData({
                  gender: e.target.value,
                })
              }
              className={inputClass('gender')}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Bio
          </label>
          <textarea
            value={data.bio}
            onChange={(e) =>
              updateData({
                bio: e.target.value,
              })
            }
            placeholder="Tell us a bit about yourself and your content..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 focus:border-[#008751] text-sm transition-colors duration-150 bg-white resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end mt-8">
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

export default ProfileStep
