import * as React from 'react';
import Card from '@mui/joy/Card';
import CardCover from '@mui/joy/CardCover';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import { Link } from 'react-router-dom'; // Import Link for navigation
import './Home.css'; // Import the CSS file for styling

const CardComponent = ({ title, imageUrl, linkTo, hideTitle = false }) => {
  return (
    <Link to={linkTo} className="card-link">
      <Card className="card">
        <CardCover>
          <img
            src={imageUrl}
            alt={title}
          />
        </CardCover>
        <CardCover
          sx={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0) 200px), linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0) 300px)',
          }}
        />
        <CardContent className={`card-content ${hideTitle ? 'hide-title' : ''}`}>
          <Typography className="card-title">
            {title}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
};

const Home = () => {
  return (
    <div className="cards-container">
      <CardComponent
        title=""
        imageUrl="/assets/attendance.jpg" // Path to local image
        linkTo="/page1" // Link to another page
        hideTitle={true} // Hide title for Attendance card
      />
      <CardComponent
        title="Leave"
        imageUrl="/assets/leave.jfif" // Path to local image
        linkTo="/page2" // Link to another page
      />
      <CardComponent
        title="Tasks"
        imageUrl="/assets/tasks.jpg" // Path to local image
        linkTo="/page3" // Link to another page
      />
    </div>
  );
};

export default Home;
