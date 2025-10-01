import React from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';

const RecentInquiries = ({ inquiries }) => {
  const { user } = useAuth();

  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      // Update the inquiry status in the database
      const response = await fetch('/api/update-inquiry-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId, newStatus, userId: user.id })
      });
      
      if (response.ok) {
        // In a real implementation, you would refetch the inquiries
        console.log(`Inquiry ${inquiryId} status updated to ${newStatus}`);
      } else {
        console.error('Failed to update inquiry status');
      }
    } catch (error) {
      console.error('Error updating inquiry status:', error);
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Inquiries</h2>
      </div>
      <div className="p-6">
        {inquiries.length > 0 ? (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <p className="text-sm font-medium text-text-primary mr-2">{inquiry.user_profiles?.full_name || 'Unknown User'}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        inquiry.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-1">{inquiry.properties?.title}</p>
                    <p className="text-xs text-text-tertiary mb-2">Inquired on {new Date(inquiry.created_at).toLocaleDateString()}</p>
                    {inquiry.message && (
                      <p className="text-sm text-text-secondary italic">"{inquiry.message}"</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <select
                      value={inquiry.status}
                      onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                      className="text-xs border border-border rounded px-2 py-1 bg-background"
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="MessageSquare" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No inquiries yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentInquiries;
