import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState("https://via.placeholder.com/150");
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    emergencyContact: '',
    department: '',
    dob: '',
    fatherName: '',
    motherName: '',
    address: '',
    role: '',
    checkInTime: '',
    checkOutTime: '',
    dateJoined: '',
    employmentStatus: '',
    checkInStarts: '',
    checkInEnds: '',
    checkOutStarts: '',
    checkOutEnds: '',
    sickLeave: '',
    casualLeave: '',
    leaveWithoutPay: '',
    aadharNumber: ''
  });
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid; // Fetch the current user's UID
        const collections = ['interns', 'trainees', 'employees'];

        try {
          for (const collection of collections) {
            const userRef = doc(firestore, `${collection}/${uid}`); // Get reference to the user document in each collection
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              const data = userDoc.data();
              const formatDate = (timestamp) => {
                return timestamp && timestamp.toDate ? timestamp.toDate().toLocaleDateString() : 'N/A';
              };

              // Merge data from the collection into the profile state
              setProfile((prevProfile) => ({
                ...prevProfile,
                ...data,
                dateJoined: formatDate(data.dateJoined || prevProfile.dateJoined),
                dob: formatDate(data.dob || prevProfile.dob)
              }));
              setProfileImage(data.profileImage || profileImage);
              break; // Exit loop once we find data in one collection
            }
          }
        } catch (error) {
          setErrorMessage("Error fetching profile data: " + error.message);
        } finally {
          setIsFetching(false);
        }
      } else {
        setErrorMessage("User is not authenticated.");
        setIsFetching(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const imageUrl = URL.createObjectURL(selectedFile);
      setProfileImage(imageUrl);
    }
  };

  const handleSave = async () => {
    if (auth.currentUser) {
      const userRef = doc(firestore, `employees/${auth.currentUser.uid}`);
      setIsLoading(true);
      try {
        if (file) {
          const storageRef = ref(storage, `users/${auth.currentUser.uid}/profile.jpg`);
          await uploadBytes(storageRef, file);
          const imageUrl = await getDownloadURL(storageRef);
          profile.profileImage = imageUrl; // Set profileImage URL
        }
        await updateDoc(userRef, profile); // Update user document in Firestore
        setIsEditing(false);
      } catch (error) {
        setErrorMessage("Error saving profile: " + error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrorMessage("User is not authenticated.");
    }
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Management</h1>
      </div>
      {isFetching ? (
        <p>Loading profile...</p>
      ) : (
        <div className="profile-content">
          <div className="profile-picture">
            <img src={profileImage} alt="Profile" className="profile-img" />
            {isEditing && (
              <>
                <input type="file" id="profile-pic-upload" onChange={handleImageChange} />
                <label htmlFor="profile-pic-upload" className="upload-btn">
                  Upload New Picture
                </label>
              </>
            )}
          </div>
          <div className="profile-details">
            {Object.entries(profile).map(([key, value]) => (
              <div className="profile-detail" key={key}>
                <label>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: </label>
                {isEditing && ['name', 'emergencyContact', 'fatherName', 'motherName', 'address', 'aadharNumber'].includes(key) ? (
                  <input type="text" name={key} value={value} onChange={handleChange} />
                ) : (
                  <p>{value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <button className="edit-btn" onClick={handleEdit}>
        Edit Profile
      </button>
      <button className="change-password-btn" onClick={handleChangePassword}>
        Change Password
      </button>
      {isEditing && (
        <button className="save-btn" onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      )}
    </div>
  );
};

export default Profile;
