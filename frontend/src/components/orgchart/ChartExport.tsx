import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  IconButton, 
  Tooltip, 
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { 
  ZoomIn as ZoomInIcon, 
  ZoomOut as ZoomOutIcon, 
  Refresh as RefreshIcon,
  GetApp as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import * as d3 from 'd3';
import html2canvas from 'html2canvas';

const ChartExport: React.FC = () => {
  const { selectedChartId, items: charts } = useSelector((state: RootState) => state.charts);
  const { items: departments } = useSelector((state: RootState) => state.departments);
  const { items: roles } = useSelector((state: RootState) => state.roles);
  
  // Chart container ref
  const exportRef = useRef<HTMLDivElement>(null);
  
  // Get the current chart
  const currentChart = charts.find(c => c.id === selectedChartId);
  
  // Export options
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf' | 'svg'>('png');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  
  // Handle export as image
  const handleExportImage = () => {
    if (!exportRef.current) return;
    
    html2canvas(exportRef.current).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${currentChart?.name || 'org-chart'}.png`;
      link.href = imgData;
      link.click();
    });
  };
  
  // Handle print
  const handlePrint = () => {
    if (!exportRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const printDocument = printWindow.document;
    printDocument.write('<html><head><title>Organizational Chart</title>');
    printDocument.write('<style>body { margin: 0; padding: 20px; }</style>');
    printDocument.write('</head><body>');
    printDocument.write(`<h1>${currentChart?.name || 'Organizational Chart'}</h1>`);
    
    if (includeMetadata && currentChart) {
      printDocument.write(`<p>${currentChart.description || ''}</p>`);
    }
    
    html2canvas(exportRef.current).then(canvas => {
      printDocument.write('<div style="text-align: center;">');
      printDocument.write(`<img src="${canvas.toDataURL('image/png')}" style="max-width: 100%;" />`);
      printDocument.write('</div>');
      
      if (showLegend) {
        printDocument.write('<div style="margin-top: 20px;">');
        printDocument.write('<h3>Legend</h3>');
        printDocument.write('<div style="display: flex; flex-wrap: wrap; gap: 20px;">');
        
        // Organization
        printDocument.write('<div style="display: flex; align-items: center;">');
        printDocument.write('<div style="width: 16px; height: 16px; border-radius: 50%; background-color: #4CAF50; margin-right: 8px;"></div>');
        printDocument.write('<span>Organization</span>');
        printDocument.write('</div>');
        
        // Departments
        printDocument.write('<div style="display: flex; align-items: center;">');
        printDocument.write('<div style="width: 16px; height: 16px; border-radius: 50%; background-color: #FFC107; margin-right: 8px;"></div>');
        printDocument.write('<span>Department</span>');
        printDocument.write('</div>');
        
        // Roles
        printDocument.write('<div style="display: flex; align-items: center;">');
        printDocument.write('<div style="width: 16px; height: 16px; border-radius: 50%; background-color: #2196F3; margin-right: 8px;"></div>');
        printDocument.write('<span>Role</span>');
        printDocument.write('</div>');
        
        printDocument.write('</div>'); // End of legend items
        printDocument.write('</div>'); // End of legend container
      }
      
      printDocument.write('</body></html>');
      printDocument.close();
      printWindow.print();
    });
  };
  
  // Handle share
  const handleShare = () => {
    if (!currentChart) return;
    
    // Generate a shareable link
    const shareableLink = `${window.location.origin}/share/chart/${currentChart.id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableLink).then(() => {
      alert('Shareable link copied to clipboard!');
    });
  };
  
  // Render the organizational chart for export
  useEffect(() => {
    if (!currentChart || !exportRef.current) return;
    
    // Clear previous chart
    d3.select(exportRef.current).selectAll('*').remove();
    
    // Chart dimensions
    const width = 800;
    const height = 600;
    
    // Create SVG
    const svg = d3.select(exportRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, 50)`);
    
    // Create hierarchical data
    const hierarchyData = {
      name: currentChart.organizationName || 'Organization',
      children: departments
        .filter(dept => currentChart.departmentIds.includes(dept.id))
        .map(department => ({
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
    const treeLayout = d3.tree().size([width - 100, height - 100]);
    
    // Apply layout
    treeLayout(root);
    
    // Create links
    svg.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical()
        .x((d: any) => d.x)
        .y((d: any) => d.y)
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
      .attr('transform', d => `translate(${d.x}, ${d.y})`);
    
    // Add node circles
    nodes.append('circle')
      .attr('r', d => d.depth === 0 ? 25 : d.depth === 1 ? 20 : 15)
      .attr('fill', d => {
        if (d.depth === 0) return '#4CAF50';
        if (d.depth === 1) return d.data.color;
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
    
    // Add headcount labels
    if (currentChart.options?.showVacancies) {
      nodes.filter(d => d.depth === 2)
        .append('text')
        .attr('dy', 45)
        .attr('text-anchor', 'middle')
        .text(d => `HC: ${d.data.headcount}/${d.data.projectedHeadcount}`)
        .attr('font-size', 10)
        .attr('fill', d => d.data.headcount < d.data.projectedHeadcount ? '#f44336' : 'inherit');
    }
    
  }, [currentChart, exportRef, departments, roles]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Export Organizational Chart
      </Typography>
      
      <Typography variant="body1" paragraph>
        Export your organizational chart in various formats for presentations, documentation, or sharing.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Export Options
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Format
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant={exportFormat === 'png' ? 'contained' : 'outlined'} 
                    onClick={() => setExportFormat('png')}
                    size="small"
                  >
                    PNG
                  </Button>
                  <Button 
                    variant={exportFormat === 'pdf' ? 'contained' : 'outlined'} 
                    onClick={() => setExportFormat('pdf')}
                    size="small"
                  >
                    PDF
                  </Button>
                  <Button 
                    variant={exportFormat === 'svg' ? 'contained' : 'outlined'} 
                    onClick={() => setExportFormat('svg')}
                    size="small"
                  >
                    SVG
                  </Button>
                </Box>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Include
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button 
                    variant={includeMetadata ? 'contained' : 'outlined'} 
                    onClick={() => setIncludeMetadata(!includeMetadata)}
                    size="small"
                  >
                    {includeMetadata ? 'Include Metadata ✓' : 'Include Metadata'}
                  </Button>
                  <Button 
                    variant={showLegend ? 'contained' : 'outlined'} 
                    onClick={() => setShowLegend(!showLegend)}
                    size="small"
                  >
                    {showLegend ? 'Show Legend ✓' : 'Show Legend'}
                  </Button>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportImage}
                  disabled={!currentChart}
                  fullWidth
                >
                  Export as {exportFormat.toUpperCase()}
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  disabled={!currentChart}
                  fullWidth
                >
                  Print Chart
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<ShareIcon />}
                  onClick={handleShare}
                  disabled={!currentChart}
                  fullWidth
                >
                  Share Chart
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper 
            variant="outlined" 
            sx={{ 
              height: 600, 
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {currentChart ? (
              <Box 
                ref={exportRef} 
                sx={{ 
                  width: '100%', 
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            ) : (
              <Typography variant="body1" color="text.secondary">
                Select a chart to preview export
              </Typography>
            )}
          </Paper>
          
          {currentChart && includeMetadata && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">
                {currentChart.name}
              </Typography>
              {currentChart.description && (
                <Typography variant="body2" color="text.secondary">
                  {currentChart.description}
                </Typography>
              )}
            </Box>
          )}
          
          {currentChart && showLegend && (
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#4CAF50', mr: 1 }} />
                <Typography variant="body2">Organization</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#FFC107', mr: 1 }} />
                <Typography variant="body2">Department</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#2196F3', mr: 1 }} />
                <Typography variant="body2">Role</Typography>
              </Box>
              
              {currentChart.options?.showVacancies && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="error">HC: 2/5</Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>= Vacancies</Typography>
                </Box>
              )}
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChartExport;
