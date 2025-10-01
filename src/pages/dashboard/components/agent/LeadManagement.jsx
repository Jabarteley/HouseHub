import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

const LeadManagement = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState({
    new: { title: 'New', color: 'secondary', leads: [] },
    contacted: { title: 'Contacted', color: 'primary', leads: [] },
    showing: { title: 'Showing Scheduled', color: 'warning', leads: [] },
    closed: { title: 'Closed', color: 'success', leads: [] },
  });

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_inquiries')
        .select(`
          id, status, message,
          property:properties!inner(id, title, agent_id),
          client:user_profiles!student_id(full_name)
        `)
        .eq('properties.agent_id', user.id);

      if (error) throw error;

      // Distribute leads into columns
      const newColumns = { ...columns };
      Object.keys(newColumns).forEach(key => newColumns[key].leads = []); // Reset leads

      data.forEach(lead => {
        const status = lead.status || 'new';
        if (newColumns[status]) {
          newColumns[status].leads.push(lead);
        }
      });

      setColumns(newColumns);
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, leadId, sourceColumnId) => {
    e.dataTransfer.setData('leadId', leadId);
    e.dataTransfer.setData('sourceColumnId', sourceColumnId);
  };

  const handleDrop = async (e, targetColumnId) => {
    const leadId = e.dataTransfer.getData('leadId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');

    if (leadId && sourceColumnId !== targetColumnId) {
      // Update UI optimistically
      const leadToMove = columns[sourceColumnId].leads.find(l => l.id.toString() === leadId);
      const newSourceLeads = columns[sourceColumnId].leads.filter(l => l.id.toString() !== leadId);
      const newTargetLeads = [...columns[targetColumnId].leads, { ...leadToMove, status: targetColumnId }];

      setColumns(prev => ({
        ...prev,
        [sourceColumnId]: { ...prev[sourceColumnId], leads: newSourceLeads },
        [targetColumnId]: { ...prev[targetColumnId], leads: newTargetLeads },
      }));

      // Update backend
      const { error } = await supabase
        .from('property_inquiries')
        .update({ status: targetColumnId })
        .eq('id', leadId);

      if (error) {
        console.error('Error updating lead status:', error);
        // Revert UI on failure
        fetchLeads(); 
      }
    }
  };

  const getColumnColor = (color) => {
    const colorMap = {
      secondary: 'border-secondary-300 bg-secondary-100',
      primary: 'border-primary-300 bg-primary-100',
      warning: 'border-warning-300 bg-warning-100',
      success: 'border-success-300 bg-success-100'
    };
    return colorMap[color] || colorMap.secondary;
  };

  if (loading) {
    return <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6 h-96 animate-pulse"></div>;
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary font-heading">Lead Pipeline</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {Object.entries(columns).map(([key, column]) => (
            <div
              key={key}
              className={`rounded-lg border-2 border-dashed p-4 min-h-[200px] transition-colors duration-200 ${getColumnColor(column.color)}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, key)}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-text-primary">{column.title}</h4>
                <span className="text-xs bg-surface px-2 py-1 rounded-md text-text-secondary">{column.leads.length}</span>
              </div>
              <div className="space-y-2">
                {column.leads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id, key)}
                    className="bg-surface p-3 rounded-md shadow-elevation-1 cursor-move hover:shadow-elevation-2 border border-border"
                  >
                    <h5 className="font-medium text-text-primary text-sm">{lead.client.full_name}</h5>
                    <p className="text-xs text-text-secondary">{lead.property.title}</p>
                  </div>
                ))}
                {column.leads.length === 0 && (
                  <div className="text-center py-8 text-text-secondary text-sm">Drop leads here</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadManagement;
