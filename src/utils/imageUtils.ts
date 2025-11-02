// Helper function to get local image URI
export const getLocalImageUri = (imageName: string): string => {
  // For now, we'll use a placeholder URL
  // In a real app, you would use a proper local image URI
  return `https://via.placeholder.com/400x400/5a9e31/ffffff?text=${imageName.charAt(0).toUpperCase()}`;
};

// Alternative: If you want to use a base64 encoded image
export const getBase64ImageUri = (base64String: string): string => {
  return `data:image/jpeg;base64,${base64String}`;
};

// For development, you can also use a direct file path
export const getFileImageUri = (fileName: string): string => {
  // This would work in development with Metro bundler
  return `file://${fileName}`;
};
