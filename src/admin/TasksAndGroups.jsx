import React, { useState } from 'react';
import { firestore } from '../firebaseConfig'; // Adjust the import based on your structure
import { collection, doc, setDoc } from 'firebase/firestore';
import './TasksAndGroups.css';

const TasksAndGroups = () => {
  const [showForm, setShowForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [planFile, setPlanFile] = useState(null);
  const [details, setDetails] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    taskName: '',
    taskDetails: '',
    assignedTo: '',
    initialSubmit: '',
    finalSubmit: '',
    status: 'on process',
    reviews: 0,
  });

  const handleCreateGroup = () => setShowForm(true);

  const handleFileChange = (e) => setPlanFile(e.target.files[0]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  const handleSubmitTask = () => {
    setTasks([...tasks, newTask]);
    setNewTask({
      taskName: '',
      taskDetails: '',
      assignedTo: '',
      initialSubmit: '',
      finalSubmit: '',
      status: 'on process',
      reviews: 0,
    });
  };

  const handleSubmitGroup = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      // Create a new group document
      const groupRef = doc(collection(firestore, 'groups'));
      await setDoc(groupRef, {
        groupName,
        projectName,
        details,
        planFile: planFile ? planFile.name : null, // Store the file name or handle file upload separately
      });

      // Create a sub-collection for tasks
      const tasksRef = collection(groupRef, 'tasks');
      for (const task of tasks) {
        await setDoc(doc(tasksRef), task);
      }

      // Clear the form and tasks
      setGroupName('');
      setProjectName('');
      setPlanFile(null);
      setDetails('');
      setTasks([]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating group: ', error);
    }
  };

  return (
    <div className="tasks-groups-container">
      <button className="create-group-btn" onClick={handleCreateGroup}>+ Create Group</button>
      {showForm && (
        <div className="group-form">
          <h2>Create New Group</h2>
          <form onSubmit={handleSubmitGroup}>
            <div className="form-group">
              <label htmlFor="groupName">Group Name</label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="projectName">Project Name</label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="planFile">Plan File (PDF)</label>
              <input
                type="file"
                id="planFile"
                accept=".pdf"
                onChange={handleFileChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="details">Details</label>
              <textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <h3>Split Tasks</h3>
              <table>
                <thead>
                  <tr>
                    <th>Tasks</th>
                    <th>Details</th>
                    <th>Assigned to</th>
                    <th>Initial Submit</th>
                    <th>Final Submit</th>
                    <th>Status</th>
                    <th>Reviews</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, index) => (
                    <tr key={index}>
                      <td>{task.taskName}</td>
                      <td>{task.taskDetails}</td>
                      <td>{task.assignedTo}</td>
                      <td>{task.initialSubmit}</td>
                      <td>{task.finalSubmit}</td>
                      <td>{task.status}</td>
                      <td>
                        {task.status === 'final submitted' ? (
                          <div className="reviews">
                            {[...Array(10)].map((_, i) => (
                              <span key={i} className={`star ${task.reviews > i ? 'filled' : ''}`}>&#9733;</span>
                            ))}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={() => setShowForm(true)}>+ Create Task</button>
              {showForm && (
                <div className="task-form">
                  <h4>Create New Task</h4>
                  <div className="form-group">
                    <label htmlFor="taskName">Task Name</label>
                    <input
                      type="text"
                      id="taskName"
                      name="taskName"
                      value={newTask.taskName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="taskDetails">Task Details</label>
                    <textarea
                      id="taskDetails"
                      name="taskDetails"
                      value={newTask.taskDetails}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label htmlFor="assignedTo">Assigned To</label>
                    <input
                      type="text"
                      id="assignedTo"
                      name="assignedTo"
                      value={newTask.assignedTo}
                      onChange={handleInputChange}
                      placeholder="@username"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="initialSubmit">Initial Submit</label>
                    <input
                      type="date"
                      id="initialSubmit"
                      name="initialSubmit"
                      value={newTask.initialSubmit}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="finalSubmit">Final Submit</label>
                    <input
                      type="date"
                      id="finalSubmit"
                      name="finalSubmit"
                      value={newTask.finalSubmit}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={newTask.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="on process">On Process</option>
                      <option value="initial submitted">Initial Submitted</option>
                      <option value="final submitted">Final Submitted</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <button type="button" onClick={handleSubmitTask}>Submit Task</button>
                  </div>
                </div>
              )}
            </div>
            <button type="submit">Create Group</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TasksAndGroups;
