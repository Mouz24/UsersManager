import React from 'react';
import UserManagementTable from './UserManagementTable';
import { Box, Typography } from '@mui/material';

const UserManagementPanel: React.FC = () => {
  return (
    <Box sx={{ padding: '10px', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        User Management Panel
      </Typography>
      <UserManagementTable />
    </Box>
  );
};

export default UserManagementPanel;