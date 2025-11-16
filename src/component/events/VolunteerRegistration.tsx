"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/lib/toast'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'

interface VolunteerRegistrationProps {
  postId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  requiredVolunteers: number
  onClose: () => void
}

export default function VolunteerRegistration({
  postId,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  requiredVolunteers,
  onClose
}: VolunteerRegistrationProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    experience: '',
    motivation: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get user ID from session storage
      const userId = sessionStorage.getItem('userId')
      
      if (!userId) {
        toast.error('Please login to register as a volunteer')
        router.push('/login')
        return
      }

      // Mock API call - in production, replace with actual API endpoint
      // const response = await fetch('http://localhost:5000/api/volunteer/register', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     userId,
      //     postId,
      //     ...formData
      //   }),
      // })

      // For demo purposes, simulate successful registration
      setTimeout(() => {
        toast.success('Successfully registered as a volunteer!')
        onClose()
        setLoading(false)
      }, 1500)
      
    } catch (error) {
      console.error('Error registering as volunteer:', error)
      toast.error('Failed to register. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Volunteer Registration</h2>
          <p className="text-sm text-gray-500 mb-4">Register as a volunteer for this event</p>
          
          {/* Event Details */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-gray-900 mb-2">{eventTitle}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span>{eventDate}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <span>{eventTime}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span>{eventLocation}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                <span>{requiredVolunteers} volunteers needed</span>
              </div>
            </div>
          </div>
          
          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
              />
            </div>
            
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                Relevant Skills
              </label>
              <Input
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="List your relevant skills"
              />
            </div>
            
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Previous Volunteer Experience
              </label>
              <Textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="Describe your previous volunteer experience"
                rows={3}
              />
            </div>
            
            <div>
              <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-1">
                Motivation to Join
              </label>
              <Textarea
                id="motivation"
                name="motivation"
                value={formData.motivation}
                onChange={handleChange}
                placeholder="Why do you want to volunteer for this event?"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register as Volunteer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}