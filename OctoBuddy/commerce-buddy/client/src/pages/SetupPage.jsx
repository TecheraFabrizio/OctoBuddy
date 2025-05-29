// InitProjectPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import ProgressBar from "../../components/initPage/ProgressBar"; // Custom ProgressBar component

function InitProjectPage() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleInitProject = async () => {
    // Simulate project initialization with progress
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate async operation
    }
    navigate("/main"); // Redirect to main app page
  };

  return (
    <div>
      <h1>Initialize Project</h1>
      <button onClick={handleInitProject}>Init Project</button>
      <ProgressBar progress={progress} />
    </div>
  );
}

export default InitProjectPage;