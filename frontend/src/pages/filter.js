import React, { useState, useEffect } from "react";
import { FaFilter, FaTimes, FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const NewsFilter = ({ onApplyFilter, onClearFilter, currentPreferences }) => {
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(currentPreferences.categories || []);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // Category options - can be expanded
  const categories = [
    "Business", "Entertainment", "Politics", "Health", 
    "Science", "Sports", "Technology"
  ];
  
  // Country options
  const countries = [
    { code: "us", name: "United States" },
    { code: "gb", name: "United Kingdom" },
    { code: "ca", name: "Canada" },
    { code: "au", name: "Australia" },
    { code: "in", name: "India" },
    { code: "fr", name: "France" },
    { code: "de", name: "Germany" },
    { code: "jp", name: "Japan" }
  ];
  
  // Language options
  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "es", name: "Spanish" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "hi", name: "Hindi" }
  ];
  
  // Set initial values based on current preferences
  useEffect(() => {
    if (currentPreferences?.categories) {
      setSelectedCategories(currentPreferences.categories);
    }
  }, [currentPreferences]);
  
  // Toggle filter panel
  const toggleFilterPanel = () => {
    setShowFilterPanel(!showFilterPanel);
  };
  
  // Handle category selection
  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  // Format date for API - YYYY-MM-DD format
  const formatDateForAPI = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Apply filters
  const applyFilters = () => {
    const filters = {};
    
    if (selectedCategories.length > 0) {
      filters.categories = selectedCategories;
    }
    
    if (selectedCountry) {
      filters.country = selectedCountry;
    }
    
    if (selectedLanguage) {
      filters.language = selectedLanguage;
    }
    
    if (startDate) {
      filters.startDate = formatDateForAPI(startDate);
    }
    
    if (endDate) {
      filters.endDate = formatDateForAPI(endDate);
    }
    
    onApplyFilter(filters);
    setShowFilterPanel(false);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedCountry("");
    setSelectedLanguage("");
    setStartDate(null);
    setEndDate(null);
    onClearFilter();
    setShowFilterPanel(false);
  };
  
  return (
    <div className="news-filter">
      <button 
        className="filter-toggle-btn" 
        onClick={toggleFilterPanel}
        aria-label="Toggle filters"
      >
        <FaFilter /> Filter
      </button>
      
      {showFilterPanel && (
        <div className="filter-panel">
          <div className="filter-panel-header">
            <h3>Filter News</h3>
            <button 
              className="close-filter-btn" 
              onClick={toggleFilterPanel}
              aria-label="Close filter panel"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="filter-section">
            <h4>Categories</h4>
            <div className="category-options">
              {categories.map(category => (
                <label key={category} className="category-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </label>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Country</h4>
            <select 
              value={selectedCountry} 
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="filter-select"
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-section">
            <h4>Language</h4>
            <select 
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="filter-select"
            >
              <option value="">All Languages</option>
              {languages.map(language => (
                <option key={language.code} value={language.code}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-section">
            <h4>Date Range</h4>
            <div className="date-pickers">
              <div className="date-picker-container">
                
                <div className="date-input-wrapper">
                  <FaCalendarAlt className="calendar-icon" />
                  <DatePicker
                    selected={startDate}
                    onChange={date => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    maxDate={new Date()}
                    placeholderText="Start Date"
                    className="date-input"
                    dateFormat="dd-MM-yyyy"
                  />
                </div>
              </div>
              
              <div className="date-picker-container">
                
                <div className="date-input-wrapper">
                  <FaCalendarAlt className="calendar-icon" />
                  <DatePicker
                    selected={endDate}
                    onChange={date => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    maxDate={new Date()}
                    placeholderText="End Date"
                    className="date-input"
                    dateFormat="dd-MM-yyyy"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="filter-buttons">
            <button 
              className="apply-filter-btn" 
              onClick={applyFilters}
            >
              Apply Filters
            </button>
            <button 
              className="clear-filter-btn" 
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsFilter;