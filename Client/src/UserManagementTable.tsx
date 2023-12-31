import React, { useState, useEffect } from 'react';
import axiosInstance from './AxiosInstance';
import { Checkbox, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import UserToolbar from './Toolbar';
import { useNavigate } from 'react-router-dom';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

interface User {
  id: number;
  username: string;
  email: string;
  lastLoginDate: string;
  registrationDate: string;
  isBlocked: boolean;
}

const UserManagementTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const accessToken = localStorage.getItem('accessToken');
  const username = localStorage.getItem('username');
  const navigate = useNavigate();
  const LoggedInUser = users.find((user) => user.username === username);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {}, [selectedUserIds]);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get<User[]>('users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [users]);

  const handleLogout = async () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const toggleUserBlockStatus = async (isBlocked: boolean) => {
    try {
      const loggedInUser = users.find((user) => user.username === username);
      if (!loggedInUser || loggedInUser.isBlocked)
      {
        handleLogout();
      } else {
        await axiosInstance.put(`users/block`, selectedUserIds);
        
        const loggedInUserId = getUserId();
        if (loggedInUserId !== undefined && selectedUserIds.includes(loggedInUserId)) {
        handleLogout();
        } else {
          setSelectedUserIds([]);
        }
      }} catch (error) {
        console.error('Error updating user block status:', error);
    }
  };

  const toggleUserUnblockStatus = async (isBlocked: boolean) => {
    try {
      if (!LoggedInUser || LoggedInUser.isBlocked)
      {
        handleLogout();
      } else {
        await axiosInstance.put(`users/unblock`, selectedUserIds);
        setSelectedUserIds([]);
      }} catch (error) {
        console.error('Error updating user block status:', error);
    }
  };

  const toggleUserDeleteStatus = async () => {
    try {
      if (!LoggedInUser || LoggedInUser.isBlocked) {
        handleLogout();
      } else {
        const loggedInUserId = getUserId();
        if (loggedInUserId !== undefined && selectedUserIds.includes(loggedInUserId)) {
          handleLogout();
        } else {
          await axiosInstance.delete(`users/delete`, {
            data: selectedUserIds,
          });

          const updatedUsers = users.filter((user) => !selectedUserIds.includes(user.id));
          setUsers(updatedUsers);
          setSelectedUserIds([]);
        }
      }
      fetchUsers();
    } catch (error) {
      console.error('Error updating user delete status:', error);
    }
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUserIds(prevSelectedIds => {
      if (prevSelectedIds.includes(userId)) {
        return prevSelectedIds.filter(id => id !== userId);
      } else {
        return [...prevSelectedIds, userId];
      }
    });
  };

  const handleSelectAllUsers = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(user => user.id));
    }
  };

  const getUserId = (): number | undefined => {
    const loggedInUser = users.find(user => user.username === username);
    return loggedInUser?.id;
  };

  const renderUserRows = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const visibleUsers = users.slice(startIndex, endIndex);
  
    return visibleUsers.map((user) => (
    <TableRow key={user.id}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selectedUserIds.includes(user.id)}
          onChange={() => handleSelectUser(user.id)}
        />
      </TableCell>
      <TableCell>{user.id}</TableCell>
      <TableCell>{user.username}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.lastLoginDate}</TableCell>
      <TableCell>{user.registrationDate}</TableCell>
      <TableCell>{user.isBlocked ? 'Blocked' : 'Active'}</TableCell>
    </TableRow>
  ));
  }

  return (
    <>
      <UserToolbar
        selectedUserIds={selectedUserIds}
        toggleUserBlockStatus={toggleUserBlockStatus}
        toggleUserUnblockStatus={toggleUserUnblockStatus}
        toggleUserDeleteStatus={toggleUserDeleteStatus}
      />
      <TableContainer>
        <Table
          aria-labelledby="tableTitle"
          size="small"
          style={{ height: 300 }}
        >
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selectedUserIds.length > 0 && selectedUserIds.length < users.length}
                  checked={users.length > 0 && selectedUserIds.length === users.length}
                  onChange={handleSelectAllUsers}
                />
              </TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Last Login Time</TableCell>
              <TableCell>Registration Time</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderUserRows()}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      </>
  );
};

export default UserManagementTable;