import haversine from 'haversine-distance';

/**
 * Function to calculate distance between two locations.
 * @param {Object} location1 - First location with lat and lon properties.
 * @param {Object} location2 - Second location with lat and lon properties.
 * @returns {Number} Distance in kilometers.
 */
export const calculateDistance = (location1, location2) => {
  const distance = haversine(location1, location2); // Calculate distance in meters
  return distance / 1000; // Convert meters to kilometers
};

// google maps geolocation
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

// For server-side geocoding if needed
export const geocodeAddress = async (address) => {
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
  return response.json();
};