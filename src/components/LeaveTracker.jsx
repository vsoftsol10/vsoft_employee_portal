import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../firebaseConfig';
import { doc, getDocs, collection, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './LeaveTracker.css'; // Import CSS

const Leavetracker = () => {
  const [activeTab, setActiveTab] = useState('latestRequests');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [userUid, setUserUid] = useState('');
  const [leaveDetails, setLeaveDetails] = useState({ name: '', dateFrom: '', dateTo: '', reason: '', leaveType: {} });
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);
        setLoading(true);
        await fetchLeaveRequests(user.uid);
        await fetchEmployees();
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch leave requests from Firestore
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
      console.error('Error fetching leave requests:', error);
      setError('Failed to fetch leave requests.');
    }
  };

  // Fetch employee list from Firestore
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
      console.error('Error fetching employees:', error);
      setError('Failed to fetch employees.');
    }
  };

  const handleLeaveDetailsChange = (e) => {
    const { name, value } = e.target;
    if (name === 'leaveType') {
      setLeaveDetails(prev => ({ ...prev, leaveType: { ...prev.leaveType, [value]: '' } }));
    } else {
      setLeaveDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  // Save leave rules to Firestore for an employee
  const saveLeaveRules = async (employeeUid) => {
    const confirmSave = window.confirm("Are you sure you want to save the leave rules?");
    if (!confirmSave) return;

    try {
      const leaveData = {
        Name: leaveDetails.name,
        datefrom: leaveDetails.dateFrom,
        dateto: leaveDetails.dateTo,
        reason: leaveDetails.reason,
        type: {
          Sick: leaveDetails.leaveType.Sick || '',
          casual: leaveDetails.leaveType.casual || '',
          lwp: leaveDetails.leaveType.lwp || '',
        },
      };

      const leaveDocRef = doc(firestore, `leaverules/${employeeUid}/formrequests/form`);
      await setDoc(leaveDocRef, leaveData);

      alert('Leave rules saved successfully!');
      setLeaveDetails({ name: '', dateFrom: '', dateTo: '', reason: '', leaveType: {} });
    } catch (error) {
      console.error('Error saving leave rules:', error);
      alert('Failed to save leave rules.');
    }
  };

  const handleApplyRulesClick = (employee) => {
    setSelectedEmployee(employee);
    setLeaveDetails({ name: '', dateFrom: '', dateTo: '', reason: '', leaveType: {} });
  };

  // Filter leave requests into latest and past
  const latestRequests = leaveRequests.filter(request => request.status === 'pending');
  const pastRequests = leaveRequests.filter(request => request.status === 'accepted' || request.status === 'rejected');

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
        <p>Loading...</p>
      ) : (
        <div className="content">
          {error && <p className="error">{error}</p>}

          {activeTab === 'latestRequests' && (
            <>
              {selectedRequest ? (
                <div className="request-details">
                  <h3>{selectedRequest.name}'s Leave Request</h3>
                  <p><strong>Leave Type:</strong> {selectedRequest.type}</p>
                  <p><strong>Date From:</strong> {selectedRequest.dateFrom}</p>
                  <p><strong>Date To:</strong> {selectedRequest.dateTo}</p>
                  <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                  <p><strong>Status:</strong> {selectedRequest.status}</p>
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
                          <h4>Leave Type</h4>
                          <select name="leaveType" value={leaveDetails.leaveType} onChange={handleLeaveDetailsChange}>
                            <option value="">Select Leave Type</option>
                            <option value="Sick">Sick Leave</option>
                            <option value="casual">Casual Leave</option>
                            <option value="lwp">Leave Without Pay</option>
                          </select>
                        </div>
                        <div className="leave-rule">
                          <h4>Date From</h4>
                          <input
                            type="date"
                            name="dateFrom"
                            value={leaveDetails.dateFrom}
                            onChange={handleLeaveDetailsChange}
                          />
                        </div>
                        <div className="leave-rule">
                          <h4>Date To</h4>
                          <input
                            type="date"
                            name="dateTo"
                            value={leaveDetails.dateTo}
                            onChange={handleLeaveDetailsChange}
                          />
                        </div>
                        <div className="leave-rule">
                          <h4>Reason</h4>
                          <input
                            type="text"
                            name="reason"
                            value={leaveDetails.reason}
                            onChange={handleLeaveDetailsChange}
                            placeholder="Enter leave reason"
                          />
                        </div>
                        <div className="leave-rule">
                          <h4>Name</h4>
                          <input
                            type="text"
                            name="name"
                            value={leaveDetails.name}
                            onChange={handleLeaveDetailsChange}
                            placeholder="Enter employee name"
                          />
                        </div>
                        <button onClick={() => saveLeaveRules(employee.id)} className="neon-button">
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

