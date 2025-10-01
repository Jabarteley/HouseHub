import React, { useState } from 'react';
import Icon from '../../../../components/AppIcon';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

const ScheduleShowingForm = ({ property, onClose, onShowingScheduled }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ scheduled_date: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('property_showings').insert([
        {
          property_id: property.id,
          student_id: user.id,
          agent_id: property.agent_id, // Assuming property has agent_id
          scheduled_date: formData.scheduled_date,
          notes: formData.notes,
          status: 'scheduled',
        },
      ]);

      if (error) throw error;

      onShowingScheduled();
      onClose();
    } catch (error) {
      console.error('Error scheduling showing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">Schedule Showing</h2>
          <p className="text-sm text-text-secondary">For: {property.title}</p>
        </div>
        <form id="schedule-showing-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Preferred Date & Time</label>
            <input 
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              className="w-full p-2 border rounded bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Notes (optional)</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              placeholder="Any specific questions or requests?"
              className="w-full p-2 border rounded bg-background"
            />
          </div>
        </form>
        <div className="p-6 border-t border-border flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded text-text-secondary">Cancel</button>
          <button type="submit" form="schedule-showing-form" disabled={isSubmitting} className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50">
            {isSubmitting ? 'Submitting...' : 'Request Showing'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleShowingForm;
