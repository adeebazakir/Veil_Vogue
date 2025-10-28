import React, { useState } from 'react';
import { getCustomizationForCategory } from '../config/customizationConfig';
import './CustomizationForm.css';

const CustomizationForm = ({ category, onCustomizationChange }) => {
    const config = getCustomizationForCategory(category);
    const [measurements, setMeasurements] = useState({});
    const [showForm, setShowForm] = useState(false);

    // If no customization config for this category, don't render anything
    if (!config) {
        return null;
    }

    const handleChange = (fieldId, value) => {
        // Validate and sanitize input - only allow numbers and decimal point
        const sanitized = value.replace(/[^0-9.]/g, '');
        
        // Prevent multiple decimal points
        const parts = sanitized.split('.');
        const finalValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : sanitized;
        
        // Validate range (reasonable measurements: 10-100 inches)
        if (finalValue && parseFloat(finalValue) > 200) {
            return; // Don't update if too large
        }
        
        const updated = {
            ...measurements,
            [fieldId]: finalValue
        };
        setMeasurements(updated);
        onCustomizationChange(updated);
    };

    // Check if any measurement has been entered
    const hasMeasurements = Object.values(measurements).some(val => val && val.trim() !== '');

    return (
        <div className="customization-form-wrapper">
            {!showForm ? (
                <button 
                    className="show-customization-btn"
                    onClick={() => setShowForm(true)}
                >
                    <span className="btn-icon">{config.icon}</span>
                    <span className="btn-text">Add Custom Measurements (Optional)</span>
                    <span className="btn-arrow">→</span>
                </button>
            ) : (
                <div className="customization-form-container">
                    <div className="customization-header">
                        <div className="header-left">
                            <span className="custom-icon">{config.icon}</span>
                            <div>
                                <h3>{config.title}</h3>
                                <p className="description">{config.description}</p>
                                <p className="customization-fee">
                                    <span className="fee-icon">💰</span>
                                    <span className="fee-text">Additional ₹150 per item</span>
                                </p>
                            </div>
                        </div>
                        <button 
                            className="close-btn"
                            onClick={() => setShowForm(false)}
                            title="Close"
                        >
                            ✕
                        </button>
                    </div>

                    {hasMeasurements && (
                        <div className="customization-summary">
                            <span className="check-icon">✅</span>
                            <span>Custom measurements added</span>
                        </div>
                    )}

                    <div className="measurements-grid">
                        {config.fields.map((field) => (
                            <div key={field.id} className="measurement-field">
                                <label htmlFor={field.id}>
                                    {field.label}
                                </label>
                                <div className="input-with-unit">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        pattern="[0-9]*\.?[0-9]*"
                                        id={field.id}
                                        value={measurements[field.id] || ''}
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                        placeholder={field.placeholder}
                                        className="measurement-input"
                                        title="Enter numbers only (e.g., 36 or 36.5)"
                                        min="10"
                                        max="200"
                                    />
                                    <span className="unit">{field.unit}</span>
                                </div>
                                {field.helpText && (
                                    <small className="help-text">{field.helpText}</small>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="form-footer">
                        <button 
                            className="clear-btn"
                            onClick={() => {
                                setMeasurements({});
                                onCustomizationChange({});
                            }}
                        >
                            Clear All
                        </button>
                        <button 
                            className="done-btn"
                            onClick={() => setShowForm(false)}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomizationForm;

