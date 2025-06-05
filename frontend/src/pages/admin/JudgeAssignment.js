import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const JudgeAssignment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [judge, setJudge] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchJudge();
    fetchProjects();
  }, [id]);

  const fetchJudge = async () => {
    try {
      const res = await api.get(`/judging/judges/${id}`);
      setJudge(res.data);
      
      // Set initially selected projects
      if (res.data.assignedProjects) {
        setSelectedProjects(res.data.assignedProjects.map(p => p._id || p));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch judge details');
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      
      // Filter only submitted or approved projects
      const eligibleProjects = res.data.filter(
        p => p.submissionStatus === 'submitted' || p.submissionStatus === 'approved'
      );
      
      setProjects(eligibleProjects);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelection = (projectId) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      await api.put(`/judging/judges/${id}/assign`, {
        projectIds: selectedProjects,
      });
      
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign projects');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!judge) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Judge not found
        </div>
        <Link to="/admin/judges" className="text-primary hover:underline">
          Back to Judges
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/admin/judges" className="text-primary hover:underline">
          &larr; Back to Judges
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">
            Assign Projects to {judge.user.name}
          </h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Projects assigned successfully!
            </div>
          )}
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Judge Details</h2>
            <div className="flex items-center mb-4">
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
            
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Expertise:</span>{' '}
              {judge.expertise && judge.expertise.length > 0 
                ? judge.expertise.join(', ') 
                : 'None specified'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Available Projects</h2>
              <p className="text-sm text-gray-600 mb-4">
                Select the projects you want to assign to this judge for evaluation.
              </p>
              
              {projects.length === 0 ? (
                <div className="bg-gray-100 rounded p-4 text-center">
                  <p className="text-gray-500">No eligible projects available for judging.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto p-2">
                  {projects.map(project => (
                    <div 
                      key={project._id} 
                      className={`border rounded p-3 cursor-pointer ${
                        selectedProjects.includes(project._id) 
                          ? 'border-primary bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleProjectSelection(project._id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project._id)}
                          onChange={() => {}}
                          className="mr-3 h-4 w-4 text-primary"
                        />
                        <div>
                          <h3 className="font-semibold">{project.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {project.description}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500">
                              Team: {project.team.name}
                            </span>
                            <span className="ml-3 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {project.submissionStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedProjects.length} project(s) selected
              </div>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => navigate('/admin/judges')}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || projects.length === 0}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Assignments'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JudgeAssignment;
