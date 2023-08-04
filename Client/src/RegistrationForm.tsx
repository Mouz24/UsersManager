import { isAxiosError } from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './AxiosInstance'
import { Box, Button, TextField } from '@mui/material';

interface RegistrationFormProps {
  onSubmit: (formData: RegistrationFormData) => void;
}

interface RegistrationFormData {
  email: string;
  username: string;
  password: string;
  error: string;
}

const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    username: '',
    email: '',
    password: '',
    error: ''
  });

  const navigate = useNavigate();

  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
      error: ''
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    const { username, password, email } = formData;
    if (!username || !password || !email) {
      setFormData((prevFormData) => ({ ...prevFormData, error: 'Please fill in all fields.' }));
      return;
    }
  
    try {
      await axiosInstance.post('signup', formData);
      navigate('/login');
    } catch (error: any) {
      if (isAxiosError(error)) {
        if (error.response) {
          const responseData = error.response.data;
          if (responseData) {
            if (responseData.DuplicateUserName && responseData.DuplicateUserName.length > 0) {
              console.error('Error registration:', responseData.DuplicateUserName[0]);
              setUsernameError(responseData.DuplicateUserName[0]);
              setEmailError('');
            } else if (responseData.DuplicateEmail && responseData.DuplicateEmail.length > 0) {
              console.error('Error registration:', responseData.DuplicateEmail[0]);
              setEmailError(responseData.DuplicateEmail[0]);
              setUsernameError('');
            }
          } 
        } else {
          console.error('Error registration:', 'An error occurred during registration.');
          setFormData((prevFormData) => ({ ...prevFormData, error: 'An error occurred during registration.' }));
        }
      } else {
        console.error('Unknown Error:', 'An unknown error occurred during registration.');
        setFormData((prevFormData) => ({ ...prevFormData, error: 'An unknown error occurred during registration.' }));
      }
    }
  };

  return (
    <Box component="form" sx={{
      '& .MuiTextField-root': { m: 1, width: '25ch' }, 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}
    noValidate autoComplete="on" 
    onSubmit={handleSubmit}>
      <div>
      <TextField
        label={usernameError ? 'Error' : 'Username'}
        variant="outlined"
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        error={Boolean(usernameError)}
        helperText={usernameError || ''}
      />
      </div>
      <div>
        <TextField
          label={emailError ? 'Error' : 'Email'}
          variant="outlined"
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={Boolean(emailError)}
          helperText={emailError || ''}
        />
      </div>
      <div>
        <TextField
          label={'Password'}
          variant="outlined"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>
      <div>
        <Button variant="contained" color="success" type="submit">
          Sign up
        </Button>
      </div>
    </Box>
  );
};

export default RegistrationForm;