import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { auth, firestore } from '../firebaseConfig';
import './Dashboard.css';
import { FiBell } from 'react-icons/fi'; // Notification Bell Icon

const Dashboard = () => {
  const navigate = useNavigate(); // hook for navigation
  const [profileImage, setProfileImage] = useState(null);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [pastTasks, setPastTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDaytime, setIsDaytime] = useState(true);
  const [weather, setWeather] = useState(null);
  const [notifications, setNotifications] = useState(5); // Number of notifications

  const authInstance = getAuth();
  const uid = authInstance.currentUser ? authInstance.currentUser.uid : null;

  // API Key for WeatherAPI
  const API_KEY = '07fc7d3512204a3f9c895258240611';
  const location = 'Tirunelveli'; // You can change this to any other location

  useEffect(() => {
    const currentUser = authInstance.currentUser;
    if (currentUser) {
      setUser(currentUser);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      const uid = user.uid;
      const storage = getStorage();
      const profileImageRef = ref(storage, `users/${uid}/profile.jpg`);

      getDownloadURL(profileImageRef)
        .then((url) => {
          setProfileImage(url);
        })
        .catch((error) => {
          console.error('Error fetching profile image:', error);
          setProfileImage(null);
        });
    }
  }, [user]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      setIsDaytime(now.getHours() >= 6 && now.getHours() < 18);
    };
    updateTime();
    const intervalId = setInterval(updateTime, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}&aqi=no`
        );
        const data = await response.json();
        if (response.ok) {
          setWeather(data);
        } else {
          console.error('Error fetching weather data:', data.error.message);
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeather();
  }, [location, API_KEY]);

  const handleLogout = () => {
    authInstance.signOut().then(() => {
      navigate('/login');
    });
  };

  const formatDate = (date) => {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  // Fetch tasks from Firestore
  useEffect(() => {
    const fetchTasks = async () => {
      if (!uid) return;

      try {
        const tasksSnapshot = await getDocs(collection(firestore, 'tasks', uid, 'taskDetails'));
        const taskList = await Promise.all(
          tasksSnapshot.docs.map(async (doc) => {
            const taskData = { id: doc.id, ...doc.data() };
            const imageUrl = await fetchImageUrl(taskData.fileUrl);
            return { ...taskData, imageUrl };
          })
        );

        setTasks(taskList);
        const pastTasksData = taskList.filter((task) => task.status === 'final submitted');
        setPastTasks(pastTasksData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    };

    const fetchImageUrl = async (imagePath) => {
      if (!imagePath) return '';
      const storage = getStorage();
      const fileRef = ref(storage, imagePath);
      try {
        return await getDownloadURL(fileRef);
      } catch (error) {
        console.error('Error fetching image URL:', error);
        return '';
      }
    };

    fetchTasks();
  }, [uid]);

  const handleViewDetails = (taskId) => {
    setSelectedTaskId(taskId === selectedTaskId ? null : taskId);
  };

  // Handle notification icon click
  const handleNotificationClick = () => {
    navigate('/notification'); // Redirect to /notification route
  };

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="dashboard-container">
      {/* Notification Icon */}
      <div className="dashboard-notification-btn" onClick={handleNotificationClick}>
        <FiBell size={24} color="#fff" /> {/* Bell Icon */}
        {notifications > 0 && (
          <div className="notification-bubble">
            {notifications}
          </div>
        )}
      </div>

      <div className="dashboard-profile-card">
        {profileImage ? (
          <img src={profileImage} alt="Profile" className="dashboard-profile-img" />
        ) : (
          <div className="dashboard-placeholder-img">No Image Available</div>
        )}
        <div>
          <h3>{user ? user.displayName : 'User'}</h3>
          <Link to="/profile">
            <button className="dashboard-btn dashboard-profile-btn">View Profile</button>
          </Link>
          <button onClick={handleLogout} className="dashboard-logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-time-card">
        <img
          src={isDaytime ? '/assets/sunimage.png' : '/assets/moonimage.jpeg'}
          alt={isDaytime ? 'Sun' : 'Moon'}
          className="dashboard-time-icon"
        />
        <h4>Current Time & Date</h4>
        <p>{formatDate(currentTime)}</p>
      </div>

      <div className="dashboard-weather-card">
        {weather ? (
          <div>
            <h4>Weather in {weather.location.name}</h4>
            <p>{weather.current.condition.text}</p>
            <p>{weather.current.temp_c}°C</p>
            <img
              src={weather.current.condition.icon}
              alt={weather.current.condition.text}
              className="dashboard-weather-icon"
            />
          </div>
        ) : (
          <p>Loading weather...</p>
        )}
      </div>

      <div className="dashboard-tasks-card">
        <h4>Tasks</h4>
        {tasks.length === 0 ? (
          <p>No tasks available.</p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className="task-item">
                <div className="task-details">
                  <span className="task-name">{task.title}</span>
                  <span className="task-status">{task.status}</span>
                  <button 
                    className="tasksdashboard" 
                    onClick={() => handleViewDetails(task.id)}
                  >
                    {selectedTaskId === task.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
                {selectedTaskId === task.id && (
                  <div className="task-description">
                    <p>{task.description}</p>
                    {task.imageUrl && <img src={task.imageUrl} alt="Task Attachment" className="task-image" />}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
