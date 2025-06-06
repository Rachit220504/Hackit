import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { teamAPI } from '../../services/api';
import TeamCard from '../../components/teams/TeamCard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user && user.role === 'admin';
  
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize the fetchMyTeams function using useCallback
  const fetchMyTeams = useCallback(async () => {
    try {
      setLoading(true);
      const res = await teamAPI.getTeams();
      
      // Filter teams where user is a member or leader
      const userTeams = res.data.filter(team => 
        team.members.some(member => member._id === user?._id) || 
        (team.leader && team.leader._id === user?._id)
      );
      
      setMyTeams(userTeams);
      setError(null);
    } catch (err) {
      setError('Failed to fetch your teams');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyTeams();
  }, [user, fetchMyTeams]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome, {user.name}!</h2>
            <p className="text-gray-600 mb-4">
              This is your personal dashboard where you can manage your hackathon activities.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {user.skills && user.skills.map((skill, index) => (
                <span key={index} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
            
            <Link 
              to="/profile" 
              className="text-primary hover:text-blue-700 text-sm font-semibold"
            >
              Edit Profile →
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                to="/teams/create" 
                className="block bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
              >
                Create a Team
              </Link>
              <Link 
                to="/teams" 
                className="block bg-secondary text-white px-4 py-2 rounded hover:bg-green-700 text-center"
              >
                Browse Teams
              </Link>
              <Link 
                to="/projects" 
                className="block bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 text-center"
              >
                View Projects
              </Link>
              
              {isAdmin && (
                <Link 
                  to="/admin/users" 
                  className="block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-center"
                >
                  Admin: Manage Users
                </Link>
              )}
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">My Teams</h2>
              <Link to="/teams" className="text-primary hover:text-blue-700 text-sm">
                View All Teams
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 text-red-700 p-3 rounded">
                {error}
              </div>
            ) : myTeams.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">You haven't joined any teams yet.</p>
                <Link 
                  to="/teams/create" 
                  className="inline-block bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Create Your First Team
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myTeams.map(team => (
                  <TeamCard key={team._id} team={team} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
