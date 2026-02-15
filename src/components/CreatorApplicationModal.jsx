import React from 'react'
import PlatformBackground from './PlatformBackground'
import CreatorApplicationModal from './creator/CreatorApplicationModal'

export default function CreatorApplicationModalWrapper({ isOpen, onClose, onApply }) {
  if (!isOpen) return null
  return (
    <div className="relative min-h-screen w-full">
      <PlatformBackground />
      <CreatorApplicationModal isOpen={isOpen} onClose={onClose} onApply={onApply} />
    </div>
  )
}
