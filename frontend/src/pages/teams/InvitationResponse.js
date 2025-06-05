import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { teamAPI } from '../../services/api';
import AuthContext from '../../context/AuthContext';

const InvitationResponse = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseStatus, setResponseStatus] = useState(null);
  
  useEffect(() => {
    if (token) {
      fetchInvitationDetails();
    }
  }, [token]);
  
  const fetchInvitationDetails = async () => {
    try {
      setLoading(true);
      const res = await teamAPI.verifyInvitation(token);
      setInvitation(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired invitation');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAccept = async () => {
    try {
      setResponseStatus('accepting');
      await teamAPI.acceptInvitation(token);
      setResponseStatus('accepted');
      
      // Redirect to team page after 2 seconds
      setTimeout(() => {
        navigate(`/teams/${invitation.teamId}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation');
      setResponseStatus(null);
    }
  };
  
  const handleDecline = async () => {
    try {
      setResponseStatus('declining');
      await teamAPI.declineInvitation(token);
      setResponseStatus('declined');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline invitation');
      setResponseStatus(null);
    }
  };
  
  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-center">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <div className="flex justify-center">
            <Link to="/dashboard" className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!invitation) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-gray-600 text-center">No invitation found.</p>
        </div>
      </div>
    );
  }
  
  // Check if logged in user's email matches invitation email
  if (user && user.email !== invitation.inviteeEmail) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-yellow-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-center">Wrong Account</h1>
          <p className="text-gray-600 mb-2 text-center">
            This invitation was sent to <strong>{invitation.inviteeEmail}</strong>, but you're logged in with a different email address.
          </p>
          <p className="text-gray-600 mb-6 text-center">
            Please log out and sign in with the correct account.
          </p>
          <div className="flex justify-center">
            <Link to="/login" className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (responseStatus === 'accepted') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-green-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-center">Invitation Accepted!</h1>
          <p className="text-gray-600 mb-6 text-center">
            You have successfully joined the team. Redirecting to team page...
          </p>
        </div>
      </div>
    );
  }
  
  if (responseStatus === 'declined') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-center">Invitation Declined</h1>
          <p className="text-gray-600 mb-6 text-center">
            You have declined the invitation. Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Team Invitation</h1>
        
        <div className="mb-6 text-center">
          <p className="text-gray-600 mb-1">You've been invited by</p>
          <p className="font-semibold text-lg">{invitation.leaderName}</p>
          <p className="text-gray-600 mb-1 mt-4">to join the team</p>
          <p className="font-semibold text-lg text-primary">{invitation.teamName}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button
            onClick={handleAccept}
            disabled={responseStatus === 'accepting' || responseStatus === 'declining'}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            {responseStatus === 'accepting' ? 'Accepting...' : 'Accept Invitation'}
          </button>
          <button
            onClick={handleDecline}
            disabled={responseStatus === 'accepting' || responseStatus === 'declining'}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
          >
            {responseStatus === 'declining' ? 'Declining...' : 'Decline Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitationResponse;
