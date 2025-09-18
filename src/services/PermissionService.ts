// Permission Service
// Handles camera and microphone permissions for video calls

import { Platform, Alert } from 'react-native';
import { request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';

class PermissionService {
  // Request camera permission
  async requestCameraPermission(): Promise<boolean> {
    try {
      const permission: Permission = Platform.select({
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
      }) as Permission;

      const result = await request(permission);
      
      if (result === RESULTS.GRANTED) {
        return true;
      } else if (result === RESULTS.DENIED) {
        this.showPermissionAlert('Camera', 'camera');
        return false;
      } else if (result === RESULTS.BLOCKED) {
        this.showSettingsAlert('Camera');
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  // Request microphone permission
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const permission: Permission = Platform.select({
        ios: PERMISSIONS.IOS.MICROPHONE,
        android: PERMISSIONS.ANDROID.RECORD_AUDIO,
      }) as Permission;

      const result = await request(permission);
      
      if (result === RESULTS.GRANTED) {
        return true;
      } else if (result === RESULTS.DENIED) {
        this.showPermissionAlert('Microphone', 'microphone');
        return false;
      } else if (result === RESULTS.BLOCKED) {
        this.showSettingsAlert('Microphone');
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  }

  // Request both camera and microphone permissions
  async requestVideoCallPermissions(): Promise<{
    camera: boolean;
    microphone: boolean;
    allGranted: boolean;
  }> {
    try {
      const [cameraGranted, microphoneGranted] = await Promise.all([
        this.requestCameraPermission(),
        this.requestMicrophonePermission(),
      ]);

      return {
        camera: cameraGranted,
        microphone: microphoneGranted,
        allGranted: cameraGranted && microphoneGranted,
      };
    } catch (error) {
      console.error('Error requesting video call permissions:', error);
      return {
        camera: false,
        microphone: false,
        allGranted: false,
      };
    }
  }

  // Check if permissions are already granted
  async checkPermissions(): Promise<{
    camera: boolean;
    microphone: boolean;
    allGranted: boolean;
  }> {
    try {
      const cameraPermission: Permission = Platform.select({
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
      }) as Permission;

      const microphonePermission: Permission = Platform.select({
        ios: PERMISSIONS.IOS.MICROPHONE,
        android: PERMISSIONS.ANDROID.RECORD_AUDIO,
      }) as Permission;

      const [cameraResult, microphoneResult] = await Promise.all([
        request(cameraPermission),
        request(microphonePermission),
      ]);

      const cameraGranted = cameraResult === RESULTS.GRANTED;
      const microphoneGranted = microphoneResult === RESULTS.GRANTED;

      return {
        camera: cameraGranted,
        microphone: microphoneGranted,
        allGranted: cameraGranted && microphoneGranted,
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return {
        camera: false,
        microphone: false,
        allGranted: false,
      };
    }
  }

  // Show permission denied alert
  private showPermissionAlert(permissionName: string, permissionType: string) {
    Alert.alert(
      `${permissionName} Permission Required`,
      `This app needs ${permissionName.toLowerCase()} access to enable video consultations with doctors. Please grant permission when prompted.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Grant Permission',
          onPress: () => {
            // Re-request permission
            if (permissionType === 'camera') {
              this.requestCameraPermission();
            } else {
              this.requestMicrophonePermission();
            }
          },
        },
      ]
    );
  }

  // Show settings alert for blocked permissions
  private showSettingsAlert(permissionName: string) {
    Alert.alert(
      `${permissionName} Permission Blocked`,
      `${permissionName} permission has been blocked. Please enable it in your device settings to use video consultations.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => {
            // This would typically open device settings
            // Implementation depends on your navigation setup
            console.log('Open device settings');
          },
        },
      ]
    );
  }
}

// Create singleton instance
const permissionService = new PermissionService();

export default permissionService;
