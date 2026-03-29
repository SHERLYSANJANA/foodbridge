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

    try {
      // Validate inputs safely
      const locationVal = formData.location ? formData.location.toLowerCase().trim() : 'unspecified';
      const quantityVal = parseInt(formData.quantity) || 1;
      
      let expiryTimeISO = null;
      if (formData.expiry_time) {
        const d = new Date(formData.expiry_time);
        if (!isNaN(d.getTime())) {
          expiryTimeISO = d.toISOString();
        } else {
          throw new Error("Invalid expiry time provided.");
        }
      }

      const { data, error: insertError } = await supabase
        .from('donations')
        .insert([
          {
            food_name: formData.food_name,
            quantity: quantityVal,
            location: locationVal,
            expiry_time: expiryTimeISO,
            food_type: formData.food_type
          }
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      setSuccess(`Donation added successfully (ID: ${data[0]?.id})`);
      setFormData({
        food_name: '',
        quantity: '',
        location: '',
        expiry_time: '',
        food_type: 'veg'
      });
    } catch (err) {
      console.error("Submission Error:", err);
      setError(err.message || 'An unexpected error occurred while adding food.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in stagger-1">
      <h1 className="page-title">Donate Surplus Food</h1>
      <div className="card animate-fade-in stagger-2" style={{ maxWidth: '600px' }}>
        {success && <div className="badge badge-ghost" style={{ padding: '1.25rem', width: '100%', marginBottom: '1.5rem', display: 'flex', gap: '10px' }}><CheckCircle size={18}/> {success}</div>}
        {error && <div className="badge badge-outline" style={{ padding: '1.25rem', width: '100%', marginBottom: '1.5rem', display: 'flex', gap: '10px' }}><AlertCircle size={18}/> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group animate-fade-in stagger-1">
            <label className="form-label">Food Description</label>
            <input required type="text" name="food_name" className="form-input" placeholder="e.g. 5 boxes of pasta" value={formData.food_name} onChange={handleChange} />
          </div>

          <div className="form-group animate-fade-in stagger-2">
            <label className="form-label">Quantity</label>
            <input required type="number" min="1" name="quantity" className="form-input" placeholder="e.g. 20 (meals)" value={formData.quantity} onChange={handleChange} />
          </div>

          <div className="form-group animate-fade-in stagger-3">
            <label className="form-label">Location</label>
            <input required type="text" name="location" className="form-input" placeholder="e.g. Downtown" value={formData.location} onChange={handleChange} />
          </div>

          <div className="form-group animate-fade-in stagger-4">
            <label className="form-label">Expiry Time</label>
            <input required type="datetime-local" name="expiry_time" className="form-input" value={formData.expiry_time} onChange={handleChange} />
          </div>

          <div className="form-group animate-fade-in stagger-5">
            <label className="form-label">Food Type</label>
            <select name="food_type" className="form-select" value={formData.food_type} onChange={handleChange}>
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
            {loading ? 'Processing...' : 'Add Food Donation'}
          </button>
        </form>
      </div>
    </div>
  );
}
