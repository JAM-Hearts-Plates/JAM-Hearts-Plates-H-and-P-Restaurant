import axios from 'axios';
import appError from './appError.js';

export const getDistance = async (userAddress) => {
  const restaurantAddress = '123 Yummy Street';

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/distancematrix/json',
      {
        params: {
          origins: userAddress,
          destinations: restaurantAddress,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    const element = response.data.rows[0].elements[0];

    if (element.status !== 'OK') {
      throw new appError(`Unable to calculate distance: ${element.status}`, 400);
    }

    return {
      distance: element.distance.text,
      duration: element.duration.text,
    };
  } catch (error) {
    if (error.isAxiosError || error.response) {
      throw new appError('Failed to fetch distance data from Google Maps API', 502);
    }
    throw error;
  }
};
