import { google } from 'googleapis';
import appError from '../utils/appError.js';

const calendar = google.calendar({
  version: 'v3',
  auth: process.env.GOOGLE_CALENDAR_API_KEY,
});

const getEventTimes = (reservation) => {
  const start = new Date(`${reservation.date}T${reservation.time}:00`);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return { start, end };
};

// Add reservation to Google Calendar
export const addReservationToCalendar = async (reservation) => {
  try {

    const { start, end } = getEventTimes(reservation);

    const event = {
      summary: `Reservation for ${reservation.partySize} people`,
      description: `Customer: ${reservation.user.name}. Special requests: ${reservation.specialRequests || 'None'}`,
      start: {dateTime: start, timeZone: 'America/New_York'},
      end: {dateTime: end, timeZone: 'America/New_York' },
    };

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: event,
    });
    
    return response.data.id;
  } catch (err) {
    throw new appError('Failed to add reservation to calendar', 500);
  }
};

// Update reservation in Google Calendar
export const updateReservationInCalendar = async (eventId, reservation) => {
  try {

    const { start, end } = getEventTimes(reservation);

    const event = {
      summary: `Reservation for ${reservation.partySize} people`,
      description: `Customer: ${reservation.user.name}. Special requests: ${reservation.specialRequests || 'None'}`,
      start: {
        dateTime: start,
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: end,
        timeZone: 'America/New_York',
      },
    };
    
    await calendar.events.update({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
      resource: event,
    });
  } catch (err) {
    throw new appError('Failed to update reservation in calendar', 500);
  }
};

// Delete reservation from Google Calendar
export const deleteReservationFromCalendar = async (eventId) => {
  try {
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
    });
  } catch (err) {
    throw new appError('Failed to delete reservation from calendar', 500);
  }
};