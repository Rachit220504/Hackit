import React, { useState, useEffect } from 'react';
import { teamAPI } from '../../services/api';

const InvitationsList = ({ teamId, refreshTrigger }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvitations();
  }, [teamId, refreshTrigger]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await teamAPI.getTeamInvitations(teamId);
      setInvitations(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvitation = async (email) => {
    if (!window.confirm(`Are you sure you want to cancel the invitation to ${email}?`)) {
      return;
    }
    
    try {
      await teamAPI.cancelInvitation(teamId, email);
      fetchInvitations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel invitation');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-3 rounded">
        {error}
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No pending invitations.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Pending Invitations</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invitations
              .filter(inv => inv.status === 'pending')
              .map((invitation, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{invitation.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(invitation.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleCancelInvitation(invitation.email)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvitationsList;
