import React from 'react';
import { Button } from '@mui/material';
import UpdateIcon from '@mui/icons-material/Update';
import PropTypes from "prop-types"; // Import PropTypes

const ButtonUpdate = ({ selectedRepo, reloadData }) => {
  const handleUpdate = () => {
    if (selectedRepo) {
      // Perform the clone action here.
      // For example, making a request to your server to start the cloning process.
      console.log(`Updating repository: ${selectedRepo}`);

      // Here you can make an API call to your server to trigger the clone
      fetch(`/api/update-repository?repo=${selectedRepo}`)
        .then((response) => response)
        .then((data) => {
          console.log("Update response:", data);
          reloadData();
        })
        .catch((error) => {
          console.error("Error updating repository:", error);
        });
    } else {
      console.log("No repository selected.");
    }
  };
  return (
    <div>
      <Button
        startIcon={<UpdateIcon />}
        size="large"
        color="secondary"
        variant="contained"
        onClick={handleUpdate}
      >
        Update
      </Button>
    </div>
  );
};

ButtonUpdate.propTypes = {
  selectedRepo: PropTypes.string, // or PropTypes.object if it's an object
};

export default ButtonUpdate;
