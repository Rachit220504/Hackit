import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const JudgeManagement = () => {
  const [judges, setJudges] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [expertise, setExpertise] = useState('');
  const [creatingJudge, setCreatingJudge] = useState(false);

  useEffect(() => {
    fetchJudges();
    fetchUsers();
  }, []);

  const fetchJudges = async () => {
    try {
      setLoading(true);
      const res = await api.get('/judging/judges');
      setJudges(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch judges');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      // Filter out users who are already judges
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleCreateJudge = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }
    
    try {
      setCreatingJudge(true);
      
      // Convert expertise string to array
      const expertiseArray = expertise
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
      
      await api.post('/judging/judges', {
        userId: selectedUser,
        expertise: expertiseArray,
      });
      
      setSelectedUser('');
      setExpertise('');
      fetchJudges();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create judge');
    } finally {
      setCreatingJudge(false);
    }
  };

  const getNonJudgeUsers = () => {
    // Create a set of user IDs who are already judges
    const judgeUserIds = new Set(judges.map(judge => judge.user._id));
    
    // Filter users who are not already judges
    return users.filter(user => !judgeUserIds.has(user._id));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Judge Management</h1>
        <Link to="/dashboard" className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700">
          Back to Dashboard
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Add Judge Form */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add Judge</h2>
          <form onSubmit={handleCreateJudge}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user">
                Select User
              </label>
              <select
                id="user"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">-- Select User --</option>
                {getNonJudgeUsers().map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expertise">
                Expertise (comma separated)
              </label>
              <input
                type="text"
                id="expertise"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g. React, Node.js, UI/UX"
              />
            </div>
            
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              disabled={creatingJudge}
            >
              {creatingJudge ? 'Adding...' : 'Add as Judge'}
            </button>
          </form>
        </div>
        
        {/* Current Judges */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Judges</h2>
          
          {judges.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No judges found.</p>
          ) : (
            <div className="space-y-4">
              {judges.map(judge => (
                <div key={judge._id} className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                      {judge.user.avatar ? (
                        <img 
                          src={judge.user.avatar} 
                          alt={judge.user.name} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg text-gray-600">
                          {judge.user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{judge.user.name}</p>
                      <p className="text-sm text-gray-600">{judge.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Expertise:</span>{' '}
                      {judge.expertise && judge.expertise.length > 0 
                        ? judge.expertise.join(', ') 
                        : 'None specified'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Assigned Projects:</span>{' '}
                      {judge.assignedProjects.length}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Completed Evaluations:</span>{' '}
                      {judge.completedEvaluations}
                    </p>
                  </div>
                  
                  <div className="mt-3">
                    <Link
                      to={`/admin/judges/${judge._id}/assign`}
                      className="text-primary hover:text-blue-700 text-sm"
                    >
                      Assign Projects
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JudgeManagement;
