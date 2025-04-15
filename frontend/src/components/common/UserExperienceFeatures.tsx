import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  Grow,
  Backdrop,
  CircularProgress
} from '@mui/material';
import {
  Undo as UndoIcon,
  Redo as RedoIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  KeyboardReturn as EnterIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';

interface UndoRedoState {
  past: any[];
  present: any;
  future: any[];
}

const UndoRedoManager: React.FC = () => {
  const dispatch = useDispatch();
  
  // Mock undo/redo state
  const [undoRedoState, setUndoRedoState] = useState<UndoRedoState>({
    past: [],
    present: null,
    future: []
  });
  
  // Mock autosave state
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date());
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  
  // Handle undo
  const handleUndo = () => {
    if (undoRedoState.past.length === 0) return;
    
    const newPast = [...undoRedoState.past];
    const previous = newPast.pop();
    
    setUndoRedoState({
      past: newPast,
      present: previous,
      future: [undoRedoState.present, ...undoRedoState.future]
    });
    
    // This would dispatch an action to update the state
    console.log('Undo action');
    
    // Show save notification
    setSaveStatus('saving');
    setShowSaveNotification(true);
    
    // Simulate save
    setTimeout(() => {
      setSaveStatus('saved');
      setLastSaved(new Date());
    }, 1000);
  };
  
  // Handle redo
  const handleRedo = () => {
    if (undoRedoState.future.length === 0) return;
    
    const newFuture = [...undoRedoState.future];
    const next = newFuture.shift();
    
    setUndoRedoState({
      past: [...undoRedoState.past, undoRedoState.present],
      present: next,
      future: newFuture
    });
    
    // This would dispatch an action to update the state
    console.log('Redo action');
    
    // Show save notification
    setSaveStatus('saving');
    setShowSaveNotification(true);
    
    // Simulate save
    setTimeout(() => {
      setSaveStatus('saved');
      setLastSaved(new Date());
    }, 1000);
  };
  
  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle close notification
  const handleCloseNotification = () => {
    setShowSaveNotification(false);
  };
  
  // Simulate autosave
  useEffect(() => {
    const interval = setInterval(() => {
      // Only show notification if there are changes
      if (undoRedoState.past.length > 0) {
        setSaveStatus('saving');
        setShowSaveNotification(true);
        
        setTimeout(() => {
          setSaveStatus('saved');
          setLastSaved(new Date());
        }, 1000);
      }
    }, 30000); // Autosave every 30 seconds
    
    return () => clearInterval(interval);
  }, [undoRedoState]);
  
  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Undo/Redo & Autosave
          </Typography>
          
          <Box>
            <Tooltip title="Undo (Ctrl+Z)">
              <span>
                <IconButton 
                  onClick={handleUndo} 
                  disabled={undoRedoState.past.length === 0}
                  size="small"
                >
                  <UndoIcon />
                </IconButton>
              </span>
            </Tooltip>
            
            <Tooltip title="Redo (Ctrl+Y)">
              <span>
                <IconButton 
                  onClick={handleRedo} 
                  disabled={undoRedoState.future.length === 0}
                  size="small"
                >
                  <RedoIcon />
                </IconButton>
              </span>
            </Tooltip>
            
            <Tooltip title={`Last saved: ${lastSaved ? formatTime(lastSaved) : 'Never'}`}>
              <IconButton 
                size="small"
                color={saveStatus === 'saved' ? 'success' : saveStatus === 'saving' ? 'primary' : 'error'}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Typography variant="body2" paragraph>
          Changes are automatically saved as you work. You can undo and redo actions using the buttons above or keyboard shortcuts.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<UndoIcon />}
            onClick={handleUndo}
            disabled={undoRedoState.past.length === 0}
          >
            Undo
          </Button>
          
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<RedoIcon />}
            onClick={handleRedo}
            disabled={undoRedoState.future.length === 0}
          >
            Redo
          </Button>
        </Box>
      </Paper>
      
      <Snackbar
        open={showSaveNotification}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={saveStatus === 'saved' ? 'success' : saveStatus === 'saving' ? 'info' : 'error'}
          variant="filled"
          icon={saveStatus === 'saved' ? <SaveIcon /> : saveStatus === 'saving' ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          {saveStatus === 'saved' ? 'All changes saved' : saveStatus === 'saving' ? 'Saving changes...' : 'Error saving changes'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const AnimationDemo: React.FC = () => {
  const [showFade, setShowFade] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [showGrow, setShowGrow] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  
  const handleToggleFade = () => {
    setShowFade(!showFade);
  };
  
  const handleToggleZoom = () => {
    setShowZoom(!showZoom);
  };
  
  const handleToggleGrow = () => {
    setShowGrow(!showGrow);
  };
  
  const handleToggleLoading = () => {
    setShowLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      setShowLoading(false);
    }, 3000);
  };
  
  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Animations & Visual Feedback
        </Typography>
        
        <Typography variant="body2" paragraph>
          The application includes smooth animations and visual feedback to enhance the user experience.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant="outlined" onClick={handleToggleFade}>
            Fade Animation
          </Button>
          
          <Button variant="outlined" onClick={handleToggleZoom}>
            Zoom Animation
          </Button>
          
          <Button variant="outlined" onClick={handleToggleGrow}>
            Grow Animation
          </Button>
          
          <Button variant="outlined" onClick={handleToggleLoading}>
            Loading Indicator
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, height: 100, alignItems: 'center' }}>
          <Fade in={showFade}>
            <Paper elevation={4} sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography>Fade Animation</Typography>
            </Paper>
          </Fade>
          
          <Zoom in={showZoom}>
            <Paper elevation={4} sx={{ p: 2, bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
              <Typography>Zoom Animation</Typography>
            </Paper>
          </Zoom>
          
          <Grow in={showGrow}>
            <Paper elevation={4} sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
              <Typography>Grow Animation</Typography>
            </Paper>
          </Grow>
        </Box>
      </Paper>
      
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={showLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

const KeyboardShortcutsDemo: React.FC = () => {
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  
  // Handle key down
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const key = event.key.toUpperCase();
    if (!pressedKeys.includes(key)) {
      setPressedKeys([...pressedKeys, key]);
    }
  };
  
  // Handle key up
  const handleKeyUp = (event: React.KeyboardEvent) => {
    const key = event.key.toUpperCase();
    setPressedKeys(pressedKeys.filter(k => k !== key));
  };
  
  // Clear keys
  const handleClearKeys = () => {
    setPressedKeys([]);
  };
  
  return (
    <Box>
      <Paper 
        variant="outlined" 
        sx={{ p: 2, mb: 2 }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onBlur={handleClearKeys}
      >
        <Typography variant="h6" gutterBottom>
          Keyboard Shortcuts Demo
        </Typography>
        
        <Typography variant="body2" paragraph>
          Click on this box and press any keys to see them displayed below. The application supports various keyboard shortcuts for power users.
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          flexWrap: 'wrap',
          minHeight: 50,
          alignItems: 'center'
        }}>
          {pressedKeys.map(key => (
            <Paper 
              key={key} 
              elevation={3} 
              sx={{ 
                p: 1, 
                minWidth: 30, 
                textAlign: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText'
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {key}
              </Typography>
            </Paper>
          ))}
          
          {pressedKeys.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Press any keys to see them displayed here
            </Typography>
          )}
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Common Shortcuts:
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Tooltip title="Save">
              <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" component="kbd" sx={{ 
                  bgcolor: 'grey.200', 
                  px: 1, 
                  borderRadius: 1,
                  fontFamily: 'monospace'
                }}>
                  Ctrl
                </Typography>
                <Typography variant="body2" component="span">+</Typography>
                <Typography variant="body2" component="kbd" sx={{ 
                  bgcolor: 'grey.200', 
                  px: 1, 
                  borderRadius: 1,
                  fontFamily: 'monospace'
                }}>
                  S
                </Typography>
                <SaveIcon fontSize="small" />
              </Paper>
            </Tooltip>
            
            <Tooltip title="Undo">
              <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" component="kbd" sx={{ 
                  bgcolor: 'grey.200', 
                  px: 1, 
                  borderRadius: 1,
                  fontFamily: 'monospace'
                }}>
                  Ctrl
                </Typography>
                <Typography variant="body2" component="span">+</Typography>
                <Typography variant="body2" component="kbd" sx={{ 
                  bgcolor: 'grey.200', 
                  px: 1, 
                  borderRadius: 1,
                  fontFamily: 'monospace'
                }}>
                  Z
                </Typography>
                <UndoIcon fontSize="small" />
              </Paper>
            </Tooltip>
            
            <Tooltip title="Redo">
              <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" component="kbd" sx={{ 
                  bgcolor: 'grey.200', 
                  px: 1, 
                  borderRadius: 1,
                  fontFamily: 'monospace'
                }}>
                  Ctrl
                </Typography>
                <Typography variant="body2" component="span">+</Typography>
                <Typography variant="body2" component="kbd" sx={{ 
                  bgcolor: 'grey.200', 
                  px: 1, 
                  borderRadius: 1,
                  fontFamily: 'monospace'
                }}>
                  Y
                </Typography>
                <RedoIcon fontSize="small" />
              </Paper>
            </Tooltip>
            
            <Tooltip title="Refresh">
              <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" component="kbd" sx={{ 
                  bgcolor: 'grey.200', 
                  px: 1, 
                  borderRadius: 1,
                  fontFamily: 'monospace'
                }}>
                  F5
                </Typography>
                <RefreshIcon fontSize="small" />
              </Paper>
            </Tooltip>
            
            <Tooltip title="Submit">
              <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" component="kbd" sx={{ 
                  bgcolor: 'grey.200', 
                  px: 1, 
                  borderRadius: 1,
                  fontFamily: 'monospace'
                }}>
                  Enter
                </Typography>
                <EnterIcon fontSize="small" />
              </Paper>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

const UserExperienceFeatures: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        User Experience Features
      </Typography>
      
      <Typography variant="body1" paragraph>
        The application includes various user experience features to enhance usability and productivity.
      </Typography>
      
      <UndoRedoManager />
      <AnimationDemo />
      <KeyboardShortcutsDemo />
    </Box>
  );
};

export { UndoRedoManager, AnimationDemo, KeyboardShortcutsDemo, UserExperienceFeatures };
