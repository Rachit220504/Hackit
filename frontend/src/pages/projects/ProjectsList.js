import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../../services/api';
import AuthContext from '../../context/AuthContext';

const ProjectsList = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myProjectsLoading, setMyProjectsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
    
    if (user) {
      fetchMyTeamProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectAPI.getProjects();
      setProjects(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTeamProjects = async () => {
    try {
      setMyProjectsLoading(true);
      const res = await projectAPI.getMyTeamProjects();
      setMyProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch my projects:', err);
    } finally {
      setMyProjectsLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    // Filter by search term
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.techStack.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase())) ||
      project.team.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    if (filter === 'all') return matchesSearch;
    if (filter === 'submitted') return matchesSearch && project.submissionStatus === 'submitted';
    if (filter === 'approved') return matchesSearch && project.submissionStatus === 'approved';
    
    return matchesSearch;
  });

  const getProjectStatusClass = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-200 text-gray-800';
      case 'submitted':
        return 'bg-blue-200 text-blue-800';
      case 'approved':
        return 'bg-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

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
        <h1 className="text-3xl font-bold">Projects</h1>
        {user && (
          <Link 
            to="/projects/create" 
            className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Create Project
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
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
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Projects</option>
          <option value="submitted">Under Review</option>
          <option value="approved">Approved Projects</option>
        </select>
      </div>

      {/* My Projects Section (if user is logged in) */}
      {user && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">My Team's Projects</h2>
          
          {myProjectsLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : myProjects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 mb-4">You haven't created any projects yet.</p>
              <Link 
                to="/projects/create" 
                className="inline-block bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create Your First Project
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProjects.map((project) => (
                <Link key={project._id} to={`/projects/${project._id}`} className="block">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
                    <div className="p-6 flex flex-col h-full">
                      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.techStack.slice(0, 3).map((tech, index) => (
                          <span key={index} className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs">
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 3 && (
                          <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs">
                            +{project.techStack.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-auto flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Team: {project.team.name}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getProjectStatusClass(project.submissionStatus)}`}>
                          {project.submissionStatus.charAt(0).toUpperCase() + project.submissionStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Projects Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">All Projects</h2>
        
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500 text-lg">No projects found matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link key={project._id} to={`/projects/${project._id}`} className="block">
                <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
                  <div className="p-6 flex flex-col h-full">
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.techStack.slice(0, 3).map((tech, index) => (
                        <span key={index} className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs">
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs">
                          +{project.techStack.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-auto flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Team: {project.team.name}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getProjectStatusClass(project.submissionStatus)}`}>
                        {project.submissionStatus.charAt(0).toUpperCase() + project.submissionStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;
