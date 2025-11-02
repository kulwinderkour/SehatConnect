# Profile Photo Update Guide

## 🎯 **Simple Setup - Only ONE Photo Needed!**

You only need to upload **ONE photo** and the system automatically adjusts dimensions for different display contexts.

## 📁 **Where to Place Your Photo**

Place your profile photo in this directory:
```
src/assets/images/profile-photos/rajinder_singh.jpg
```

## 📏 **Photo Specifications**

### **Recommended Dimensions:**
- **Optimal**: 400x400 pixels (recommended)
- **Minimum**: 200x200 pixels
- **Maximum**: 1000x1000 pixels
- **Aspect Ratio**: 1:1 (square) - will be automatically cropped to square

### **File Formats:**
- JPG (recommended)
- PNG (for transparency)
- WebP (modern format)

### **File Size:**
- Under 2MB recommended
- Under 5MB maximum

## 🖼️ **Automatic Resizing**

The system automatically resizes your single photo for different contexts:

### **Header Profile Photo:**
- **Display Size**: 50x50 pixels
- **Location**: Top-right corner next to language selector
- **Auto-resized**: ✅ Yes

### **Profile Screen Avatar:**
- **Display Size**: 80x80 pixels
- **Location**: Center of profile screen
- **Auto-resized**: ✅ Yes

## 📝 **Naming Convention**

Use descriptive names:
```
rajinder_singh.jpg
user_001.png
profile_placeholder.jpg
doctor_avatar.jpg
nurse_avatar.png
```

## 🔧 **How to Add Your Photo**

### **Step 1: Add Your Photo File**
1. Create the directory: `src/assets/images/profile-photos/`
2. Place your photo as: `rajinder_singh.jpg`
3. That's it! No other files needed.

### **Step 2: Update ProfilePhotoService (if using local file)**
Edit `src/services/ProfilePhotoService.ts`:

```typescript
export const PROFILE_PHOTOS: ProfilePhotoConfig[] = [
  {
    name: 'rajinder_singh',
    uri: require('../assets/images/profile-photos/rajinder_singh.jpg'),
    dimensions: { width: 400, height: 400 },
    fileSize: 45000
  }
];
```

### **Step 3: Test the Update**
1. Run the app
2. Go to Profile screen
3. Tap the profile photo to see instructions
4. Your photo will automatically appear in both header and profile screen

## ✨ **Features Available**

### **Profile Photo Selection:**
- Tap profile photo in Profile screen
- Choose from available photos
- Instant update in header and profile screen
- Success notification

### **Visual Indicators:**
- Camera icon on profile photo (indicates it's clickable)
- "Tap photo to change" hint text
- Photo dimensions displayed in selection modal

### **Auto-Sync:**
- Changes in Profile screen automatically update Header
- No need to restart app
- Real-time synchronization

## 🎨 **Current Sample Photos**

The app currently includes these sample photos:
1. **rajinder_singh** - Green background with "RS"
2. **user_001** - Blue background with "U1"
3. **profile_placeholder** - Orange background with "P"
4. **doctor_avatar** - Green background with "D"
5. **nurse_avatar** - Pink background with "N"

## 🔄 **How It Works**

1. **Context Management**: User profile data is managed centrally
2. **Photo Service**: Handles photo configurations and validation
3. **Real-time Updates**: Changes propagate instantly across components
4. **Responsive Design**: Photos auto-resize for different display contexts

## 📱 **User Experience**

1. User taps profile photo in Profile screen
2. Modal opens with available photo options
3. User selects desired photo
4. Photo updates immediately in:
   - Profile screen avatar
   - Header profile photo
5. Success message confirms the update

This system ensures your profile photos are always synchronized between the header and profile section!
