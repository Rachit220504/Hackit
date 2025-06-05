import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teamAPI } from '../../services/api';

const TeamsList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await teamAPI.getTeams();
      setTeams(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teams</h1>
        <Link 
          to="/teams/create" 
          className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Create Team
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search teams..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <svg
            className="absolute right-3 top-3 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {filteredTeams.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No teams found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div key={team._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{team.name}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{team.description || 'No description provided.'}</p>
                <div className="mb-4">
                  <span className="text-sm font-semibold text-gray-700">Team Leader:</span>
                  <span className="text-sm text-gray-600 ml-2">
                    {team.leader && team.leader.name ? team.leader.name : 'Unknown'}
                  </span>
                </div>
                <div className="mb-4">
                  <span className="text-sm font-semibold text-gray-700">Members:</span>
                  <span className="text-sm text-gray-600 ml-2">
                    {team.members ? team.members.length : 0} members
                  </span>
                </div>
                <Link
                  to={`/teams/${team._id}`}
                  className="block w-full text-center bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  View Team
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamsList;
