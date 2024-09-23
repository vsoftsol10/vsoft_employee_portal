import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
    role: '',
    checkInTime: '',
    checkOutTime: '',
    dateJoined: '',
    employmentStatus: ''
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (auth.currentUser) {
        const userRef = doc(firestore, `employees/${auth.currentUser.uid}`);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          
          // Handling Firestore timestamp to readable date
          const dateJoined = data.dateJoined?.toDate().toLocaleDateString() || 'N/A';

          // Set profile data, including the formatted dateJoined
          setProfile({ ...data, dateJoined });

          // Fetch profile image if available
          setProfileImage(data.profileImage || "https://via.placeholder.com/150");
        } else {
          console.error("No document found for this user.");
        }
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

      try {
        // Handle image upload
        if (file) {
          const storageRef = ref(storage, `users/${auth.currentUser.uid}/profile.jpg`);
          await uploadBytes(storageRef, file);
          const imageUrl = await getDownloadURL(storageRef);
          profile.profileImage = imageUrl;
        }

        // Save profile data in Firestore
        await updateDoc(userRef, profile);
        setIsEditing(false);
        console.log("Profile saved:", profile);
      } catch (error) {
        console.error("Error saving profile:", error.message);
      }
    } else {
      console.error("User is not authenticated.");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Management</h1>
      </div>
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
          <div className="profile-detail">
            <label>Name:</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
              />
            ) : (
              <p>{profile.name}</p>
            )}
          </div>
          <div className="profile-detail">
            <label>Email:</label>
            <p>{profile.email}</p>
          </div>
          <div className="profile-detail">
            <label>Emergency Contact:</label>
            {isEditing ? (
              <input
                type="text"
                name="emergencyContact"
                value={profile.emergencyContact}
                onChange={handleChange}
              />
            ) : (
              <p>{profile.emergencyContact}</p>
            )}
          </div>
          <div className="profile-detail">
            <label>Department:</label>
            {isEditing ? (
              <input
                type="text"
                name="department"
                value={profile.department}
                onChange={handleChange}
              />
            ) : (
              <p>{profile.department}</p>
            )}
          </div>
          <div className="profile-detail">
            <label>Date of Birth:</label>
            {isEditing ? (
              <input
                type="date"
                name="dob"
                value={profile.dob}
                onChange={handleChange}
              />
            ) : (
              <p>{profile.dob}</p>
            )}
          </div>
          <div className="profile-detail">
            <label>Father's Name:</label>
            {isEditing ? (
              <input
                type="text"
                name="fatherName"
                value={profile.fatherName}
                onChange={handleChange}
              />
            ) : (
              <p>{profile.fatherName}</p>
            )}
          </div>
          <div className="profile-detail">
            <label>Mother's Name:</label>
            {isEditing ? (
              <input
                type="text"
                name="motherName"
                value={profile.motherName}
                onChange={handleChange}
              />
            ) : (
              <p>{profile.motherName}</p>
            )}
          </div>
          <div className="profile-detail">
            <label>Role:</label>
            {isEditing ? (
              <input
                type="text"
                name="role"
                value={profile.role}
                onChange={handleChange}
              />
            ) : (
              <p>{profile.role}</p>
            )}
          </div>
          <div className="profile-detail">
            <label>Check In Time:</label>
            {isEditing ? (
              <input
                type="time"
                name="checkInTime"
                value={profile.checkInTime}
                onChange={handleChange}
              />
            ) : (
              <p>{profile.checkInTime}</p>
            )}
          </div>
          <div className="profile-detail">
            <label>Check Out Time:</label>
            {isEditing ? (
              <input
                type="time"
                name="checkOutTime"
                value={profile.checkOutTime}
                onChange={handleChange}
              />
            ) : (
              <p>{profile.checkOutTime}</p>
            )}
          </div>
          <div className="profile-detail">
            <label>Date Joined:</label>
            <p>{profile.dateJoined || "N/A"}</p>
          </div>
          <div className="profile-detail">
            <label>Employment Status:</label>
            <p>{profile.employmentStatus}</p>
          </div>
        </div>
        <div className="profile-actions">
          <button className="edit-btn" onClick={handleEdit} disabled={isEditing}>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
          {isEditing && (
            <button className="save-btn" onClick={handleSave}>
              Save Changes
            </button>
          )}
          {!isEditing && (
            <a href="/change-password" className="change-password-link">
              Change Password
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
