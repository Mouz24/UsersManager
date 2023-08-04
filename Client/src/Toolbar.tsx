import React from 'react';
import { Button, Container } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import { styled } from '@mui/system';

const ManagementButtonContainer = styled(Container)({
  display: 'flex',
  gap: '10px',
  marginBottom: '20px'
});

interface UserToolbarProps {
  selectedUserIds: number[];
  toggleUserBlockStatus: (isBlocked: boolean) => void;
  toggleUserUnblockStatus: (isBlocked: boolean) => void;
  toggleUserDeleteStatus: () => void;
}

const UserToolbar: React.FC<UserToolbarProps> = ({
  selectedUserIds,
  toggleUserBlockStatus,
  toggleUserUnblockStatus,
  toggleUserDeleteStatus,
}) => {
  const handleBlockSelectedUsers = () => {
    selectedUserIds.forEach(() => toggleUserBlockStatus(false));
  };

  const handleUnblockSelectedUsers = () => {
    selectedUserIds.forEach(() => toggleUserUnblockStatus(true));
  };

  const handleDeleteSelectedUsers = () => {
    selectedUserIds.forEach(() => toggleUserDeleteStatus());
  };

  return (
    <ManagementButtonContainer>
      <Button variant="contained" size='medium' onClick={handleBlockSelectedUsers} sx={{bgcolor: '#757575', color: 'white', ":hover": { bgcolor: "#424242"}}}>
        Block
      </Button>
      <Button variant="contained" size='medium' color="success" onClick={handleUnblockSelectedUsers}>
        <CheckIcon />
      </Button>
      <Button variant="outlined" size='medium' color="error">
        <DeleteIcon onClick={handleDeleteSelectedUsers} />
      </Button>
    </ManagementButtonContainer>
  );
};

export default UserToolbar;
