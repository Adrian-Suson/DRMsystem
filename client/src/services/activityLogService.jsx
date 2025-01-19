import axios from 'axios';

export const logActivity = async (activityType, description) => {
  try {
    const currentUser = localStorage.getItem('id');

    await axios.post('http://localhost:7777/activity-logs', {
      user_id: currentUser,
      activity_type: activityType,
      description
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};