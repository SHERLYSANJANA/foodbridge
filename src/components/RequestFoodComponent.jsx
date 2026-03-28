import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function RequestFoodComponent() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    quantity_needed: '',
    location: '',
    urgency: 'medium'
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    const { error: insertError } = await supabase
      .from('requests')
      .insert([
        {
          quantity_needed: parseInt(formData.quantity_needed) || 0,
          location: formData.location.toLowerCase().trim(),
          urgency: formData.urgency
        }
      ]);

    setLoading(false);
    if (insertError) {
      console.error(insertError);
      setError('Failed to request food: ' + insertError.message);
    } else {
      setSuccess('Food request submitted successfully!');
      setFormData({
        quantity_needed: '',
        location: '',
        urgency: 'medium'
      });
    }
  };

  return (
    <div>
      <h1 className="page-title">Request Surplus Food</h1>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {success && <div className="badge" style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#3B82F6', padding: '1rem', width: '100%', marginBottom: '1rem', display: 'flex', gap: '8px' }}><CheckCircle size={18}/> {success}</div>}
        {error && <div className="badge" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#EF4444', padding: '1rem', width: '100%', marginBottom: '1rem', display: 'flex', gap: '8px' }}><AlertCircle size={18}/> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Quantity Needed (meals/servings)</label>
            <input required type="number" min="1" name="quantity_needed" className="form-input" placeholder="e.g. 50" value={formData.quantity_needed} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Location (e.g. Downtown, ZIP, or City)</label>
            <input required type="text" name="location" className="form-input" placeholder="e.g. New York City" value={formData.location} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Urgency</label>
            <select name="urgency" className="form-select" value={formData.urgency} onChange={handleChange}>
              <option value="low">Low (within next day)</option>
              <option value="medium">Medium (within 6-12 hours)</option>
              <option value="high">High (Immediate, next 1-2 hours)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
