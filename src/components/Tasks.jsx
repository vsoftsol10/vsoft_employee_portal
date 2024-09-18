import React, { useState } from 'react';
import './Tasks.css'; // Import the CSS file for styling

const Tasks = () => {
  // Dummy data for demonstration
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Task 1', description: 'Description for task 1', deadline: '2024-09-15', priority: 'High', status: 'pending' },
    { id: 2, name: 'Task 2', description: 'Description for task 2', deadline: '2024-09-20', priority: 'Medium', status: 'in-progress' },
    { id: 3, name: 'Task 3', description: 'Description for task 3', deadline: '2024-09-25', priority: 'Low', status: 'completed' },
  ]);

  const [activeTab, setActiveTab] = useState('pending');

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

      <div className="task-list">
        {filteredTasks.map(task => (
          <div key={task.id} className="task-card">
            <h3>{task.name}</h3>
            <p>{task.description}</p>
            <p><strong>Deadline:</strong> {task.deadline}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <button onClick={() => handleStatusUpdate(task.id, task.status === 'completed' ? 'pending' : 'completed')}>
              {task.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
