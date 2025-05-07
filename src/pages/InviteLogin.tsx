import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { validateInvitationToken, createUserWithInvitation } from '../services/invitationService';

const InviteLogin: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [formData, setFormData] = useState({
    token: '',
    displayName: '',
    password: '',
    confirmPassword: '',
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateToken = async () => {
    try {
      const invitation = await validateInvitationToken(formData.token);
      setInvitationData(invitation);
      handleNext();
    } catch (error: any) {
      setError(error.message || 'Invalid invitation code');
    }
  };

  const handleSubmit = async () => {
    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      await createUserWithInvitation(
        invitationData.invitationId,
        formData.password,
        formData.displayName
      );

      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    }
  };

  const steps = [
    {
      label: 'Enter Invitation Code',
      content: (
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Invitation Code"
            value={formData.token}
            onChange={(e) => setFormData({ ...formData, token: e.target.value })}
            fullWidth
            placeholder="Enter the code provided by the wedding admin"
          />
          <Button
            variant="contained"
            onClick={validateToken}
            fullWidth
            sx={{ mt: 2 }}
          >
            Verify Code
          </Button>
        </Box>
      ),
    },
    {
      label: 'Create Account',
      content: (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Valid invitation code for {invitationData?.role}
          </Alert>
          <TextField
            label="Your Name"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            fullWidth
          />
          <TextField
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            fullWidth
          >
            Create Account
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Wedding Guest Login
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4, width: '100%' }}>
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {steps[activeStep].content}

          {activeStep === 1 && (
            <Button
              onClick={handleBack}
              sx={{ mt: 2 }}
            >
              Back
            </Button>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default InviteLogin; 