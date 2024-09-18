import React, { useEffect, useState } from 'react';
import { getDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebaseConfig'; // Import Firebase config
import './Profile.css'; // Import the CSS file for styling

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState("https://via.placeholder.com/150");
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    department: '',
    address: '',
    emergencyContact: ''
  });
  const [docExists, setDocExists] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (auth.currentUser) {
        const userRef = doc(firestore, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setProfile(userDoc.data());
          setProfileImage(userDoc.data().profileImage || "https://via.placeholder.com/150");
          setDocExists(true);
        } else {
          setDocExists(false);
          setProfile({
            fullName: '',
            email: auth.currentUser.email || '',
            contactNumber: '',
            department: '',
            address: '',
            emergencyContact: ''
          });
        }
      }
    };
    fetchProfileData();
  }, []);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    if (auth.currentUser) {
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      try {
        if (docExists) {
          await updateDoc(userRef, profile);
        } else {
          await setDoc(userRef, profile);
        }
        console.log("Profile saved:", profile);
        setIsEditing(false);
      } catch (error) {
        console.error("Error saving profile:", error);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      // You might also want to upload the image to Firebase Storage here
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
            <label>Full Name:</label>
            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
              />
            ) : (
              <p>{profile.fullName}</p>
            )}
          </div>
          <div className="profile-detail">
            <label>Email:</label>
            <p>{profile.email}</p>
          </div>
          <div className="profile-detail">
            <label>Contact Number:</label>
            {isEditing ? (
              <input
                type="text"
                name="contactNumber"
                value={profile.contactNumber}
                onChange={handleChange}
              />
            ) : (
              <p>{profile.contactNumber}</p>
            )}
          </div>
          <div className="profile-detail">
            <label>Department:</label>
            <p>{profile.department}</p>
          </div>
          <div className="profile-detail">
            <label>Address:</label>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={profile.address}
                onChange={handleChange}
              />
            ) : (
              <p>{profile.address}</p>
            )}
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
        </div>
        <div className="profile-actions">
          <button className="edit-btn" onClick={handleEdit}>
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
