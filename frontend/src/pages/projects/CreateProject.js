import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectAPI } from '../../services/api';

const CreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    repoUrl: '',
    demoUrl: '',
    videoUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { title, description, techStack, repoUrl, demoUrl, videoUrl } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert techStack to array
      const techStackArray = techStack
        .split(',')
        .map((tech) => tech.trim())
        .filter(Boolean);

      const projectData = {
        ...formData,
        techStack: techStackArray,
      };

      const res = await projectAPI.createProject(projectData);
      navigate(`/projects/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link to="/dashboard" className="text-primary hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Create Project</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={onChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter project title"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={onChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Describe your project"
                rows="5"
                required
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="techStack">
                Technologies Used *
              </label>
              <input
                type="text"
                id="techStack"
                name="techStack"
                value={techStack}
                onChange={onChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g. React, Node.js, MongoDB (comma separated)"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="repoUrl">
                Repository URL
              </label>
              <input
                type="url"
                id="repoUrl"
                name="repoUrl"
                value={repoUrl}
                onChange={onChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="https://github.com/username/repo"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="demoUrl">
                Demo URL
              </label>
              <input
                type="url"
                id="demoUrl"
                name="demoUrl"
                value={demoUrl}
                onChange={onChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="https://your-demo-site.com"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="videoUrl">
                Demo Video URL
              </label>
              <input
                type="url"
                id="videoUrl"
                name="videoUrl"
                value={videoUrl}
                onChange={onChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="https://youtube.com/watch?v=example"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
              <Link
                to="/dashboard"
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

export default CreateProject;
