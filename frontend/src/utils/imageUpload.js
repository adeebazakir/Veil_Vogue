// Convert file to base64
export const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);

        fileReader.onload = () => {
            resolve(fileReader.result);
        };

        fileReader.onerror = (error) => {
            reject(error);
        };
    });
};

// Upload image to Cloudinary through our backend
export const uploadImage = async (imageFile) => {
    try {
        const base64Image = await convertToBase64(imageFile);
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add your auth header here if needed
                // 'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ image: base64Image })
        });

        if (!response.ok) {
            throw new Error('Image upload failed');
        }

        const data = await response.json();
        return {
            url: data.url,
            public_id: data.public_id
        };
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

// Delete image from Cloudinary through our backend
export const deleteImage = async (publicId) => {
    try {
        const response = await fetch(`/api/upload/${publicId}`, {
            method: 'DELETE',
            headers: {
                // Add your auth header here if needed
                // 'Authorization': `Bearer ${userToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Image deletion failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
};