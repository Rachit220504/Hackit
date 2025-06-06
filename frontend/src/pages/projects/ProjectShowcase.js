import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

const ProjectShowcase = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjectAndScore();
  }, [id]);

  const fetchProjectAndScore = async () => {
    try {
      setLoading(true);
      
      // Fetch project details
      const projectRes = await api.get(`/projects/${id}`);
      setProject(projectRes.data);
      
      // Try to fetch score if available
      try {
        const scoreRes = await api.get(`/scores/project/${id}`);
        setScore(scoreRes.data);
      } catch (scoreErr) {
        // Score might not exist yet, which is fine
        console.log('No score available for this project');
      }
      
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link to="/projects" className="text-primary hover:underline">
          &larr; Back to Projects
        </Link>
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
              
              {/* Project rank and score if available */}
              {score && (
                <div className="mt-2 flex items-center">
                  <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Rank #{score.rank}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    Score: {score.finalScore.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-4 md:mt-0">
              <span className="px-3 py-1 bg-green-200 text-green-800 rounded text-sm font-semibold">
                {project.submissionStatus.charAt(0).toUpperCase() + project.submissionStatus.slice(1)}
              </span>
            </div>
          </div>
          
          {/* Project images/screenshots carousel if available */}
          {project.screenshots && project.screenshots.length > 0 && (
            <div className="mb-8 overflow-hidden rounded-lg">
              <div className="flex overflow-x-auto space-x-4 py-2">
                {project.screenshots.map((screenshot, index) => (
                  <img 
                    key={index}
                    src={screenshot}
                    alt={`${project.title} screenshot ${index + 1}`}
                    className="h-64 w-auto object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">Project Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-semibold mb-3">Technologies Used</h2>
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
              <h2 className="text-2xl font-semibold mb-3">Team</h2>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                  {project.team.leader.avatar ? (
                    <img 
                      src={project.team.leader.avatar} 
                      alt={project.team.leader.name} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl text-gray-600">
                      {project.team.leader.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-lg">{project.team.name}</p>
                  <p className="text-sm text-gray-600">
                    Led by {project.team.leader.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Project links */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {project.repoUrl && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Repository</h2>
                <a 
                  href={project.repoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:underline"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V19c0 .27.16.59.67.5C17.14 18.16 20 14.42 20 10A10 10 0 0010 0z" clipRule="evenodd" />
                  </svg>
                  View Code Repository
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
                  className="inline-flex items-center text-primary hover:underline"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open Live Demo
                </a>
              </div>
            )}
          </div>
          
          {/* Demo video section */}
          {project.videoUrl && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Project Demo</h2>
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                <iframe
                  src={project.videoUrl.replace('watch?v=', 'embed/')}
                  title="Project Demo Video"
                  allowFullScreen
                  className="w-full h-64 md:h-96 rounded"
                ></iframe>
              </div>
            </div>
          )}
          
          {/* Detailed scores if available */}
          {score && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-2xl font-semibold mb-4">Evaluation Results</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Overall Score</span>
                  <span className="text-xl font-bold text-primary">{score.finalScore.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Based on {score.evaluationCount} evaluations</span>
                  <span>Last updated: {new Date(score.calculatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Score Breakdown</h3>
                
                {score.criteriaScores.map((criteriaScore, index) => (
                  <div key={index} className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{criteriaScore.criteria.name}</span>
                      <span className="font-bold">{criteriaScore.averageScore.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(criteriaScore.averageScore / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectShowcase;
