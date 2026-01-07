import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Input from '../shared/Input'
import TextArea from '../shared/TextArea'
import Select from '../shared/Select'
import Button from '../shared/Button'

function TicketForm() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    event_summary: '',
    urgency_level: 'Low'
  })

  const urgencyOptions = [
    { value: 'Low', label: t('ticketForm.urgencyLow') },
    { value: 'Medium', label: t('ticketForm.urgencyMedium') },
    { value: 'Court Date Soon', label: t('ticketForm.urgencyHigh') }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // TODO: API call will go here
      console.log('Form data:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSubmitted(true)
      setFormData({
        client_name: '',
        client_email: '',
        client_phone: '',
        event_summary: '',
        urgency_level: 'Low'
      })
      
      setTimeout(() => setSubmitted(false), 3000)
    } catch (error) {
      alert(t('ticketForm.error'))
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">✓</div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">
          {t('ticketForm.success')}
        </h3>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        {t('ticketForm.title')}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <Input
          label={t('ticketForm.name')}
          placeholder={t('ticketForm.namePlaceholder')}
          value={formData.client_name}
          onChange={(e) => setFormData({...formData, client_name: e.target.value})}
          required
        />
        
        <Input
          type="email"
          label={t('ticketForm.email')}
          placeholder={t('ticketForm.emailPlaceholder')}
          value={formData.client_email}
          onChange={(e) => setFormData({...formData, client_email: e.target.value})}
          required
        />
        
        <Input
          type="tel"
          label={t('ticketForm.phone')}
          placeholder={t('ticketForm.phonePlaceholder')}
          value={formData.client_phone}
          onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
          required
        />
        
        <TextArea
          label={t('ticketForm.summary')}
          placeholder={t('ticketForm.summaryPlaceholder')}
          value={formData.event_summary}
          onChange={(e) => setFormData({...formData, event_summary: e.target.value})}
          rows={6}
          required
        />
        
        <Select
          label={t('ticketForm.urgency')}
          options={urgencyOptions}
          value={formData.urgency_level}
          onChange={(e) => setFormData({...formData, urgency_level: e.target.value})}
          required
        />
        
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full"
        >
          {loading ? t('ticketForm.submitting') : t('ticketForm.submit')}
        </Button>
      </form>
    </div>
  )
}

export default TicketForm
