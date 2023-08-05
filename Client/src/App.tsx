import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import UserManagementPanel from './UserManagementPanel';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import LogoutButton from './LogOut';
import { HashRouter } from "react-router-dom";

const CenteredContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
});

const ButtonContainer = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  gap: '30px',
  alignItems: 'center',
  justifyContent: 'center',
  listStyle: 'none',
  padding: 0,
  margin: 0,
});

const HeaderContainer = styled(Container)({
  display: 'flex',
  justifyContent:'space-between',
  alignItems: 'center'
});

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));
  const username = localStorage.getItem('username');

  return (
    <HashRouter>
      {!isAuthenticated && (
        <CenteredContainer>
          <div>
            <nav>
              <ul style={{ paddingInlineStart: 0 }}>
                <ButtonContainer>
                  <li>
                    <Button component={Link} to="/login" size="medium" variant="outlined" color="success" sx={{ ":hover": { bgcolor: "#2e7d32", color: 'white' } }}>
                      Log in
                    </Button>
                  </li>
                  <li>
                    <Button component={Link} to="/signup" size="medium" variant="outlined" color="success" sx={{ ":hover": { bgcolor: "#2e7d32", color: 'white' } }}>
                      Sign up
                    </Button>
                  </li>
                </ButtonContainer>
              </ul>
            </nav>
            <Routes>
              <Route path="/login" element={!isAuthenticated ? <LoginForm setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/users" />} />
              <Route path="/signup" element={!isAuthenticated ? <RegistrationForm /> : <Navigate to="/users" />} />
            </Routes>
          </div>
        </CenteredContainer>
      )}
      {isAuthenticated && (
        <Container>
        <HeaderContainer>
          <h1>Hello, {username}</h1>
          <LogoutButton/>
          </HeaderContainer>
          <Routes>
            <Route path="/users" element={<UserManagementPanel />} />
          </Routes>
          </Container>
      )}
    </HashRouter>
  );
};

export default App;
