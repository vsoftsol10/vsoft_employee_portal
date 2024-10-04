export const convertTo12HourFormat = (timeString) => {
  if (timeString) {
    // Split the time string into hours and minutes
    let [hours, minutes] = timeString?.split(":")?.map(Number);

    // Determine if it's AM or PM
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert hours to 12-hour format
    hours = hours % 12 || 12; // If hours is 0 or 12, display as 12

    // Return the formatted time with AM/PM
    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  } else {
    return "";
  }
};

export const getTimeFromHHMM = (timeStr) => {
  const currentDate = new Date();
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date(currentDate); // Use the current date
  date.setHours(hours, minutes, 0, 0); // Set hours and minutes
  return date;
};

// Utility function to convert Firestore Timestamp to formatted date-time string
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "Not available";
  const date = timestamp.toDate(); // Convert Firestore Timestamp to JavaScript Date
  return date.toLocaleString(); // Format the date as a readable string
};

export const calculateFixedWorkingHours = (checkInEnds, checkOutEnds) => {
  const checkInEndTime = getTimeFromHHMM(checkInEnds); // Convert check-in end time to Date
  const checkOutEndTime = getTimeFromHHMM(checkOutEnds); // Convert check-out end time to Date

  // Calculate total hours worked between checkInEnds and checkOutEnds
  const totalHoursWorked =
    (checkOutEndTime - checkInEndTime) / (1000 * 60 * 60); // Convert milliseconds to hours
  return totalHoursWorked; // Return total hours
};
