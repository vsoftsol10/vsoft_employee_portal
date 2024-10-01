import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig'; // Adjust the import based on your structure
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './TasksAndGroups.css';

const TasksAndGroups = () => {
  const [employees, setEmployees] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newTask, setNewTask] = useState({
    taskName: '',
    taskDetails: '',
    initialSubmit: '',
    finalSubmit: '',
    status: 'on process',
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      const employeeSnapshot = await getDocs(collection(firestore, 'employees'));
      const employeeList = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(employeeList);
    };
    fetchEmployees();
  }, []);

  const handleGiveTask = (employee) => {
    setSelectedEmployee(employee);
    setShowTaskForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmitTask = async () => {
    const { taskName, taskDetails, initialSubmit, finalSubmit, status } = newTask;

    // Validate date inputs
    if (new Date(initialSubmit) >= new Date(finalSubmit)) {
      alert("Initial submit date must be earlier than final submit date.");
      return;
    }

    const taskDetailsObj = {
      taskName,
      taskDetails,
      initialSubmit,
      finalSubmit,
      status,
      fileUrl: '',
    };

    try {
      if (file) {
        const storage = getStorage();
        const storageRef = ref(storage, `tasks/${selectedEmployee.id}/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        taskDetailsObj.fileUrl = downloadURL;
      }

      const taskRef = doc(collection(firestore, 'tasks', selectedEmployee.id, 'taskDetails')); // Subcollection for tasks
      await setDoc(taskRef, taskDetailsObj);

      console.log('New Task saved successfully:', taskDetailsObj);
      alert('Task assigned successfully!'); // User feedback

      setNewTask({ taskName: '', taskDetails: '', initialSubmit: '', finalSubmit: '', status: 'on process' });
      setFile(null);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error saving task. Please try again.'); // User feedback
    }
  };

  return (
    <div className="tasks-groups-container">
      <h2>Working Employees</h2>
      <ul>
        {employees.map(employee => (
          <li key={employee.id}>
            {employee.name}
            <button onClick={() => handleGiveTask(employee)}>Assign Task</button>
          </li>
        ))}
      </ul>

      {showTaskForm && (
        <div className="task-form">
          <h3>Assign Task to {selectedEmployee.name}</h3>
          <input type="text" name="taskName" placeholder="Task Name" value={newTask.taskName} onChange={handleInputChange} />
          <textarea name="taskDetails" placeholder="Task Details" value={newTask.taskDetails} onChange={handleInputChange}></textarea>
          <input type="datetime-local" name="initialSubmit" value={newTask.initialSubmit} onChange={handleInputChange} />
          <input type="datetime-local" name="finalSubmit" value={newTask.finalSubmit} onChange={handleInputChange} />
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleSubmitTask}>Submit Task</button>
          <button onClick={() => setShowTaskForm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default TasksAndGroups;
