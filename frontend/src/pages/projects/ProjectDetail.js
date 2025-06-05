import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectAPI } from '../../services/api';
import AuthContext from '../../context/AuthContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await projectAPI.getProject(id);
      setProject(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  const isTeamLeader = () => {
    if (!project || !user) return false;
    return project.team.leader._id === user._id;
  };

  const isAdminOrOrganizer = () => {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'organizer';
  };

  const handleSubmitProject = async () => {
    if (!window.confirm('Are you sure you want to submit this project for review?')) {
      return;
    }
    
    try {
      setSubmitting(true);
      await projectAPI.submitProject(id);
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      return;
    }
    
    try {
      setFeedbackLoading(true);
      await projectAPI.addFeedback(id, { comment: feedback });
      setFeedback('');
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    if (!window.confirm(`Are you sure you want to mark this project as ${status}?`)) {
      return;
    }
    
    try {
      await projectAPI.updateSubmissionStatus(id, status);
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project status');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    try {
      await projectAPI.deleteProject(id);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
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
          <Link to="/projects" className="text-primary hover:underline">
            &larr; Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Project not found.</p>
          <Link to="/projects" className="text-primary hover:underline mt-4 inline-block">
            &larr; Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (project.submissionStatus) {
      case 'draft':
        return <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm font-semibold">Draft</span>;
      case 'submitted':
        return <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-sm font-semibold">Under Review</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm font-semibold">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-sm font-semibold">Changes Requested</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/projects" className="text-primary hover:underline">
          &larr; Back to Projects
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <div className="mt-2 flex items-center">
                {getStatusBadge()}
                {project.submissionDate && (
                  <span className="ml-3 text-sm text-gray-600">
                    Submitted on: {new Date(project.submissionDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              {isTeamLeader() && (
                <>
                  <Link 
                    to={`/projects/${id}/edit`} 
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Edit Project
                  </Link>
                  
                  {project.submissionStatus === 'draft' && (
                    <button 
                      onClick={handleSubmitProject}
                      disabled={submitting}
                      className="bg-secondary text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      {submitting ? 'Submitting...' : 'Submit Project'}
                    </button>
                  )}
                  
                  <button 
                    onClick={handleDeleteProject}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </>
              )}
              
              {isAdminOrOrganizer() && project.submissionStatus === 'submitted' && (
                <>
                  <button 
                    onClick={() => handleStatusChange('approved')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleStatusChange('rejected')}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                  >
                    Request Changes
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Technologies Used</h2>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Team</h2>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                  {project.team.leader.avatar ? (
                    <img 
                      src={project.team.leader.avatar} 
                      alt={project.team.leader.name} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg text-gray-600">
                      {project.team.leader.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{project.team.name}</p>
                  <p className="text-sm text-gray-600">
                    {project.team.members.length} member{project.team.members.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Link 
                  to={`/teams/${project.team._id}`}
                  className="ml-auto text-primary hover:text-blue-700"
                >
                  View Team
                </Link>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {project.repoUrl && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Repository</h2>
                <a 
                  href={project.repoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {project.repoUrl}
                </a>
              </div>
            )}
            
            {project.demoUrl && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Live Demo</h2>
                <a 
                  href={project.demoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {project.demoUrl}
                </a>
              </div>
            )}
          </div>
          
          {project.videoUrl && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Demo Video</h2>
              <div className="aspect-w-16 aspect-h-9 rounded overflow-hidden">
                <iframe
                  src={project.videoUrl.replace('watch?v=', 'embed/')}
                  title="Project Demo Video"
                  allowFullScreen
                  className="w-full h-64 md:h-96"
                ></iframe>
              </div>
            </div>
          )}
          
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Feedback</h2>
            </div>
            
            {isAdminOrOrganizer() && (
              <div className="mb-6">
                <form onSubmit={handleAddFeedback} className="flex flex-col space-y-3">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Add your feedback..."
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="3"
                    required
                  ></textarea>
                  <div className="text-right">
                    <button
                      type="submit"
                      disabled={feedbackLoading}
                      className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      {feedbackLoading ? 'Sending...' : 'Add Feedback'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {project.feedbacks && project.feedbacks.length > 0 ? (
              <div className="space-y-4">
                {project.feedbacks.map((feedback, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                        {feedback.givenBy?.avatar ? (
                          <img 
                            src={feedback.givenBy.avatar} 
                            alt={feedback.givenBy.name} 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm text-gray-600">
                            {feedback.givenBy?.name.charAt(0).toUpperCase() || 'A'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {feedback.givenBy?.name || 'Anonymous'} 
                          <span className="text-xs text-gray-500 ml-2">
                            ({feedback.givenBy?.role || 'user'})
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(feedback.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700">{feedback.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No feedback yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
