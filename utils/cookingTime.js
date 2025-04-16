// // utils/cookingTime.js
// export const getCookingTime = (items) => {
//     const prepTimes = {
//       pizza: 10,
//       salad: 5,
//       burger: 8,
//       pasta: 12,
//     };
  
//     let maxTime = 0;
  
//     items.forEach(item => {
//       const itemName = item.name?.toLowerCase();
  
//       if (prepTimes[itemName] && prepTimes[itemName] > maxTime) {
//         maxTime = prepTimes[itemName];
//       }
//     });
  
//     return maxTime; // in minutes
//   };
  