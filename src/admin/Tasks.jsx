import React, { useState } from 'react';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Task 1', status: 'pending' },
    { id: 2, name: 'Task 2', status: 'in progress' },
    { id: 3, name: 'Task 3', status: 'completed' }
  ]);

  const filterTasks = (status) => tasks.filter(task => task.status === status);

  return (
    <div className="tasks">
      <h1>Tasks</h1>
      <div className="task-section">
        <h2>Pending Tasks</h2>
        <ul>
          {filterTasks('pending').map(task => (
            <li key={task.id}>{task.name}</li>
          ))}
        </ul>
      </div>
      <div className="task-section">
        <h2>In Progress</h2>
        <ul>
          {filterTasks('in progress').map(task => (
            <li key={task.id}>{task.name}</li>
          ))}
        </ul>
      </div>
      <div className="task-section">
        <h2>Completed</h2>
        <ul>
          {filterTasks('completed').map(task => (
            <li key={task.id}>{task.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Tasks;
