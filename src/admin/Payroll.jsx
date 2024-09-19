import React, { useState } from 'react';
import './Payroll.css';

const Payroll = () => {
  const [presentDays, setPresentDays] = useState(0);
  const [absentDays, setAbsentDays] = useState(0);
  const [salary, setSalary] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [increment, setIncrement] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCalculate = () => {
    const totalSalary = salary + increment - deductions;
    alert(`Net Salary: ₹${totalSalary}`);
  };

  return (
    <div className="payroll-page">
      <h1>Payroll Calculation</h1>
      <div className="payroll-form">
        <div>
          <label>Year:</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Salary:</label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            placeholder="Basic Salary"
          />
        </div>
        <div>
          <label>Present Days:</label>
          <input
            type="number"
            value={presentDays}
            onChange={(e) => setPresentDays(Number(e.target.value))}
            placeholder="Number of Present Days"
          />
        </div>
        <div>
          <label>Absent Days:</label>
          <input
            type="number"
            value={absentDays}
            onChange={(e) => setAbsentDays(Number(e.target.value))}
            placeholder="Number of Absent Days"
          />
        </div>
        <div>
          <label>Deductions:</label>
          <input
            type="number"
            value={deductions}
            onChange={(e) => setDeductions(Number(e.target.value))}
            placeholder="Deductions"
          />
        </div>
        <div>
          <label>Increment:</label>
          <input
            type="number"
            value={increment}
            onChange={(e) => setIncrement(Number(e.target.value))}
            placeholder="Increment"
          />
        </div>
        <div>
          <label>Upload Attendance File:</label>
          <input
            type="file"
            onChange={handleFileChange}
          />
        </div>
        <button onClick={handleCalculate}>Calculate</button>
      </div>
    </div>
  );
};

export default Payroll;
