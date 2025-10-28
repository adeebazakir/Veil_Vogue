import React from 'react';
import './CustomizationDisplay.css';

const CustomizationDisplay = ({ customizationDetails, customizationCost }) => {
    // If no customization, don't render anything
    if (!customizationDetails || customizationDetails.trim() === '') {
        return null;
    }

    try {
        const customization = JSON.parse(customizationDetails);
        
        // Check if there's any actual data
        const hasData = Object.values(customization).some(val => val && val.trim() !== '');
        if (!hasData) {
            return null;
        }

        // Measurement labels mapping
        const labels = {
            chest: 'Chest',
            bust: 'Bust',
            waist: 'Waist',
            hips: 'Hips',
            shoulder: 'Shoulder Width',
            sleeveLength: 'Sleeve Length',
            length: 'Full Length'
        };

        return (
            <div className="customization-display">
                <div className="customization-header">
                    <span className="custom-icon">📏</span>
                    <span className="custom-title">Custom Measurements</span>
                    {customizationCost > 0 && (
                        <span className="customization-cost-badge">+₹{customizationCost}</span>
                    )}
                </div>
                <div className="measurements-list">
                    {Object.entries(customization).map(([key, value]) => {
                        if (value && value.trim() !== '') {
                            return (
                                <div key={key} className="measurement-item">
                                    <span className="measurement-label">{labels[key] || key}:</span>
                                    <span className="measurement-value">{value} inches</span>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
                {customizationCost > 0 && (
                    <div className="customization-cost-note">
                        <span className="cost-icon">💰</span>
                        <span>Customization charge: ₹{customizationCost} per item</span>
                    </div>
                )}
            </div>
        );
    } catch (err) {
        // If JSON parsing fails, try to display as text
        return (
            <div className="customization-display">
                <div className="customization-header">
                    <span className="custom-icon">📝</span>
                    <span className="custom-title">Customization Details</span>
                    {customizationCost > 0 && (
                        <span className="customization-cost-badge">+₹{customizationCost}</span>
                    )}
                </div>
                <div className="customization-text">
                    {customizationDetails}
                </div>
            </div>
        );
    }
};

export default CustomizationDisplay;

