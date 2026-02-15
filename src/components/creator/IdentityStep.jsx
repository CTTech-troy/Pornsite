import React, { useCallback, useState, useRef } from 'react'
import { FingerprintIcon, UploadIcon, XIcon, FileTextIcon } from 'lucide-react'

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]
function DropZone({
  label,
  file,
  preview,
  onFile,
  onClear,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])
  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      const droppedFile = e.dataTransfer.files?.[0]
      if (droppedFile && ACCEPTED_TYPES.includes(droppedFile.type)) {
        onFile(droppedFile)
      }
    },
    [onFile],
  )
  const handleInputChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected && ACCEPTED_TYPES.includes(selected.type)) {
      onFile(selected)
    }
  }
  if (file) {
    const isPdf = file.type === 'application/pdf'
    return (
      <div className="relative rounded-xl border-2 border-[#008751]/30 bg-[#f0fdf6] p-3 overflow-hidden">
        <div className="flex items-center gap-3">
          {isPdf ? (
            <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
              <FileTextIcon className="w-7 h-7 text-[#008751]" />
            </div>
          ) : (
            <img
              src={preview}
              alt={label}
              className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button
            onClick={onClear}
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors shrink-0"
            aria-label={`Remove ${label}`}
          >
            <XIcon className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    )
  }
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 p-6 text-center ${isDragging ? 'drag-active border-[#008751] bg-[#008751]/5' : 'border-gray-300 hover:border-[#008751]/50 hover:bg-gray-50'}`}
      role="button"
      tabIndex={0}
      aria-label={`Upload ${label}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />
      <UploadIcon
        className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-[#008751]' : 'text-gray-400'}`}
      />
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-400 mt-1">
        {isDragging ? 'Drop your file here' : 'Drag & drop or click to browse'}
      </p>
      <p className="text-[11px] text-gray-400 mt-1">JPG, PNG, PDF — max 5MB</p>
    </div>
  )
}
export function IdentityStep({
  data,
  updateData,
  onNext,
  onBack,
}) {
  const [errors, setErrors] = useState({})
  const handleFile = (side, file) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (side === 'front') {
        updateData({
          idFrontFile: file,
          idFrontPreview: reader.result,
        })
      } else {
        updateData({
          idBackFile: file,
          idBackPreview: reader.result, 
        })
      }
    }
    reader.readAsDataURL(file)
  }
  const validate = () => {
    const newErrors  = {}
    if (!data.idType) newErrors.idType = 'Select an ID type'
    if (!data.idNumber.trim()) newErrors.idNumber = 'ID number is required'
    if (!data.idFrontFile) newErrors.idFront = 'Upload the front of your ID'
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
          <FingerprintIcon className="w-5 h-5 text-[#008751]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Identity Verification
          </h2>
          <p className="text-sm text-gray-500">
            Upload a valid government-issued ID
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ID Type *
            </label>
            <select
              value={data.idType}
              onChange={(e) =>
                updateData({
                  idType: e.target.value,
                })
              }
              className={inputClass('idType')}
            >
              <option value="">Select ID type</option>
              <option value="nin">National ID (NIN)</option>
              <option value="voters-card">Voter's Card</option>
              <option value="drivers-license">Driver's License</option>
              <option value="passport">International Passport</option>
            </select>
            {errors.idType && (
              <p className="text-xs text-red-500 mt-1">{errors.idType}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ID Number *
            </label>
            <input
              type="text"
              value={data.idNumber}
              onChange={(e) =>
                updateData({
                  idNumber: e.target.value,
                })
              }
              placeholder="Enter your ID number"
              className={inputClass('idNumber')}
            />
            {errors.idNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.idNumber}</p>
            )}
          </div>
        </div>

        <div className="pt-2 pb-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Upload Documents
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Front of ID *
            </p>
            <DropZone
              label="Front of ID"
              file={data.idFrontFile}
              preview={data.idFrontPreview}
              onFile={(f) => handleFile('front', f)}
              onClear={() =>
                updateData({
                  idFrontFile: null,
                  idFrontPreview: '',
                })
              }
            />
            {errors.idFront && (
              <p className="text-xs text-red-500 mt-1">{errors.idFront}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Back of ID <span className="text-gray-400">(optional)</span>
            </p>
            <DropZone
              label="Back of ID"
              file={data.idBackFile}
              preview={data.idBackPreview}
              onFile={(f) => handleFile('back', f)}
              onClear={() =>
                updateData({
                  idBackFile: null,
                  idBackPreview: '',
                })
              }
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



export default IdentityStep