import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function RequestFoodComponent() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    food_name: '',
    quantity: '',
    urgency: 'medium',
    location: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          food_name: formData.food_name.trim(),
          quantity: parseInt(formData.quantity) || 0,
          urgency: formData.urgency,
          location: formData.location.trim()
        }
      ]);

    setLoading(false);
    if (insertError) {
      console.error(insertError);
      setError('Failed to request food: ' + insertError.message);
    } else {
      setSuccess('Food request submitted successfully!');
      setFormData({
        food_name: '',
        quantity: '',
        urgency: 'medium',
        location: ''
      });
    }
  };

  return (
    <div className="animate-fade-in stagger-1">
      <h1 className="page-title">Request Surplus Food</h1>
      <div className="card animate-fade-in stagger-2" style={{ maxWidth: '600px' }}>
        {success && <div className="badge badge-ghost" style={{ padding: '1.25rem', width: '100%', marginBottom: '1.5rem', display: 'flex', gap: '10px' }}><CheckCircle size={18} /> {success}</div>}
        {error && <div className="badge badge-outline" style={{ padding: '1.25rem', width: '100%', marginBottom: '1.5rem', display: 'flex', gap: '10px' }}><AlertCircle size={18} /> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group animate-fade-in stagger-1">
            <label className="form-label">Food Request Description</label>
            <input required type="text" name="food_name" className="form-input" placeholder="e.g. Bread, Pasta, etc." value={formData.food_name} onChange={handleChange} />
          </div>

          <div className="form-group animate-fade-in stagger-2">
            <label className="form-label">Target Quantity</label>
            <input required type="number" min="1" name="quantity" className="form-input" placeholder="e.g. 50 (meals)" value={formData.quantity} onChange={handleChange} />
          </div>

          <div className="form-group animate-fade-in stagger-3">
            <label className="form-label">Location Identifier</label>
            <input required type="text" name="location" className="form-input" placeholder="e.g. ZIP code or City" value={formData.location} onChange={handleChange} />
          </div>

          <div className="form-group animate-fade-in stagger-4">
            <label className="form-label">Urgency Level</label>
            <select name="urgency" className="form-select" value={formData.urgency} onChange={handleChange}>
              <option value="low">Low (Standard)</option>
              <option value="medium">Medium (Moderate Need)</option>
              <option value="high">High (Immediate)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary mt-4" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
