// import { getIO } from '../index.js';  // Imports the getIO function from index.js

// /**
//  * Sends real-time alerts to the kitchen display
//  * @param {string} message - Alert message content
//  * @param {boolean} [isPriority=false] - Marks high-priority alerts (e.g., VIP orders)
//  */
// export const sendKitchenAlert = (message, isPriority = false) => {
//     const io = getIO();  // Gets the Socket.IO instance
    
//     const alertData = {
//         message,
//         priority: isPriority ? 'high' : 'normal',
//         timestamp: new Date().toISOString()
//     };

//     io.emit('kitchen-alert', alertData);  // Sends to connected clients
//     console.log('Kitchen Alert:', alertData);  // Logs to server console
// };