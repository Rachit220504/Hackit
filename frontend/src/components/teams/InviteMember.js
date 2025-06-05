import React, { useState } from 'react';
import { teamAPI } from '../../services/api';

const InviteMember = ({ teamId, onInviteSent, invitations = [] }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(false);
    
    // Validate email
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Check if this email is already invited
    const alreadyInvited = invitations.some(
      inv => inv.email === email && inv.status === 'pending'
    );
    
    if (alreadyInvited) {
      setError('This email has already been invited');
      return;
    }
    
    setLoading(true);
    
    try {
      await teamAPI.inviteToTeam(teamId, email);
      setSuccess(true);
      setEmail('');
      
      // Callback to refresh invitations list
      if (onInviteSent) {
        onInviteSent();
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3">Invite Team Member</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-3 text-sm">
          Invitation sent successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="flex-grow shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Invite'}
        </button>
      </form>
    </div>
  );
};

export default InviteMember;
