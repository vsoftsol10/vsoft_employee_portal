import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig'; // Import your Firebase services

const Payroll = () => {
  const [payrollFiles, setPayrollFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayrollFiles = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          alert('User not authenticated');
          return;
        }

        const uid = user.uid;
        const folderPath = `payrollpdf/${uid}/`; // Dynamic path based on user UID

        // Reference to the user's payroll folder
        const folderRef = ref(storage, folderPath);

        // Recursive function to fetch files from subdirectories
        const fetchFilesRecursively = async (folderRef) => {
          const files = [];
          const folderList = await listAll(folderRef);

          // Loop through all items in the folder
          for (const itemRef of folderList.items) {
            const fileUrl = await getDownloadURL(itemRef);
            const fileName = itemRef.name.split('/').pop(); // Extract file name
            files.push({ name: fileName, url: fileUrl });
          }

          // Recursively process subdirectories
          for (const prefixRef of folderList.prefixes) {
            const subFolderFiles = await fetchFilesRecursively(prefixRef); // Recursive call for subfolder
            files.push(...subFolderFiles); // Append files from subfolders
          }

          return files;
        };

        // Fetch all files (including from subdirectories)
        const files = await fetchFilesRecursively(folderRef);
        setPayrollFiles(files);

      } catch (error) {
        console.error('Error fetching payroll files:', error);
        alert(`Error fetching payroll files: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollFiles();
  }, []);

  if (loading) {
    return <div>Loading payroll files...</div>;
  }

  return (
    <div className="payroll-container">
      <h1>Payroll Downloads</h1>
      {payrollFiles.length > 0 ? (
        <table className="payroll-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {payrollFiles.map((file, index) => (
              <tr key={index}>
                <td>{file.name}</td>
                <td>
                  <button onClick={() => window.open(file.url, '_blank')}>Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No payroll files found.</p>
      )}
      <style>
        {`
          .payroll-container {
            padding: 20px;
            max-width: 800px;
            margin: auto;
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
            background-color:white;
          }
          .payroll-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background-color:white;
          }
          .payroll-table th, .payroll-table td {
            padding: 10px;
            border: 1px solid #ccc;
            text-align: center;
          }
          .payroll-table th {
            background-color: #f4f4f4;
          }
          button {
            padding: 10px 15px;
            border: none;
            background-color: #7A3DD8 ;
            color: white;
            font-size: 14px;
            cursor: pointer;
            border-radius: 5px;
          }
          button:hover {
            background-color: #0056b3;
          }
        `}
      </style>
    </div>
  );
};

export default Payroll;
