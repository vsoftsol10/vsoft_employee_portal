import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { firestore } from '../firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [pastTasks, setPastTasks] = useState([]);

  const auth = getAuth();
  const uid = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    const fetchTasks = async () => {
      if (!uid) return;

      try {
        const tasksSnapshot = await getDocs(collection(firestore, 'tasks', uid, 'taskDetails'));
        const taskList = await Promise.all(tasksSnapshot.docs.map(async (doc) => {
          const taskData = { id: doc.id, ...doc.data() };
          const imageUrl = await fetchImageUrl(taskData.fileUrl);
          return { ...taskData, imageUrl };
        }));

        setTasks(taskList);
        const pastTasksData = taskList.filter(task => task.status === 'final submitted');
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

  const updateStatus = async (taskId, newStatus) => {
    const confirmUpdate = window.confirm('Are you sure you want to update the status of this task?');
    if (!confirmUpdate) return; // Exit if the user cancels

    try {
      // Prompt for description based on status
      const description = prompt(`Please provide a description for the ${newStatus === 'initial submitted' ? 'initial submission' : 'final submission'}:`);

      // Check if a description is provided
      if (description) {
        const taskRef = doc(firestore, 'tasks', uid, 'taskDetails', taskId);
        
        // Update Firestore with status and description
        await updateDoc(taskRef, { 
          status: newStatus, 
          description: description // Add the description to the Firestore document
        });
        
        // Update local state
        setTasks(tasks.map(task => (task.id === taskId ? { ...task, status: newStatus, description } : task)));
        alert('Task status updated successfully!');
      } else {
        alert('Description is required to update the status.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };
  
  const handleViewDetails = (taskId) => {
    setSelectedTaskId(taskId === selectedTaskId ? null : taskId);
  };

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="tasks">
      <h2>Your Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks assigned.</p>
      ) : (
        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id} className="task-card">
              <h3>{task.taskName}</h3>
              <button onClick={() => handleViewDetails(task.id)}>
                {selectedTaskId === task.id ? 'Hide Details' : 'View Details'}
              </button>
              {selectedTaskId === task.id && (
                <div className="task-details">
                  <p>{task.taskDetails}</p>
                  <p>Initial Submit: {task.initialSubmit}</p>
                  <p>Final Submit: {task.finalSubmit}</p>
                  <p>Status: {task.status}</p>
                  {task.imageUrl && <img src={task.imageUrl} alt="Task File" />}
                  <button onClick={() => updateStatus(task.id, 'initial submitted')}>Mark as Initial Submitted</button>
                  <button onClick={() => updateStatus(task.id, 'final submitted')}>Mark as Final Submitted</button>
                  {task.fileUrl && (
                    <a href={task.fileUrl} target="_blank" rel="noopener noreferrer">View File</a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <h3>Past Tasks</h3>
      {pastTasks.length === 0 ? (
        <p>No past tasks available.</p>
      ) : (
        <ul>
          {pastTasks.map(task => (
            <li key={task.id}>
              <h3>{task.taskName}</h3>
              {/* Removed review and rating display */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Tasks;
