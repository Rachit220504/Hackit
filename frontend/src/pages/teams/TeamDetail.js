import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { teamAPI } from '../../services/api';
import AuthContext from '../../context/AuthContext';
import InviteMember from '../../components/teams/InviteMember';
import InvitationsList from '../../components/teams/InvitationsList';
import TeamAnalytics from '../../components/teams/TeamAnalytics';

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitationRefresh, setInvitationRefresh] = useState(0);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const fetchTeam = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchTeam();
  }, [id, fetchTeam]);

  const refreshInvitations = () => {
    setInvitationRefresh(prev => prev + 1);
  };

  const handleJoinTeam = async () => {
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

  const handleLeaveTeam = async () => {
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

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }
    
    try {
      await teamAPI.removeMember(id, memberId);
      fetchTeam();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove team member');
    }
  };

  const handleDeleteTeam = async () => {
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

  const isTeamLeader = () => {
    if (!team || !user) return false;
    return team.leader._id === user._id;
  };

  const isTeamMember = () => {
    if (!team || !user) return false;
    return team.members.some(member => member._id === user._id);
  };

  const canJoinTeam = () => {
    if (!user || !team) return false;
    return !isTeamMember() && team.members.length < team.maxMembers;
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
            <div>
              <h1 className="text-3xl font-bold">{team.name}</h1>
              <p className="text-gray-600 mt-2">
                {team.members.length} / {team.maxMembers} members
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              {isTeamLeader() && (
                <>
                  <Link 
                    to={`/teams/${id}/edit`} 
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Edit Team
                  </Link>
                  <button 
                    onClick={handleDeleteTeam}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                  >
                    Delete Team
                  </button>
                </>
              )}
              
              {isTeamMember() && !isTeamLeader() && (
                <button 
                  onClick={handleLeaveTeam}
                  disabled={leaving}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  {leaving ? 'Leaving...' : 'Leave Team'}
                </button>
              )}
              
              {canJoinTeam() && (
                <button 
                  onClick={handleJoinTeam}
                  disabled={joining}
                  className="bg-secondary text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  {joining ? 'Joining...' : 'Join Team'}
                </button>
              )}
            </div>
          </div>
          
          {isTeamLeader() && (
            <TeamAnalytics team={team} />
          )}
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{team.description || 'No description provided.'}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Skills Needed</h2>
              {team.skillsNeeded && team.skillsNeeded.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {team.skillsNeeded.map((skill, index) => (
                    <span 
                      key={index} 
                      className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No specific skills listed.</p>
              )}
            </div>
            
            {team.project && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Project</h2>
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="font-semibold">{team.project.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{team.project.description}</p>
                  <Link
                    to={`/projects/${team.project._id}`}
                    className="text-primary hover:underline text-sm mt-2 inline-block"
                  >
                    View Project
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Team Members Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Team Members</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-4">
                {/* Team Leader */}
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
                  <span className="ml-auto px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">Leader</span>
                </div>
                
                {/* Other Members */}
                {team.members
                  .filter(member => member._id !== team.leader._id)
                  .map((member) => (
                    <div key={member._id} className="flex items-center">
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
                      {isTeamLeader() && (
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="ml-auto text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
          
          {/* Team Invitations Section (Only visible to team leader) */}
          {isTeamLeader() && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Invitations</h2>
              
              <InviteMember 
                teamId={id} 
                onInviteSent={refreshInvitations} 
                invitations={team.invitations}
              />
              
              <InvitationsList 
                teamId={id} 
                refreshTrigger={invitationRefresh}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;
