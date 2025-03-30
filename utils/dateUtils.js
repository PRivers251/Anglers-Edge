export const formatDate = (dateString) => {
    const dateObj = new Date(`${dateString}T00:00:00`); // Force local parsing for midnight
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/Chicago' }); // Explicitly use CST
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', timeZone: 'America/Chicago' });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    return `${dayOfWeek} ${monthName} ${day}, ${year}`;
  };
  
  export const validateDate = (selectedLocal, todayLocal, maxDateLocal) => {
    return selectedLocal >= todayLocal && selectedLocal <= maxDateLocal;
  };