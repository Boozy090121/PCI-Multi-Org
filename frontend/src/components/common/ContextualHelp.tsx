import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Popover,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import {
  Help as HelpIcon,
  Info as InfoIcon,
  Lightbulb as TipIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Keyboard as KeyboardIcon
} from '@mui/icons-material';

// Slide transition for dialogs
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface HelpTooltipProps {
  title: string;
  content: string | React.ReactNode;
  type?: 'info' | 'tip' | 'warning';
}

// Help tooltip component
const HelpTooltip: React.FC<HelpTooltipProps> = ({ title, content, type = 'info' }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'help-popover' : undefined;

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'info':
        return <InfoIcon color="info" />;
      case 'tip':
        return <TipIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  return (
    <>
      <Tooltip title="Click for help">
        <IconButton
          size="small"
          aria-describedby={id}
          onClick={handleClick}
          color={type === 'info' ? 'info' : type === 'tip' ? 'success' : 'warning'}
        >
          <HelpIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Paper sx={{ p: 2, maxWidth: 320 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {getIcon()}
            <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 'bold' }}>
              {title}
            </Typography>
          </Box>
          <Typography variant="body2">
            {content}
          </Typography>
        </Paper>
      </Popover>
    </>
  );
};

// Keyboard shortcuts dialog component
const KeyboardShortcutsDialog: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const shortcuts = [
    { key: 'Ctrl + S', description: 'Save changes' },
    { key: 'Ctrl + Z', description: 'Undo last action' },
    { key: 'Ctrl + Y', description: 'Redo last action' },
    { key: 'Ctrl + N', description: 'Create new department' },
    { key: 'Ctrl + R', description: 'Create new role' },
    { key: 'Ctrl + F', description: 'Search' },
    { key: 'Ctrl + P', description: 'Print current view' },
    { key: 'Ctrl + E', description: 'Export data' },
    { key: 'Ctrl + I', description: 'Import data' },
    { key: 'Ctrl + H', description: 'Show/hide help' },
    { key: 'Esc', description: 'Close dialogs or cancel current action' },
    { key: 'Tab', description: 'Navigate between form fields' }
  ];

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-describedby="keyboard-shortcuts-dialog"
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <KeyboardIcon sx={{ mr: 1 }} />
          Keyboard Shortcuts
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <List dense>
          {shortcuts.map((shortcut, index) => (
            <React.Fragment key={shortcut.key}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" fontWeight="bold" component="kbd" sx={{ 
                        bgcolor: 'grey.100', 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1,
                        fontFamily: 'monospace'
                      }}>
                        {shortcut.key}
                      </Typography>
                      <Typography variant="body2">
                        {shortcut.description}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < shortcuts.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Context help component
const ContextualHelp: React.FC = () => {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const handleOpenShortcuts = () => {
    setShortcutsOpen(true);
  };

  const handleCloseShortcuts = () => {
    setShortcutsOpen(false);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Contextual Help
      </Typography>
      
      <Typography variant="body1" paragraph>
        Throughout the application, you'll find contextual help tooltips that provide guidance and information about specific features.
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Help Tooltip Types
        </Typography>
        
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">
              Information
            </Typography>
            <HelpTooltip 
              title="Information" 
              content="Information tooltips provide general guidance and explanations about features and functionality."
              type="info"
            />
          </Box>
          <Typography variant="body2">
            These tooltips provide general information and explanations about features and functionality.
          </Typography>
        </Paper>
        
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">
              Tips
            </Typography>
            <HelpTooltip 
              title="Helpful Tip" 
              content="Tip tooltips provide best practices and shortcuts to help you work more efficiently."
              type="tip"
            />
          </Box>
          <Typography variant="body2">
            These tooltips provide best practices and shortcuts to help you work more efficiently.
          </Typography>
        </Paper>
        
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">
              Warnings
            </Typography>
            <HelpTooltip 
              title="Warning" 
              content="Warning tooltips alert you to potential issues or important considerations before taking an action."
              type="warning"
            />
          </Box>
          <Typography variant="body2">
            These tooltips alert you to potential issues or important considerations before taking an action.
          </Typography>
        </Paper>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Keyboard Shortcuts
        </Typography>
        
        <Typography variant="body2" paragraph>
          The application supports keyboard shortcuts for power users to work more efficiently.
        </Typography>
        
        <Button 
          variant="outlined" 
          startIcon={<KeyboardIcon />}
          onClick={handleOpenShortcuts}
        >
          View Keyboard Shortcuts
        </Button>
        
        <KeyboardShortcutsDialog 
          open={shortcutsOpen} 
          onClose={handleCloseShortcuts} 
        />
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Autosave
        </Typography>
        
        <Typography variant="body2" paragraph>
          The application automatically saves your changes as you work. You'll see a visual confirmation when changes are saved.
        </Typography>
        
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Typography variant="body2">
            All changes saved automatically
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export { HelpTooltip, KeyboardShortcutsDialog, ContextualHelp };
