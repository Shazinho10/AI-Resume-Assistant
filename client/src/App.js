import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const [isDocumentUploaded, setIsDocumentUploaded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUploadSuccess = (files) => {
    setUploadedFiles(files);
    setIsDocumentUploaded(true);
  };

  const handleReset = () => {
    setIsDocumentUploaded(false);
    setUploadedFiles([]);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>AI Resume Assistant</h1>
        <p>Upload your documents and chat with AI</p>
      </header>

      <div className="container">
        {!isDocumentUploaded ? (
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        ) : (
          <ChatInterface 
            uploadedFiles={uploadedFiles} 
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}

export default App;