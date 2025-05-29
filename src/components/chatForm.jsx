import { useState, useRef, useEffect } from 'react';
import { X, Upload, Send, MessageSquare } from 'lucide-react';
import './chatbot.css'; 
import Logo from '../assets/logo.png';
import axios from 'axios';

export default function ChatbotForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  //All the required fields of the ticketing form 
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    instituteName: '',
    problemType: '',
    problemDescription: '',
    image: null
  });

  // const [institutes, setInstitutes] = useState([]);
  
   useEffect(() => {
  fetch('/api/institutes')
    .then(res => res.ok ? res.json() : Promise.reject('No API'))
    // .then(data => setInstitutes(data))
    .catch(() => {
      // fallback to local JSON
      // setInstitutes(universities);
      console.log('Error in filling your form')
    });
}, []);

  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.instituteName.trim()) {
      newErrors.instituteName = 'Institute name is required';
    }
    
    if (!formData.problemType.trim()) {
      newErrors.problemType = 'Problem type is required';
    }
    
    if (!formData.problemDescription.trim()) {
      newErrors.problemDescription = 'Problem description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Show loading state
    setIsLoading(true);
    
    // Create FormData object for file upload
    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('phone', formData.phone);
    submissionData.append('email', formData.email);
    submissionData.append('instituteName', formData.instituteName);
    submissionData.append('problemType', formData.problemType);
    submissionData.append('problemDescription', formData.problemDescription);
    if (formData.image) {
      submissionData.append('fileUpload', formData.image);
    }

    try {
      const response = await axios.post(
        ' https://48e6-103-106-138-4.ngrok-free.app/support/create',
        submissionData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );  
      console.log('Response from backend:', response.data);
      console.log('Submitting form data:');
      for(let [key, value] of submissionData.entries()) {
        console.log(`${key}:`, value);
      }

      // Reset form after submission
      setFormData({ 
        name: '',  
        phone: '', 
        email: '', 
        instituteName: '', 
        problemType: '',
        problemDescription: '',
        image: ''
      });
      setImagePreview(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
      setErrors({});
      
      // Hide loading and show success popup
      setIsLoading(false);
      setShowSuccessPopup(true);
      
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      setIsLoading(false);
      alert('Something went wrong. Please try again later.');
    }
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

  const toggleChatbot = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="chatbot-container">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <h3>Creating your ticket...</h3>
            <div className="spinner"></div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className={`help-text ${isOpen ? 'hidden' : ''}`}>
        Need Help?
      </div>

      {/* Chat form */}
      
      <div className={`chatbot-widget ${isOpen ? 'visible-chat-form' : 'hidden-chat-form'}`}>
        {/* Header */}
        <div className="chatbot-header"> 
          <div className="chat-header-content">
            <img src={Logo} alt="Elcarreira Logo" className="chat-logo" />
            <p className="chat-welcome-message">
              Hey! Drop us the issue details below and we will get back to you asap :)
            </p>
          </div>

        </div>

        {/* Form */}
        <div className="chatbot-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter name"
              className={`form-control ${errors.name ? 'error' : ''}`}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone</label>
            <input 
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your registered phone number"
              className={`form-control ${errors.phone ? 'error' : ''}`}
            />              
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className={`form-control ${errors.email ? 'error' : ''}`}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* <div className="form-group">
            <label htmlFor="institute" className="form-label">Institute Name</label>
            <select
              id="institute"
              name="institute"
              value={formData.institute}
              onChange={handleChange}
              className="form-control"
            >
               <option value=""> Select your institute</option>
               {institutes.map(inst => (
                <option key={inst.id} value={inst.name}>{inst.name}</option>
               ))} 
            </select>
          </div> */}

          <div className="form-group">
            <label htmlFor="instituteName" className="form-label">Institute Name</label>
            <input
              type="text"
              id="instituteName"
              name="instituteName"
              value={formData.instituteName}
              onChange={handleChange}
              placeholder="Enter Institute Name"
              className={`form-control ${errors.instituteName ? 'error' : ''}`}
            />
            {errors.instituteName && <span className="error-message">{errors.instituteName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="problemType" className="form-label">Problem Type</label>
            <input 
              type="text"
              id="problemType"
              name="problemType"
              value={formData.problemType}
              onChange={handleChange}
              placeholder="e.g Login issue, Payment issue, UI issue"
              className={`form-control ${errors.problemType ? 'error' : ''}`}
            />       
            {errors.problemType && <span className="error-message">{errors.problemType}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="problemDescription" className="form-label">Problem Description</label>
            <textarea
              type="text"
              id="problemDescription"
              name="problemDescription"
              value={formData.problemDescription}
              onChange={handleChange}
              placeholder="Elaborate your problem in detail"
              rows="4"
              className={`form-control ${errors.problemDescription ? 'error' : ''}`}
            />
            {errors.problemDescription && <span className="error-message">{errors.problemDescription}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Attach Screenshot (optional)</label>
            <div>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="upload-btn"
              >
                <Upload size={16} />
                Upload Image
              </button>
            </div>

            {imagePreview && (
              <div className="image-preview">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="remove-image-btn"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={handleSubmit}
              className="submit-btn"
            >
              <Send size={16} />
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Floating close button - visible when form is open */}
      <button
        onClick={toggleChatbot}
        className="chat-toggle-btn"
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Success Popup */}
      {showSuccessPopup && (
        <>
          <div className="popup-overlay" onClick={closeSuccessPopup} />
          <div className="success-popup">
            <h3>{formData.name}, your ticket has been created successfully!</h3>
            <button onClick={closeSuccessPopup}>OK</button>
          </div>
        </>
      )}
    </div>
  );
}
