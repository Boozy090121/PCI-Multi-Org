import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  IconButton, 
  Tooltip, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  ZoomIn as ZoomInIcon, 
  ZoomOut as ZoomOutIcon, 
  Refresh as RefreshIcon,
  GetApp as DownloadIcon,
  FullscreenExit as FitViewIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchCharts, selectChart } from '../../store/slices/chartsSlice';
import * as d3 from 'd3';

const OrganizationalChart: React.FC = () => {
  const dispatch = useDispatch();
  const { items: charts, status, error, selectedChartId } = useSelector((state: RootState) => state.charts);
  const { items: departments } = useSelector((state: RootState) => state.departments);
  const { items: roles } = useSelector((state: RootState) => state.roles);
  
  // Chart configuration
  const [showDepartmentColors, setShowDepartmentColors] = useState(true);
  const [showHeadcount, setShowHeadcount] = useState(true);
  const [showVacancies, setShowVacancies] = useState(true);
  const [layoutDirection, setLayoutDirection] = useState<'vertical' | 'horizontal'>('vertical');
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Chart container ref
  const chartRef = React.useRef<HTMLDivElement>(null);
  
  // Get the current chart
  const currentChart = charts.find(c => c.id === selectedChartId);
  
  // Load charts on component mount
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCharts());
    }
  }, [status, dispatch]);
  
  // Handle chart selection
  const handleSelectChart = (chartId: string) => {
    dispatch(selectChart(chartId));
  };
  
  // Handle zoom in
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };
  
  // Handle zoom out
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };
  
  // Handle fit to view
  const handleFitToView = () => {
    setZoomLevel(1);
  };
  
  // Handle layout direction change
  const handleLayoutDirectionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setLayoutDirection(event.target.value as 'vertical' | 'horizontal');
  };
  
  // Handle export as image
  const handleExportImage = () => {
    if (!chartRef.current) return;
    
    // Use html2canvas or similar library to export the chart as an image
    console.log('Exporting chart as image');
  };
  
  // Render the organizational chart using D3.js
  useEffect(() => {
    if (!currentChart || !chartRef.current) return;
    
    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();
    
    // Chart dimensions
    const width = chartRef.current.clientWidth;
    const height = 600;
    
    // Create SVG
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, 50) scale(${zoomLevel})`);
    
    // Create hierarchical data
    const hierarchyData = {
      name: currentChart.organizationName || 'Organization',
      children: departments.map(department => ({
        name: department.name,
        departmentId: department.id,
        color: department.color,
        children: roles
          .filter(role => role.departmentId === department.id)
          .map(role => ({
            name: role.title,
            roleId: role.id,
            level: role.level,
            headcount: role.headcount?.current || 0,
            projectedHeadcount: role.headcount?.projected || 0,
            reportsTo: role.reporting?.reportsTo || []
          }))
      }))
    };
    
    // Create hierarchy layout
    const root = d3.hierarchy(hierarchyData);
    
    // Create tree layout
    const treeLayout = layoutDirection === 'vertical'
      ? d3.tree().size([width - 100, height - 100])
      : d3.tree().size([height - 100, width - 100]);
    
    // Apply layout
    treeLayout(root);
    
    // Create links
    svg.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', layoutDirection === 'vertical'
        ? d3.linkVertical().x((d: any) => d.x).y((d: any) => d.y)
        : d3.linkHorizontal().x((d: any) => d.y).y((d: any) => d.x)
      )
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1.5);
    
    // Create nodes
    const nodes = svg.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => 
        layoutDirection === 'vertical'
          ? `translate(${d.x}, ${d.y})`
          : `translate(${d.y}, ${d.x})`
      );
    
    // Add node circles
    nodes.append('circle')
      .attr('r', d => d.depth === 0 ? 25 : d.depth === 1 ? 20 : 15)
      .attr('fill', d => {
        if (d.depth === 0) return '#4CAF50';
        if (d.depth === 1 && showDepartmentColors) return d.data.color;
        return '#2196F3';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);
    
    // Add node labels
    nodes.append('text')
      .attr('dy', d => d.depth === 0 ? 40 : d.depth === 1 ? 35 : 30)
      .attr('text-anchor', 'middle')
      .text(d => d.data.name)
      .attr('font-size', d => d.depth === 0 ? 14 : 12)
      .attr('font-weight', d => d.depth === 0 || d.depth === 1 ? 'bold' : 'normal');
    
    // Add headcount labels if enabled
    if (showHeadcount) {
      nodes.filter(d => d.depth === 2)
        .append('text')
        .attr('dy', 45)
        .attr('text-anchor', 'middle')
        .text(d => `HC: ${d.data.headcount}${showVacancies ? `/${d.data.projectedHeadcount}` : ''}`)
        .attr('font-size', 10)
        .attr('fill', d => {
          if (!showVacancies) return 'inherit';
          return d.data.headcount < d.data.projectedHeadcount ? '#f44336' : 'inherit';
        });
    }
    
  }, [currentChart, chartRef, departments, roles, zoomLevel, layoutDirection, showDepartmentColors, showHeadcount, showVacancies]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Organizational Chart
        </Typography>
        <Box>
          <IconButton onClick={handleZoomIn} title="Zoom In">
            <ZoomInIcon />
          </IconButton>
          <IconButton onClick={handleZoomOut} title="Zoom Out">
            <ZoomOutIcon />
          </IconButton>
          <IconButton onClick={handleFitToView} title="Fit to View">
            <FitViewIcon />
          </IconButton>
          <IconButton onClick={handleExportImage} title="Export as Image">
            <DownloadIcon />
          </IconButton>
        </Box>
      </Box>

      {status === 'loading' && (
        <Typography>Loading charts...</Typography>
      )}

      {status === 'failed' && (
        <Typography color="error">Error: {error}</Typography>
      )}

      {status === 'succeeded' && (
        <>
          {charts.length === 0 ? (
            <Typography variant="body1" color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
              No charts found. Create your first chart to get started.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Chart Settings
                    </Typography>
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="chart-select-label">Select Chart</InputLabel>
                      <Select
                        labelId="chart-select-label"
                        id="chart-select"
                        value={selectedChartId || ''}
                        label="Select Chart"
                        onChange={(e) => handleSelectChart(e.target.value)}
                      >
                        {charts.map((chart) => (
                          <MenuItem key={chart.id} value={chart.id}>
                            {chart.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Display Options
                    </Typography>
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="layout-select-label">Layout Direction</InputLabel>
                      <Select
                        labelId="layout-select-label"
                        id="layout-select"
                        value={layoutDirection}
                        label="Layout Direction"
                        onChange={handleLayoutDirectionChange}
                      >
                        <MenuItem value="vertical">Top to Bottom</MenuItem>
                        <MenuItem value="horizontal">Left to Right</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showDepartmentColors}
                          onChange={(e) => setShowDepartmentColors(e.target.checked)}
                        />
                      }
                      label="Show Department Colors"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showHeadcount}
                          onChange={(e) => setShowHeadcount(e.target.checked)}
                        />
                      }
                      label="Show Headcount"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showVacancies}
                          onChange={(e) => setShowVacancies(e.target.checked)}
                          disabled={!showHeadcount}
                        />
                      }
                      label="Show Vacancies"
                    />
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Legend
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#4CAF50', mr: 1 }} />
                      <Typography variant="body2">Organization</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#FFC107', mr: 1 }} />
                      <Typography variant="body2">Department</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#2196F3', mr: 1 }} />
                      <Typography variant="body2">Role</Typography>
                    </Box>
                    
                    {showHeadcount && showVacancies && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body2" color="error">HC: 2/5</Typography>
                        <Typography variant="body2" sx={{ ml: 1 }}>= Vacancies</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={9}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    height: 600, 
                    overflow: 'auto',
                    position: 'relative'
                  }}
                >
                  <Box 
                    ref={chartRef} 
                    sx={{ 
                      width: '100%', 
                      height: '100%',
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'center top'
                    }}
                  />
                </Paper>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default OrganizationalChart;
