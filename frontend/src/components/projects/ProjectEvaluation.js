import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ProjectEvaluation = ({ projectId, judgeId, onSubmitSuccess }) => {
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState([]);
  const [overallComment, setOverallComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCriteria();
  }, []);

  const fetchCriteria = async () => {
    try {
      setLoading(true);
      const res = await api.get('/judging/criteria');
      setCriteria(res.data);
      
      // Initialize scores for each criteria
      const initialScores = res.data.map(c => ({
        criteria: c._id,
        score: Math.floor((c.minScore + c.maxScore) / 2), // Default to middle value
        comment: '',
      }));
      
      setScores(initialScores);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch judging criteria');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (criteriaId, value) => {
    setScores(prev => 
      prev.map(item => 
        item.criteria === criteriaId ? { ...item, score: parseInt(value, 10) } : item
      )
    );
  };

  const handleCommentChange = (criteriaId, comment) => {
    setScores(prev => 
      prev.map(item => 
        item.criteria === criteriaId ? { ...item, comment } : item
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      await api.post('/judging/evaluations', {
        projectId,
        scores,
        overallComment,
      });
      
      setSuccess(true);
      
      // Call the success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Evaluate Project</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Evaluation submitted successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 mb-6">
          {criteria.map(criterion => {
            const currentScore = scores.find(s => s.criteria === criterion._id);
            
            return (
              <div key={criterion._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{criterion.name}</h3>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Weight: {criterion.weight}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{criterion.description}</p>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Score ({criterion.minScore}-{criterion.maxScore})
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min={criterion.minScore}
                      max={criterion.maxScore}
                      value={currentScore?.score || criterion.minScore}
                      onChange={(e) => handleScoreChange(criterion._id, e.target.value)}
                      className="w-full mr-4"
                    />
                    <span className="text-lg font-semibold w-8 text-center">
                      {currentScore?.score || criterion.minScore}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={currentScore?.comment || ''}
                    onChange={(e) => handleCommentChange(criterion._id, e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:outline-none"
                    rows="2"
                    placeholder="Add specific comments about this criterion..."
                  ></textarea>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Feedback
          </label>
          <textarea
            value={overallComment}
            onChange={(e) => setOverallComment(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:outline-none"
            rows="4"
            placeholder="Provide overall feedback about the project..."
          ></textarea>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Evaluation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectEvaluation;
