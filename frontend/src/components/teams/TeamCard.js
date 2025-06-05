import React from 'react';
import { Link } from 'react-router-dom';

const TeamCard = ({ team }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
  );
};

export default TeamCard;
