import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function AddFoodComponent() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    food_name: '',
    quantity: '',
    location: '',
    expiry_time: '',
    food_type: 'veg'
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
      .from('donations')
      .insert([
        {
          food_name: formData.food_name,
          quantity: parseInt(formData.quantity) || 0,
          location: formData.location.toLowerCase().trim(),
          expiry_time: new Date(formData.expiry_time).toISOString(),
          food_type: formData.food_type
        }
      ]);

    setLoading(false);
    if (insertError) {
      console.error(insertError);
      setError('Failed to add food: ' + insertError.message);
    } else {
      setSuccess('Food donation added successfully!');
      setFormData({
        food_name: '',
        quantity: '',
        location: '',
        expiry_time: '',
        food_type: 'veg'
      });
    }
  };

  return (
    <div>
      <h1 className="page-title">Donate Surplus Food</h1>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {success && <div className="badge" style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: '#10B981', padding: '1rem', width: '100%', marginBottom: '1rem', display: 'flex', gap: '8px' }}><CheckCircle size={18}/> {success}</div>}
        {error && <div className="badge" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#EF4444', padding: '1rem', width: '100%', marginBottom: '1rem', display: 'flex', gap: '8px' }}><AlertCircle size={18}/> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Food Description/Name</label>
            <input required type="text" name="food_name" className="form-input" placeholder="e.g. 5 boxes of pasta" value={formData.food_name} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Quantity (approx. meals/servings)</label>
            <input required type="number" min="1" name="quantity" className="form-input" placeholder="e.g. 20" value={formData.quantity} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Location (e.g. Downtown, ZIP, or City)</label>
            <input required type="text" name="location" className="form-input" placeholder="e.g. New York City" value={formData.location} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Expiry Time</label>
            <input required type="datetime-local" name="expiry_time" className="form-input" value={formData.expiry_time} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Food Type</label>
            <select name="food_type" className="form-select" value={formData.food_type} onChange={handleChange}>
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Food Donation'}
          </button>
        </form>
      </div>
    </div>
  );
}
