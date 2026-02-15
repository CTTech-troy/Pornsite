import React, { useState } from 'react'
import { PhoneIcon } from 'lucide-react'
const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT - Abuja',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
]

export function ContactStep({
  data,
  updateData,
  onNext,
  onBack,
}) {
  const [errors, setErrors] = useState({})
  const validate = () => {
    const newErrors = {}
    if (!data.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Enter a valid email address'
    }
    if (!data.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!data.houseDetails.trim())
      newErrors.houseDetails = 'House details are required'
    if (!data.streetAddress.trim())
      newErrors.streetAddress = 'Street address is required'
    if (!data.city.trim()) newErrors.city = 'City is required'
    if (!data.lga.trim()) newErrors.lga = 'LGA is required'
    if (!data.state) newErrors.state = 'State is required'
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
          <PhoneIcon className="w-5 h-5 text-[#008751]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Contact & Address
          </h2>
          <p className="text-sm text-gray-500">How can we reach you?</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) =>
                updateData({
                  email: e.target.value,
                })
              }
              placeholder="you@example.com"
              className={inputClass('email')}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) =>
                updateData({
                  phone: e.target.value,
                })
              }
              placeholder="+234 801 234 5678"
              className={inputClass('phone')}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="pt-2 pb-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Address Details
          </p>
        </div>

        {/* House details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            House Number / Details *
          </label>
          <input
            type="text"
            value={data.houseDetails}
            onChange={(e) =>
              updateData({
                houseDetails: e.target.value,
              })
            }
            placeholder="e.g. Flat 3, Block B or No. 15"
            className={inputClass('houseDetails')}
          />
          {errors.houseDetails && (
            <p className="text-xs text-red-500 mt-1">{errors.houseDetails}</p>
          )}
        </div>

        {/* Street */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Street Address *
          </label>
          <input
            type="text"
            value={data.streetAddress}
            onChange={(e) =>
              updateData({
                streetAddress: e.target.value,
              })
            }
            placeholder="e.g. Admiralty Way, Lekki Phase 1"
            className={inputClass('streetAddress')}
          />
          {errors.streetAddress && (
            <p className="text-xs text-red-500 mt-1">{errors.streetAddress}</p>
          )}
        </div>

        {/* City + LGA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              City / Town *
            </label>
            <input
              type="text"
              value={data.city}
              onChange={(e) =>
                updateData({
                  city: e.target.value,
                })
              }
              placeholder="e.g. Ikeja"
              className={inputClass('city')}
            />
            {errors.city && (
              <p className="text-xs text-red-500 mt-1">{errors.city}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Local Government Area (LGA) *
            </label>
            <input
              type="text"
              value={data.lga}
              onChange={(e) =>
                updateData({
                  lga: e.target.value,
                })
              }
              placeholder="e.g. Eti-Osa"
              className={inputClass('lga')}
            />
            {errors.lga && (
              <p className="text-xs text-red-500 mt-1">{errors.lga}</p>
            )}
          </div>
        </div>

        {/* State + Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              State *
            </label>
            <select
              value={data.state}
              onChange={(e) =>
                updateData({
                  state: e.target.value,
                })
              }
              className={inputClass('state')}
            >
              <option value="">Select state</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="text-xs text-red-500 mt-1">{errors.state}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Country
            </label>
            <input
              type="text"
              value={data.country}
              onChange={(e) =>
                updateData({
                  country: e.target.value,
                })
              }
              className={inputClass('country')}
            />
          </div>
        </div>
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


export default ContactStep