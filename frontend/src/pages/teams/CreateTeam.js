import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { teamAPI } from '../../services/api';

const CreateTeam = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxMembers: 5,
    skillsNeeded: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { name, description, maxMembers, skillsNeeded } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert comma-separated skills to array
      const skillsArray = skillsNeeded
        ? skillsNeeded.split(',').map(skill => skill.trim()).filter(Boolean)
        : [];

      const teamData = {
        name,
        description,
        maxMembers: parseInt(maxMembers, 10),
        skillsNeeded: skillsArray,
      };

      const res = await teamAPI.createTeam(teamData);
      navigate(`/teams/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link to="/teams" className="text-primary hover:underline">
          &larr; Back to Teams
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Create a New Team</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Team Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={onChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter team name"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={onChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Describe your team and what you're looking for"
                rows="4"
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="maxMembers">
                Maximum Team Size
              </label>
              <select
                id="maxMembers"
                name="maxMembers"
                value={maxMembers}
                onChange={onChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="2">2 members</option>
                <option value="3">3 members</option>
                <option value="4">4 members</option>
                <option value="5">5 members</option>
                <option value="6">6 members</option>
                <option value="7">7 members</option>
                <option value="8">8 members</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="skillsNeeded">
                Skills Needed (comma separated)
              </label>
              <input
                type="text"
                id="skillsNeeded"
                name="skillsNeeded"
                value={skillsNeeded}
                onChange={onChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g. React, Node.js, UI/UX Design"
              />
              <p className="text-sm text-gray-500 mt-1">
                List skills you're looking for in team members
              </p>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Team'}
              </button>
              <Link
                to="/teams"
                className="inline-block align-baseline font-bold text-sm text-primary hover:text-blue-800"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTeam;
