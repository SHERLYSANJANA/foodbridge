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
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error: insertError } = await supabase
      .from('donations')
      .insert([
        {
          donor_id: session?.user?.id,
          food_name: formData.food_name,
          quantity: parseInt(formData.quantity) || 0,
          location: formData.location.toLowerCase().trim(),
          expiry_time: formData.expiry_time ? new Date(formData.expiry_time).toISOString() : null,
          food_type: formData.food_type
        }
      ]).select('*');

      if (insertError) throw insertError;
      const newDonationId = data?.[0]?.id;

      let fileUrl = null;
      if (imageFile && newDonationId) {
        setLoading(true);
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${newDonationId}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('food-images')
          .upload(fileName, imageFile);

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from('food-images')
            .getPublicUrl(fileName);
          fileUrl = publicData?.publicUrl;

          await supabase.from('donations')
            .update({ image_url: fileUrl })
            .eq('id', newDonationId);
        }
      }
      
      setSuccess('Food donation added successfully!');
      setFormData({
        food_name: '',
        quantity: '',
        location: '',
        expiry_time: '',
        food_type: 'veg'
      });
      setImageFile(null);
      document.getElementById('food-image-upload').value = '';
    } catch (err) {
      console.error(err);
      setError('Failed to add food: ' + err.message);
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
            <label className="form-label">Expiry Date (Optional)</label>
            <input type="date" name="expiry_time" className="form-input" value={formData.expiry_time} onChange={handleChange} />
          </div>

          <div className="form-group animate-fade-in stagger-5">
            <label className="form-label">Food Type</label>
            <select name="food_type" className="form-select" value={formData.food_type} onChange={handleChange}>
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
            </select>
          </div>

          <div className="form-group animate-fade-in stagger-5">
            <label className="form-label">Upload Picture (Optional)</label>
            <input id="food-image-upload" type="file" accept="image/*" className="form-input" onChange={(e) => setImageFile(e.target.files?.[0])} />
          </div>

          <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
            {loading ? 'Processing...' : 'Add Food Donation'}
          </button>
        </form>
      </div>
    </div>
  );
}
