import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createUser } from "../services/authService";
import { UserRole } from "../types/auth";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    weddingDate: '',
    partnerName: '',
    isWeddingAdmin: false,
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Create the user with admin role if they're setting up a wedding
      const role = formData.isWeddingAdmin ? 'admin' : 'guest';
      await createUser(formData.email, formData.password, role, {
        displayName: formData.displayName,
        weddingDate: formData.weddingDate,
        partnerName: formData.partnerName,
        isWeddingAdmin: formData.isWeddingAdmin,
      });

      navigate('/dashboard');
    } catch (error) {
      setError('Failed to create account. Please try again.');
      console.error('Signup error:', error);
    }
  };

  const steps = [
    {
      label: 'Account Type',
      content: (
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Account Type</InputLabel>
            <Select
              value={formData.isWeddingAdmin ? 'admin' : 'guest'}
              label="Account Type"
              onChange={(e) => setFormData({ ...formData, isWeddingAdmin: e.target.value === 'admin' })}
            >
              <MenuItem value="admin">Wedding Admin (Bride/Groom)</MenuItem>
              <MenuItem value="guest">Guest</MenuItem>
            </Select>
          </FormControl>
        </Box>
      ),
    },
    {
      label: 'Account Details',
      content: (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
        </Box>
      ),
    },
    {
      label: 'Wedding Details',
      content: (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Your Name"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            fullWidth
          />
          <TextField
            label="Partner's Name"
            value={formData.partnerName}
            onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
            fullWidth
          />
          <TextField
            label="Wedding Date"
            type="date"
            value={formData.weddingDate}
            onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Create Account
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          {steps[activeStep].content}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, width: '100%' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            >
              {activeStep === steps.length - 1 ? 'Create Account' : 'Next'}
            </Button>
          </Box>

          <Divider sx={{ width: '100%', my: 3 }} />
          
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/login')}
            >
              Already have an account? Sign In
            </Button>
            
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/invite')}
              color="secondary"
            >
              Have an invitation code? Click here
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignUp; 