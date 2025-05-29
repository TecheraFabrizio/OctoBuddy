import React from 'react';
import { Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PropTypes from 'prop-types';

const ButtonDeploy = ({ selectedRows, selectedWebsite }) => {
  const handleDeploy = async () => {
    if (!selectedRows || selectedRows.length === 0) {
      alert('No repositories selected for deployment.');
      return;
    }
    try {

      //selected rows: ([id: 0, repository: 'blog', branch: 'main'])
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositories: selectedRows, website: selectedWebsite }),
      });

      if (!response.ok)
        throw new Error('Failed to deploy selected repositories');

      const result = await response.json();
      console.log('Deployment result:', result);
    } catch (error) {
      console.error('Error during deployment:', error);
    }
  };

  return (
    <div>
      <Button
        startIcon={<CloudUploadIcon />}
        size="large"
        color="success"
        variant="contained"
        onClick={handleDeploy}
      >
        Deploy Selection
      </Button>
    </div>
  );
};

// Define propTypes for the component
ButtonDeploy.propTypes = {
  selectedRows: PropTypes.array.isRequired, // Correctly define selectedRows as an array
  selectedWebsite: PropTypes.string,
};

export default ButtonDeploy;
