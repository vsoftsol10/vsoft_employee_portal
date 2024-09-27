import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc } from 'firebase/firestore'; // Firebase imports
import './Tasks.css'; // Import the CSS file for styling

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state

  useEffect(() => {
    const fetchTasks = async () => {
      const db = getFirestore();
      try {
        // Reference to the specific group document
        const groupDocRef = doc(db, 'groups', 'KEmc28lDA7YCh5f7884a'); 
        // Reference to the tasks subcollection within that document
        const tasksRef = collection(groupDocRef, 'tasks'); 

        const querySnapshot = await getDocs(tasksRef);
        const tasksList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(tasksList);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks.');
      } finally {
        setLoading(false); // Stop loading regardless of success or error
      }
    };

    fetchTasks();
  }, []);

  const handleStatusUpdate = (id, newStatus) => {
    setTasks(tasks.map(task => (task.id === id ? { ...task, status: newStatus } : task)));
  };

  const filteredTasks = tasks.filter(task => task.status === activeTab);

  return (
    <div className="tasks">
      <div className="tabs">
        <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}>Pending</button>
        <button className={activeTab === 'in-progress' ? 'active' : ''} onClick={() => setActiveTab('in-progress')}>In Progress</button>
        <button className={activeTab === 'completed' ? 'active' : ''} onClick={() => setActiveTab('completed')}>Completed</button>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="task-list">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <div key={task.id} className="task-card">
                <h3>{task.name}</h3>
                <p>{task.description}</p>
                <p><strong>Deadline:</strong> {task.deadline}</p>
                <p><strong>Priority:</strong> {task.priority}</p>
                <button onClick={() => handleStatusUpdate(task.id, task.status === 'completed' ? 'pending' : 'completed')}>
                  {task.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
                </button>
              </div>
            ))
          ) : (
            <p>No tasks found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Tasks;
