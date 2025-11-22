import React, { useState } from 'react';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import axios from 'axios';
import './FileUpload.css';

const API_URL = 'http://localhost:3000';

const FileUpload = ({ onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      const validTypes = ['.pdf', '.docx', '.txt', '.csv'];
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      return validTypes.includes(fileExt);
    });

    if (validFiles.length !== files.length) {
      setError('Some files were skipped. Only PDF, DOCX, TXT, and CSV files are allowed.');
    } else {
      setError('');
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploadedFiles = [];
      let totalChunks = 0;

      // Upload files one by one since backend accepts single file
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        console.log('Uploading file:', file.name);

        const response = await axios.post(`${API_URL}/api/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Upload response:', response.data);
        uploadedFiles.push(file.name);
        totalChunks += response.data.chunksCount || 0;
      }

      console.log('All uploads successful. Total chunks:', totalChunks);
      onUploadSuccess(uploadedFiles);
    } catch (err) {
      console.error('Upload error:', err);
      
      let errorMessage = 'Failed to upload files';
      
      if (err.response) {
        errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
        console.error('Server error:', err.response.data);
      } else if (err.request) {
        errorMessage = 'No response from server. Make sure backend is running on http://localhost:3000';
        console.error('No response received');
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <div className="upload-icon">
          <Upload size={48} />
        </div>
        
        <h2>Upload Your Documents</h2>
        <p className="upload-subtitle">
          Upload resumes, job descriptions, or any documents you want to chat about
        </p>

        <div
          className={`dropzone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            multiple
            onChange={handleChange}
            accept=".pdf,.docx,.txt,.csv"
            style={{ display: 'none' }}
          />
          <label htmlFor="file-upload" className="upload-label">
            <Upload size={32} />
            <p>Drag and drop files here or click to browse</p>
            <span className="file-types">Supported: PDF, DOCX, TXT, CSV</span>
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="file-list">
            <h3>Selected Files ({selectedFiles.length})</h3>
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <File size={20} />
                <span className="file-name">{file.name}</span>
                <span className="file-size">
                  {(file.size / 1024).toFixed(2)} KB
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="remove-btn"
                  disabled={uploading}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          className="upload-btn"
        >
          {uploading ? (
            <>
              <div className="spinner"></div>
              Uploading...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Upload and Continue
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;