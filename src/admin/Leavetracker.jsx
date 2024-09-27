import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../firebaseConfig';
import { doc, getDocs, collection, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Leavetracker.css'; // Import CSS

const Leavetracker = () => {
  const [activeTab, setActiveTab] = useState('latestRequests');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [userUid, setUserUid] = useState('');
  const [leaveDays, setLeaveDays] = useState({ sickLeave: 0, casualLeave: 0, leaveWithoutPay: 0 });
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);
        setLoading(true);
        try {
          await fetchLeaveRequests(user.uid);
          await fetchEmployees();
        } catch (e) {
          setError('Failed to load data.');
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchLeaveRequests = async (uid) => {
    try {
      const leaveRequestsCollection = collection(firestore, 'oftenusers', uid, 'leaveformrequests');
      const leaveSnapshot = await getDocs(leaveRequestsCollection);
      const requests = leaveSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLeaveRequests(requests);
    } catch (error) {
      setError('Failed to fetch leave requests.');
    }
  };

  const fetchEmployees = async () => {
    try {
      const employeesCollection = collection(firestore, 'employees');
      const employeeSnapshot = await getDocs(employeesCollection);
      const employeeList = employeeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(employeeList);
    } catch (error) {
      setError('Failed to fetch employees.');
    }
  };

  const handleLeaveDaysChange = (e) => {
    const { name, value } = e.target;
    setLeaveDays(prev => ({ ...prev, [name]: Number(value) }));
  };

  const saveLeaveRules = async (employeeUid) => {
    const confirmSave = window.confirm("Are you sure you want to save the leave rules?");
    if (!confirmSave) return;

    try {
      const leaveDocRef = doc(firestore, 'leaverules', employeeUid);
      await setDoc(leaveDocRef, leaveDays);
      alert('Leave rules saved successfully!');
    } catch (error) {
      alert('Failed to save leave rules: ' + error.message);
    }
  };

  const handleApplyRulesClick = (employee) => {
    setSelectedEmployee(employee);
    setLeaveDays({ sickLeave: 0, casualLeave: 0, leaveWithoutPay: 0 });
  };

  const handleRequestBack = () => {
    setSelectedRequest(null); // Reset to show the request list
  };

  const latestRequests = leaveRequests.filter(request => request.status === 'pending');
  const pastRequests = leaveRequests.filter(request => ['accepted', 'rejected'].includes(request.status));

  return (
    <div className="leavetracker-container">
      <div className="tabs">
        <button onClick={() => setActiveTab('latestRequests')} className={activeTab === 'latestRequests' ? 'active' : ''}>
          Latest Requests
        </button>
        <button onClick={() => setActiveTab('pastRequests')} className={activeTab === 'pastRequests' ? 'active' : ''}>
          Past Requests
        </button>
        <button onClick={() => setActiveTab('leaveRules')} className={activeTab === 'leaveRules' ? 'active' : ''}>
          Leave Rules
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="content">
          {error && <p className="error">{error}</p>}

          {activeTab === 'latestRequests' && (
            <>
              {selectedRequest ? (
                <div className="request-details">
                  <h3>{selectedRequest.name}'s Leave Request</h3>
                  <p><strong>Leave Type:</strong> {selectedRequest.type}</p>
                  <p><strong>Date From:</strong> {selectedRequest.start}</p>
                  <p><strong>Date To:</strong> {selectedRequest.end}</p>
                  <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                  <p><strong>Status:</strong> {selectedRequest.status}</p>
                  <button onClick={handleRequestBack} className="neon-button back-button">
                    Back to Requests
                  </button>
                </div>
              ) : (
                <div className="request-list">
                  {latestRequests.length > 0 ? (
                    latestRequests.map((request) => (
                      <div key={request.id} className="request-item">
                        <span>{request.name}</span>
                        <button onClick={() => setSelectedRequest(request)} className="neon-button">
                          See Request
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>No latest requests found.</p>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'pastRequests' && (
            <div className="request-list">
              {pastRequests.length > 0 ? (
                pastRequests.map((request) => (
                  <div key={request.id} className="request-item">
                    <span>{request.name}</span>
                    <p><strong>Status:</strong> {request.status}</p>
                  </div>
                ))
              ) : (
                <p>No past requests found.</p>
              )}
            </div>
          )}

          {activeTab === 'leaveRules' && (
            <div className="leave-rules">
              <h2>Working Employees</h2>
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <div key={employee.id} className="employee-item">
                    <p><strong>Name:</strong> {employee.name}</p>
                    <p><strong>Position:</strong> {employee.position}</p>
                    <button onClick={() => handleApplyRulesClick(employee)} className="neon-button">
                      Apply Rules
                    </button>

                    {selectedEmployee && selectedEmployee.id === employee.id && (
                      <div className="leave-rules-form">
                        <h3>Apply Leave Rules for {selectedEmployee.name}</h3>
                        <div className="leave-rule">
                          <h4>Sick Leave</h4>
                          <input
                            type="number"
                            name="sickLeave"
                            value={leaveDays.sickLeave}
                            onChange={handleLeaveDaysChange}
                            placeholder="Set no. of days"
                          />
                        </div>
                        <div className="leave-rule">
                          <h4>Casual Leave</h4>
                          <input
                            type="number"
                            name="casualLeave"
                            value={leaveDays.casualLeave}
                            onChange={handleLeaveDaysChange}
                            placeholder="Set no. of days"
                          />
                        </div>
                        <div className="leave-rule">
                          <h4>Leave Without Pay</h4>
                          <input
                            type="number"
                            name="leaveWithoutPay"
                            value={leaveDays.leaveWithoutPay}
                            onChange={handleLeaveDaysChange}
                            placeholder="Set no. of days"
                          />
                        </div>
                        <button onClick={() => saveLeaveRules(employee.id)} className="neon-button save-settings">
                          Save Leave Rules
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No employees found.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leavetracker;
