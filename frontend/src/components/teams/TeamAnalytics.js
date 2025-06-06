import React from 'react';

const TeamAnalytics = ({ team }) => {
  // Calculate team completeness based on various factors
  const calculateCompleteness = () => {
    let score = 0;
    
    // Team has a name and description
    if (team.name) score += 20;
    if (team.description && team.description.length > 20) score += 10;
    
    // Team has members
    score += Math.min((team.members.length / team.maxMembers) * 30, 30);
    
    // Team has required skills defined
    if (team.skillsNeeded && team.skillsNeeded.length > 0) score += 20;
    
    // Team has a project
    if (team.project) score += 20;
    
    return score;
  };

  const teamCompleteness = calculateCompleteness();
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">Team Analytics</h3>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Team Completeness</span>
          <span className="text-sm font-medium">{teamCompleteness}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${teamCompleteness}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm text-gray-500">Team Size</span>
          <p className="font-medium">{team.members.length}/{team.maxMembers} members</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Project Status</span>
          <p className="font-medium">
            {team.project ? 
              team.project.submissionStatus.charAt(0).toUpperCase() + team.project.submissionStatus.slice(1) : 
              'No Project'}
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Skills Needed</span>
          <p className="font-medium">{team.skillsNeeded?.length || 0} skills</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Pending Invitations</span>
          <p className="font-medium">
            {team.invitations?.filter(inv => inv.status === 'pending').length || 0} invites
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamAnalytics;
