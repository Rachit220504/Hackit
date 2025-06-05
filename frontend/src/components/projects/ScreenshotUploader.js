import React, { useState } from 'react';
import api from '../../services/api';

const ScreenshotUploader = ({ projectId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
      
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    // Create form data
    const formData = new FormData();
    formData.append('screenshot', selectedFile);
    
    try {
      const response = await api.post(`/projects/${projectId}/screenshots`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(response.data.screenshot);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Upload Screenshot</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Select Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
        />
      </div>
      
      {previewUrl && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="max-h-40 rounded border"
          />
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Screenshot'}
      </button>
    </div>
  );
};

export default ScreenshotUploader;
