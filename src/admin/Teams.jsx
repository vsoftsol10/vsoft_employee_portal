import React, { useState } from 'react';
import './Teams.css';

const Teams = () => {
  const [teams, setTeams] = useState([
    // Sample data
    { id: 1, name: 'Team A', members: [{ name: 'John Doe', jobRole: 'Developer', salary: '50000', level: '5', panCard: 'ABC123', experience: '3 years' }] },
    { id: 2, name: 'Team B', members: [{ name: 'Jane Doe', jobRole: 'Designer', salary: '45000', level: '4', panCard: 'XYZ456', experience: '2 years' }] }
  ]);

  return (
    <div className="teams">
      <h1>Teams & Groups</h1>
      <div className="team-list">
        {teams.map((team) => (
          <div key={team.id} className="team-card">
            <h2>{team.name}</h2>
            <ul>
              {team.members.map((member, index) => (
                <li key={index}>
                  <p>Name: {member.name}</p>
                  <p>Job Role: {member.jobRole}</p>
                  <p>Salary: {member.salary}</p>
                  <p>Level: {member.level}</p>
                  <p>PAN Card: {member.panCard}</p>
                  <p>Experience: {member.experience}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;
