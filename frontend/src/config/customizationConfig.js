// Customization configuration for each product category
// Only Suits and Abayas have measurement options

export const customizationConfig = {
  Suits: {
    icon: '🤵',
    title: 'Add Custom Measurements',
    description: 'Provide your measurements for a perfect fit',
    fields: [
      {
        id: 'chest',
        label: 'Chest',
        type: 'text',
        placeholder: 'e.g., 38',
        unit: 'inches'
      },
      {
        id: 'waist',
        label: 'Waist',
        type: 'text',
        placeholder: 'e.g., 32',
        unit: 'inches'
      },
      {
        id: 'hips',
        label: 'Hips',
        type: 'text',
        placeholder: 'e.g., 36',
        unit: 'inches'
      },
      {
        id: 'shoulder',
        label: 'Shoulder Width',
        type: 'text',
        placeholder: 'e.g., 16',
        unit: 'inches'
      },
      {
        id: 'sleeveLength',
        label: 'Sleeve Length',
        type: 'text',
        placeholder: 'e.g., 24',
        unit: 'inches'
      },
      {
        id: 'length',
        label: 'Full Length',
        type: 'text',
        placeholder: 'e.g., 42',
        unit: 'inches'
      }
    ]
  },

  Abayas: {
    icon: '👘',
    title: 'Add Custom Measurements',
    description: 'Provide your measurements for a perfect fit',
    fields: [
      {
        id: 'bust',
        label: 'Bust',
        type: 'text',
        placeholder: 'e.g., 36',
        unit: 'inches'
      },
      {
        id: 'shoulder',
        label: 'Shoulder Width',
        type: 'text',
        placeholder: 'e.g., 15',
        unit: 'inches'
      },
      {
        id: 'sleeveLength',
        label: 'Sleeve Length',
        type: 'text',
        placeholder: 'e.g., 22',
        unit: 'inches'
      },
      {
        id: 'length',
        label: 'Full Length',
        type: 'text',
        placeholder: 'e.g., 54',
        unit: 'inches',
        helpText: 'Measure from shoulder to floor'
      }
    ]
  }
};

// Get customization config for a category
export const getCustomizationForCategory = (category) => {
  return customizationConfig[category] || null;
};

// Check if a category supports customization
export const hasCustomization = (category) => {
  return customizationConfig.hasOwnProperty(category);
};

