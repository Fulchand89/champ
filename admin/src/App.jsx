import React, { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './routes'
import { systemSettingsService } from './api/services/systemSettingsService'
import { initAdminSocket } from './api/services/adminSocketService'

const App = () => {
  useEffect(() => {
    // 1. Initial fetch of Platform Brand Name for document.title
    const updateTitle = async () => {
      try {
        const res = await systemSettingsService.getSettings();
        if (res?.data?.platformName) {
          document.title = res.data.platformName;
        }
      } catch (err) {
        console.error('Error fetching platform title:', err);
      }
    };
    updateTitle();

    // 2. Real-time update of document.title when admin updates brand name
    const socket = initAdminSocket();
    const handleSettingsUpdate = (updatedSettings) => {
      if (updatedSettings?.platformName) {
        document.title = updatedSettings.platformName;
      }
    };

    socket.on('system_settings_updated', handleSettingsUpdate);

    return () => {
      socket.off('system_settings_updated', handleSettingsUpdate);
    };
  }, []);

  return <RouterProvider router={router} />
}

export default App