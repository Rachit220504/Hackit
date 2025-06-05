import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { teamAPI } from '../../services/api';
import AuthContext from '../../context/AuthContext';

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, [id]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await teamAPI.getTeam(id);
      setTeam(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch team details');
    } finally {
      setLoading(false);
    }
  };

  const isTeamMember = () => {
    if (!team || !user) return false;
    return team.members.some(member => member._id === user._id);
  };

  const isTeamLeader = () => {
    if (!team || !user) return false;
    return team.leader._id === user._id;
  };

  const joinTeam = async () => {
    try {
      setJoining(true);
      await teamAPI.joinTeam(id);
      fetchTeam();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join team');
    } finally {
      setJoining(false);
    }
  };

  const leaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) {
      return;
    }
    
    try {
      setLeaving(true);
      await teamAPI.leaveTeam(id);
      fetchTeam();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave team');
    } finally {
      setLeaving(false);
    }
  };

  const deleteTeam = async () => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }
    
    try {
      await teamAPI.deleteTeam(id);
      navigate('/teams');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete team');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <div className="mt-4">
          <Link to="/teams" className="text-primary hover:underline">
            &larr; Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Team not found.</p>
          <Link to="/teams" className="text-primary hover:underline mt-4 inline-block">
            &larr; Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/teams" className="text-primary hover:underline">
          &larr; Back to Teams
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h1 className="text-3xl font-bold">{team.name}</h1>
            
            {isTeamLeader() ? (
              <div className="flex space-x-3 mt-4 md:mt-0">
                <Link 
                  to={`/teams/${id}/edit`} 
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Edit Team
                </Link>
                <button 
                  onClick={deleteTeam}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  Delete Team
                </button>
              </div>
            ) : isTeamMember() ? (
              <button 
                onClick={leaveTeam}
                disabled={leaving}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition mt-4 md:mt-0"
              >
                {leaving ? 'Leaving...' : 'Leave Team'}
              </button>
            ) : (
              <button 
                onClick={joinTeam}
                disabled={joining}
                className="bg-secondary text-white px-4 py-2 rounded hover:bg-green-700 transition mt-4 md:mt-0"
              >
                {joining ? 'Joining...' : 'Join Team'}
              </button>
            )}
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{team.description || 'No description provided.'}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Team Leader</h2>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                {team.leader.avatar ? (
                  <img 
                    src={team.leader.avatar} 
                    alt={team.leader.name} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg text-gray-600">
                    {team.leader.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold">{team.leader.name}</p>
                <p className="text-sm text-gray-600">{team.leader.email}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Team Members ({team.members.length})</h2>
            {team.members.length === 0 ? (
              <p className="text-gray-600">No members yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {team.members.map((member) => (
                  <div key={member._id} className="flex items-center p-3 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                      {member.avatar ? (
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg text-gray-600">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                    {isTeamLeader() && member._id !== team.leader._id && (
                      <button 
                        onClick={() => removeMember(member._id)}
                        className="ml-auto text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {team.project && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Project</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">{team.project.title}</h3>
                <p className="text-gray-700 mt-2">{team.project.description}</p>
                <div className="mt-4">
                  <Link 
                    to={`/projects/${team.project._id}`}
                    className="text-primary hover:underline"
                  >
                    View Project Details →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;
