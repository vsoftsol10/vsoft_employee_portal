import React, { useState, useEffect } from "react";
import { firestore } from "../firebaseConfig"; // Your Firebase config
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import * as XLSX from "xlsx";

const UploadHolidays = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [holidays, setHolidays] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year

  // Handle file selection
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Handle year selection
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  // Handle file upload and processing
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Read the Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert the data to JSON
      const holidaysData = XLSX.utils.sheet_to_json(worksheet);

      // Iterate over holidays and upload to Firestore
      for (const holiday of holidaysData) {
        const holidayDate = holiday.Date; // Assuming your Excel sheet has a 'Date' column
        const holidayName = holiday.Name; // Assuming your Excel sheet has a 'Name' column

        if (!holidayDate || !holidayName) {
          continue; // Skip if any required field is missing
        }

        const dateObject = new Date(holidayDate);
        const year = dateObject.getFullYear();

        // Check if the holiday belongs to the selected year
        if (year.toString() !== selectedYear) {
          continue; // Skip if the holiday does not match the selected year
        }

        const holidayDocRef = doc(
          firestore,
          "holidays",
          `${year}-${holidayDate}`
        );
        await setDoc(
          holidayDocRef,
          {
            holidayName: holidayName,
            date: holidayDate,
          },
          { merge: true } // Merge to update if exists
        );
      }

      setMessage("Holidays uploaded successfully!");
      fetchHolidays(); // Fetch the updated holidays after upload
    } catch (error) {
      console.error("Error uploading holiday data:", error);
      setMessage("Error uploading holiday data.");
    } finally {
      setLoading(false);
      setFile(null); // Clear the file input
    }
  };

  // Fetch holidays for the selected year
  const fetchHolidays = async () => {
    const holidaysRef = collection(firestore, "holidays");
    const snapshot = await getDocs(holidaysRef);
    const holidayList = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const year = new Date(data.date).getFullYear();
      // Filter holidays based on the selected year
      if (year.toString() === selectedYear) {
        holidayList.push(data);
      }
    });

    setHolidays(holidayList);
  };

  // Fetch holidays when component mounts or when selected year changes
  useEffect(() => {
    fetchHolidays();
  }, [selectedYear]);

  return (
    <div>
      <h2>Upload Holidays for the Year</h2>
      <select value={selectedYear} onChange={handleYearChange}>
        {/* Generate year options from 2020 to current year */}
        {[...Array(5).keys()].map((i) => {
          const year = new Date().getFullYear() - i;
          return (
            <option key={year} value={year}>
              {year}
            </option>
          );
        })}
      </select>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload Holidays"}
      </button>
      {message && <p>{message}</p>}
      <h3>Holidays for {selectedYear}</h3>
      <ul>
        {holidays.map((holiday) => (
          <li key={holiday.date}>
            {holiday.date}: {holiday.holidayName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UploadHolidays;
