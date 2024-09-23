import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './Directory.css'
const db = getFirestore();

const PayrollUpload = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (user) {
        const usersCollection = await getDocs(collection(db, 'users'));
        const usersList = usersCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(usersList); // Log the fetched users
        setUsers(usersList);
      }
    };
  
    fetchUsers();
  }, []);
  

  return (
    <div>
      <h2>Payroll Management</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} {/* Assuming you have a name field */}
            <Link to={`/admin/payroll/${user.id}`}>See Details</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PayrollUpload;
