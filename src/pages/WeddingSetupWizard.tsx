import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createUser } from '../services/authService';
import { UserRole } from '../types/auth';
import { generateBulkInvitations } from '../services/invitationService';

interface WeddingDetails {
  venue: string;
  ceremonyTime: string;
  receptionTime: string;
  theme: string;
  budget: number;
}

interface TeamMember {
  name: string;
  email: string;
  role: UserRole;
  relationship: string;
}

interface InvitationCode {
  token: string;
  role: UserRole;
  name?: string;
  email?: string;
}

const WeddingSetupWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [weddingDetails, setWeddingDetails] = useState<WeddingDetails>({
    venue: '',
    ceremonyTime: '',
    receptionTime: '',
    theme: '',
    budget: 0,
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState<TeamMember>({
    name: '',
    email: '',
    role: 'organizer',
    relationship: '',
  });
  const [invitationCodes, setInvitationCodes] = useState<InvitationCode[]>([]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAddTeamMember = async () => {
    try {
      if (!user) return;

      // Create user account for team member
      await createUser(newMember.email, Math.random().toString(36).slice(-8), newMember.role, {
        displayName: newMember.name,
        isWeddingAdmin: false,
      });

      setTeamMembers([...teamMembers, newMember]);
      setNewMember({
        name: '',
        email: '',
        role: 'organizer',
        relationship: '',
      });
    } catch (error) {
      setError('Failed to add team member. Please try again.');
      console.error('Error adding team member:', error);
    }
  };

  const handleRemoveTeamMember = (email: string) => {
    setTeamMembers(teamMembers.filter(member => member.email !== email));
  };

  const generateInvitations = async () => {
    try {
      if (!user) return;

      // Generate invitations for team members
      const tokens = await generateBulkInvitations(
        user.uid, // Using user.uid as weddingId
        teamMembers.map(member => ({
          role: member.role,
          email: member.email,
          name: member.name
        })),
        user.uid
      );

      setInvitationCodes(tokens.map((token, index) => ({
        token,
        role: teamMembers[index].role,
        name: teamMembers[index].name,
        email: teamMembers[index].email
      })));

      handleNext();
    } catch (error) {
      setError('Failed to generate invitation codes');
      console.error('Error generating invitations:', error);
    }
  };

  const steps = [
    {
      label: 'Wedding Details',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Wedding Venue"
              fullWidth
              value={weddingDetails.venue}
              onChange={(e) => setWeddingDetails({ ...weddingDetails, venue: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Ceremony Time"
              type="datetime-local"
              fullWidth
              value={weddingDetails.ceremonyTime}
              onChange={(e) => setWeddingDetails({ ...weddingDetails, ceremonyTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Reception Time"
              type="datetime-local"
              fullWidth
              value={weddingDetails.receptionTime}
              onChange={(e) => setWeddingDetails({ ...weddingDetails, receptionTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Wedding Theme"
              fullWidth
              value={weddingDetails.theme}
              onChange={(e) => setWeddingDetails({ ...weddingDetails, theme: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Total Budget"
              type="number"
              fullWidth
              value={weddingDetails.budget}
              onChange={(e) => setWeddingDetails({ ...weddingDetails, budget: Number(e.target.value) })}
            />
          </Grid>
        </Grid>
      ),
    },
    {
      label: 'Wedding Team',
      content: (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Add Team Member</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Name"
                    fullWidth
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={newMember.role}
                      label="Role"
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value as UserRole })}
                    >
                      <MenuItem value="organizer">Organizer</MenuItem>
                      <MenuItem value="vendor">Vendor</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Relationship"
                    fullWidth
                    value={newMember.relationship}
                    onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddTeamMember}
                sx={{ mt: 2 }}
              >
                Add Team Member
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Team Members</Typography>
              <List>
                {teamMembers.map((member) => (
                  <ListItem key={member.email}>
                    <ListItemText
                      primary={member.name}
                      secondary={`${member.role} - ${member.relationship}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleRemoveTeamMember(member.email)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      ),
    },
    {
      label: 'Generate Invitations',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            Team Member Invitation Codes
          </Typography>
          
          {invitationCodes.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Share these invitation codes with your team members. They can use these codes to create their accounts at {window.location.origin}/invite
              </Alert>
              <List>
                {invitationCodes.map((invite, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${invite.name || 'Team Member'} (${invite.role})`}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            Code: <strong>{invite.token}</strong>
                          </Typography>
                          {invite.email && (
                            <Typography variant="body2">
                              Email: {invite.email}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <IconButton
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `Your invitation code for ${window.location.origin}/invite is: ${invite.token}`
                        );
                      }}
                    >
                      <ContentCopy />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography>
                Click the button below to generate invitation codes for your team members.
              </Typography>
              <Button
                variant="contained"
                onClick={generateInvitations}
                sx={{ mt: 2 }}
              >
                Generate Invitation Codes
              </Button>
            </Box>
          )}
        </Box>
      ),
    },
    {
      label: 'Review & Complete',
      content: (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Wedding Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Venue:</Typography>
                  <Typography>{weddingDetails.venue}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Theme:</Typography>
                  <Typography>{weddingDetails.theme}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Ceremony Time:</Typography>
                  <Typography>{new Date(weddingDetails.ceremonyTime).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Reception Time:</Typography>
                  <Typography>{new Date(weddingDetails.receptionTime).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Budget:</Typography>
                  <Typography>${weddingDetails.budget.toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Team Members</Typography>
              <List>
                {teamMembers.map((member) => (
                  <ListItem key={member.email}>
                    <ListItemText
                      primary={member.name}
                      secondary={`${member.role} - ${member.relationship}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Wedding Setup Wizard
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {steps[activeStep].content}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? () => navigate('/dashboard') : handleNext}
          >
            {activeStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default WeddingSetupWizard; 