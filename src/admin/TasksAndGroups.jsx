import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig'; // Adjust the import based on your structure
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './TasksAndGroups.css';

const TasksAndGroups = () => {
  const [employees, setEmployees] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [interns, setInterns] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newTask, setNewTask] = useState({
    taskName: '',
    taskDetails: '',
    initialSubmit: '',
    finalSubmit: '',
    status: 'on process',
  });
  const [file, setFile] = useState(null);
  const [pastTasks, setPastTasks] = useState([]);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0); // Rating out of 100
  const [taskToReview, setTaskToReview] = useState(null);
  const [activeTab, setActiveTab] = useState('assignTask');

  useEffect(() => {
    const fetchEmployees = async () => {
      const employeeSnapshot = await getDocs(collection(firestore, 'employees'));
      const employeeList = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(employeeList);
    };

    const fetchTrainees = async () => {
      const traineeSnapshot = await getDocs(collection(firestore, 'trainees'));
      const traineeList = traineeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrainees(traineeList);
    };

    const fetchInterns = async () => {
      const internSnapshot = await getDocs(collection(firestore, 'interns'));
      const internList = internSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInterns(internList);
    };

    fetchEmployees();
    fetchTrainees();
    fetchInterns();
  }, []);

  const handleGiveTask = (employee) => {
    setSelectedEmployee(employee);
    setActiveTab('assignTask'); // Switch to Assign Task tab when selecting an employee
  };

  const fetchPastTasks = async (employeeId) => {
    const pastTasksSnapshot = await getDocs(collection(firestore, 'tasks', employeeId, 'taskDetails'));
    const pastTaskList = pastTasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPastTasks(pastTaskList);
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
      // Upload file to Firebase Storage if it exists
      if (file) {
        const storage = getStorage();
        const storageRef = ref(storage, `tasks/${selectedEmployee.id}/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        taskDetailsObj.fileUrl = downloadURL; // Save the file URL to the task object
      }

      // Create a reference for the new task document using an auto-generated ID
      const taskRef = doc(collection(firestore, 'tasks', selectedEmployee.id, 'taskDetails')); // Subcollection for tasks
      await setDoc(taskRef, taskDetailsObj); // Save the task details to Firestore

      console.log('New Task saved successfully:', taskDetailsObj);
      alert('Task assigned successfully!');

      // Reset state for new task input
      setNewTask({ taskName: '', taskDetails: '', initialSubmit: '', finalSubmit: '', status: 'on process' });
      setFile(null);
      fetchPastTasks(selectedEmployee.id); // Fetch updated past tasks
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error saving task. Please try again.');
    }
  };

  const handleReviewSubmit = async (taskId) => {
    try {
      const taskRef = doc(firestore, 'tasks', selectedEmployee.id, 'taskDetails', taskId);
      await setDoc(taskRef, { review, rating }, { merge: true }); // Save both review and rating

      alert('Review submitted successfully!');
      setReview(''); // Reset the review input
      setRating(0); // Reset the rating
      setTaskToReview(null);
      fetchPastTasks(selectedEmployee.id);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    }
  };

  const handleCancelTask = () => {
    // Reset the newTask state and file when canceling the task assignment
    setNewTask({ taskName: '', taskDetails: '', initialSubmit: '', finalSubmit: '', status: 'on process' });
    setFile(null);
    setSelectedEmployee(null); // Optionally, reset selected employee
  };

  return (
    <div className="tasks-groups-container">
      <div className="tabs">
        <button onClick={() => setActiveTab('assignTask')} className={activeTab === 'assignTask' ? 'active' : ''}>
          Assign Task
        </button>
        <button onClick={() => {
          setActiveTab('pastTasks');
          if (selectedEmployee) fetchPastTasks(selectedEmployee.id); // Fetch past tasks when this tab is active
        }} className={activeTab === 'pastTasks' ? 'active' : ''}>
          Review Past Tasks
        </button>
      </div>

      <h2>Employees</h2>
      <div className="employee-list">
        {employees.map(employee => (
          <div className="employee-item" key={employee.id}>
            <span>{employee.name}</span>
            {activeTab === 'assignTask' && (
              <button onClick={() => handleGiveTask(employee)}>Assign Task</button>
            )}
            {activeTab === 'pastTasks' && (
              <button onClick={() => {
                setSelectedEmployee(employee); // Set the employee to review past tasks
                fetchPastTasks(employee.id); // Fetch their past tasks
              }}>
                Review Task
              </button>
            )}
          </div>
        ))}
      </div>

      <h2>Trainees</h2>
      <div className="trainee-list">
        {trainees.map(trainee => (
          <div className="trainee-item" key={trainee.id}>
            <span>{trainee.name}</span>
            {activeTab === 'assignTask' && (
              <button onClick={() => handleGiveTask(trainee)}>Assign Task</button>
            )}
            {activeTab === 'pastTasks' && (
              <button onClick={() => {
                setSelectedEmployee(trainee); // Set the trainee to review past tasks
                fetchPastTasks(trainee.id); // Fetch their past tasks
              }}>
                Review Task
              </button>
            )}
          </div>
        ))}
      </div>

      <h2>Interns</h2>
      <div className="intern-list">
        {interns.map(intern => (
          <div className="intern-item" key={intern.id}>
            <span>{intern.name}</span>
            {activeTab === 'assignTask' && (
              <button onClick={() => handleGiveTask(intern)}>Assign Task</button>
            )}
            {activeTab === 'pastTasks' && (
              <button onClick={() => {
                setSelectedEmployee(intern); // Set the intern to review past tasks
                fetchPastTasks(intern.id); // Fetch their past tasks
              }}>
                Review Task
              </button>
            )}
          </div>
        ))}
      </div>

      {activeTab === 'assignTask' && selectedEmployee && (
        <div className="task-form">
          <h3>Assign Task to {selectedEmployee.name}</h3>
          <input type="text" name="taskName" placeholder="Task Name" value={newTask.taskName} onChange={handleInputChange} />
          <textarea name="taskDetails" placeholder="Task Details" value={newTask.taskDetails} onChange={handleInputChange}></textarea>
          <input type="datetime-local" name="initialSubmit" value={newTask.initialSubmit} onChange={handleInputChange} />
          <input type="datetime-local" name="finalSubmit" value={newTask.finalSubmit} onChange={handleInputChange} />
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleSubmitTask}>Submit Task</button>
          <button onClick={handleCancelTask}>Cancel</button>
        </div>
      )}

      {activeTab === 'pastTasks' && selectedEmployee && (
        <div className="past-tasks">
          <h3>Past Tasks for {selectedEmployee.name}</h3>
          {pastTasks.map(task => (
            <div className="past-task-item" key={task.id}>
              <h4>{task.taskName}</h4>
              <p>{task.taskDetails}</p>
              <p>Status: {task.status}</p>
              {task.fileUrl && <a href={task.fileUrl} target="_blank" rel="noopener noreferrer">Download File</a>}
              <button onClick={() => {
                setTaskToReview(task.id); // Set the task to review
                setReview(task.review || ''); // Load existing review
                setRating(task.rating || 0); // Load existing rating
              }}>Review Task</button>
            </div>
          ))}
        </div>
      )}

      {taskToReview && (
        <div className="review-form">
          <h3>Review Task</h3>
          <textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="Write your review here"></textarea>
          <input type="number" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="Rating (out of 100)" />
          <button onClick={() => handleReviewSubmit(taskToReview)}>Submit Review</button>
          <button onClick={() => setTaskToReview(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default TasksAndGroups;
