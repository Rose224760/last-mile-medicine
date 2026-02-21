import React, { useState } from 'react';
import './PhotoUpload.css';

function PhotoUpload({ onMedicinesDetected }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/ocr/scan`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        if (data.data.extracted.medicines.length > 0) {
          onMedicinesDetected(data.data.extracted.medicines);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="photo-upload">
      <div className="upload-area">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          id="photo-input"
          className="photo-input"
        />
        <label htmlFor="photo-input" className="upload-label">
          {!preview ? (
            <>
              <span className="upload-icon">□</span>
              <span className="upload-text">Upload prescription or medicine photo</span>
              <span className="upload-hint">Supports JPG, PNG (max 5MB)</span>
            </>
          ) : (
            <img src={preview} alt="Preview" className="upload-preview" />
          )}
        </label>
      </div>

      {uploading && (
        <div className="upload-status">
          <div className="spinner-small"></div>
          <span>Analyzing image...</span>
        </div>
      )}

      {result && !uploading && (
        <div className="upload-result">
          <h4>Detected medicines:</h4>
          {result.extracted.medicines.length > 0 ? (
            <div className="detected-medicines">
              {result.extracted.medicines.map((med, idx) => (
                <span key={idx} className="medicine-tag">{med}</span>
              ))}
            </div>
          ) : (
            <p className="no-medicines">No medicines detected. Try a clearer image.</p>
          )}
          
          {result.demo && (
            <p className="demo-note">
              💡 This is a demo using mock OCR. In production, it will use real image recognition.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default PhotoUpload;
