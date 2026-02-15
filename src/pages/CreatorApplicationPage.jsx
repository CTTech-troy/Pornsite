import React from 'react'
import CreatorApplicationModal from '../components/creator/CreatorApplicationModal'

export default function CreatorApplicationPage({ onClose = () => {}, onApply = () => {} }) {
  return (
    <div className="min-h-screen bg-[#F0F2F5] p-6">
      <div className="max-w-5xl mx-auto">
        <CreatorApplicationModal isOpen={true} onClose={onClose} onApply={onApply} />
      </div>
    </div>
  )
}
