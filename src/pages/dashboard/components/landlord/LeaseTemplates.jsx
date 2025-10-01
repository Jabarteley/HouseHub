import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';

const LeaseTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    is_default: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaseTemplates();
  }, []);

  const fetchLeaseTemplates = async () => {
    try {
      setLoading(true);
      // Note: This assumes a lease_templates table exists
      // Since it's not in the original schema, we'll use a mock implementation
      // In a real implementation, you would need to create this table
      
      // For now, we'll simulate the functionality with mock data
      const mockTemplates = [
        {
          id: 1,
          title: 'Standard Residential Lease',
          description: 'Basic lease for residential properties',
          content: 'This is a standard residential lease agreement...',
          is_default: true,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Commercial Lease',
          description: 'For commercial property rentals',
          content: 'This is a commercial lease agreement...',
          is_default: false,
          created_at: new Date().toISOString()
        }
      ];
      
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error fetching lease templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (currentTemplate) {
        // Update existing template (mock implementation)
        const updatedTemplates = templates.map(t => 
          t.id === currentTemplate.id ? { ...t, ...formData } : t
        );
        setTemplates(updatedTemplates);
      } else {
        // Create new template (mock implementation)
        const newTemplate = {
          id: templates.length + 1,
          ...formData,
          created_at: new Date().toISOString()
        };
        setTemplates([...templates, newTemplate]);
      }
      
      // Reset form and close
      setFormData({ title: '', description: '', content: '', is_default: false });
      setCurrentTemplate(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving lease template:', error);
      alert('Error saving lease template');
    }
  };

  const handleEdit = (template) => {
    setCurrentTemplate(template);
    setFormData({
      title: template.title,
      description: template.description,
      content: template.content,
      is_default: template.is_default
    });
    setShowForm(true);
  };

  const handleDelete = (templateId) => {
    if (window.confirm('Are you sure you want to delete this lease template?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6 animate-pulse">
        <div className="h-6 bg-secondary-100 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-text-primary">Lease Templates</h2>
          <button 
            onClick={() => {
              setCurrentTemplate(null);
              setFormData({ title: '', description: '', content: '', is_default: false });
              setShowForm(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-dark transition-colors"
          >
            Add Template
          </button>
        </div>
      </div>
      <div className="p-6">
        {templates.length > 0 ? (
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="border border-border rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between">
                  <div className="flex-1 mb-3 md:mb-0">
                    <div className="flex items-center mb-1">
                      <h3 className="font-medium text-text-primary mr-2">{template.title}</h3>
                      {template.is_default && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{template.description}</p>
                    <p className="text-xs text-text-tertiary">Created: {formatDate(template.created_at)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(template)}
                      className="px-3 py-1 bg-secondary-100 text-text-secondary rounded-md text-sm hover:bg-secondary-200"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(template.id)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="FileText" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No lease templates yet</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-text-primary">
                {currentTemplate ? 'Edit Lease Template' : 'Create Lease Template'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow">
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-border rounded-md bg-background text-text-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-border rounded-md bg-background text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Template Content</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows="8"
                    className="w-full p-2 border border-border rounded-md bg-background text-text-primary"
                    placeholder="Enter lease template content here..."
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_default"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label htmlFor="is_default" className="text-sm text-text-secondary">Set as default template</label>
                </div>
              </div>
              <div className="p-6 border-t border-border flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false);
                    setCurrentTemplate(null);
                    setFormData({ title: '', description: '', content: '', is_default: false });
                  }}
                  className="px-4 py-2 rounded text-text-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded bg-primary text-white"
                >
                  {currentTemplate ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaseTemplates;