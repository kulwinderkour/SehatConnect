import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(name, params);
  }
}

export function reset(routeName: string, params?: any) {
  console.log('NavigationService.reset called with:', routeName, params);
  console.log('Navigation ref ready:', navigationRef.isReady());
  console.log('Current route name:', navigationRef.getCurrentRoute()?.name);
  
  if (navigationRef.isReady()) {
    try {
      console.log('Dispatching navigation reset...');
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: routeName, params }],
        })
      );
      console.log('Navigation reset dispatched successfully');
    } catch (error) {
      console.error('Navigation reset failed:', error);
    }
  } else {
    console.log('Navigation ref not ready, cannot navigate');
    // Retry after a short delay
    setTimeout(() => {
      if (navigationRef.isReady()) {
        try {
          console.log('Retrying navigation reset...');
          navigationRef.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: routeName, params }],
            })
          );
        } catch (error) {
          console.error('Navigation reset retry failed:', error);
        }
      }
    }, 100);
  }
}

export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}
