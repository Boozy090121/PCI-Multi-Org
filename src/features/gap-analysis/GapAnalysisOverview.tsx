import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Badge } from '@/components/ui/badge';
import { FileWarning, PlusCircle, ArrowLeft } from 'lucide-react'; // Added ArrowLeft
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"; // Import Alert Dialog
import { useAuth } from '@/context/AuthContext';
import GapAnalysisDialog from './GapAnalysisDialog'; // Import the dialog
import { type AnalysisFormValues } from './GapAnalysisDialog'; // Import form values type
import GapAnalysisDetailView from './GapAnalysisDetailView'; // Import Detail View
import { db } from '@/lib/firebase'; // Import db
import { 
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
    query, orderBy // Added query, orderBy
} from 'firebase/firestore';

// Analysis Type
interface AnalysisSummary {
  id: string; // Firestore ID
  name: string;
  description?: string;
  lastUpdated: string; 
  gapCount: number;
  severity: 'Low' | 'Medium' | 'High';
  progress: number; 
  targetSkillIds?: string[]; // Add field for target skill IDs
}

const GapAnalysisOverview: React.FC = () => {
  const { currentUser } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]); // Initialize empty
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState<AnalysisSummary | null>(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);

  const analysesCollectionRef = collection(db, "gapAnalyses"); // Collection name example

  // --- Fetch Analyses --- 
  const fetchAnalyses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        // Optional: Order by lastUpdated descending
        const q = query(analysesCollectionRef, orderBy("lastUpdated", "desc"));
        const data = await getDocs(q);
        const fetchedAnalyses = data.docs.map((doc) => ({ 
            id: doc.id,
            ...(doc.data() as Omit<AnalysisSummary, 'id'>) 
        })) as AnalysisSummary[];
        // Ensure targetSkillIds array exists
        fetchedAnalyses.forEach(analysis => {
            analysis.targetSkillIds = analysis.targetSkillIds || [];
        });
        setAnalyses(fetchedAnalyses);
    } catch (err) {
        console.error("Error fetching analyses:", err);
        setError("Failed to fetch analyses. Please try again.");
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  // Placeholder Action Handlers
  const handleCreate = () => console.log('Create analysis clicked');
  const handleView = (id: string) => console.log('View analysis clicked:', id);
  const handleEdit = (id: string) => console.log('Edit analysis clicked:', id);
  const handleExport = (id: string) => console.log('Export analysis clicked:', id);

  // --- Dialog Actions ---
  const openAddDialog = () => {
    setEditingAnalysis(null);
    setIsDialogOpen(true);
  };
  const openEditDialog = (analysis: AnalysisSummary) => {
    setEditingAnalysis(analysis);
    setIsDialogOpen(true);
  };
  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingAnalysis(null);
  };

  // --- CRUD Handlers ---
  const handleFormSubmit = async (data: AnalysisFormValues) => {
    if (!currentUser) return;
    setIsLoading(true); 
    setError(null);
    console.log("Submitting Gap Analysis Data:", data); // Log submitted data

    // Prepare base data
    const analysisDataBase = {
        name: data.name,
        description: data.description || null,
        analysisType: data.analysisType, // Save the analysis type
        lastUpdated: new Date().toISOString().split('T')[0],
        // Keep existing gapCount, severity, progress when editing, or set defaults for new
        ...(editingAnalysis ? {} : { gapCount: 0, severity: 'Low' as const, progress: 0 }), 
    };

    // Add target IDs based on analysis type
    let analysisDataToSave: any;
    if (data.analysisType === 'skill') {
        const skillIdsToSave = (data.targetSkills || []).map(s => s.id);
        analysisDataToSave = {
            ...analysisDataBase,
            targetSkillIds: skillIdsToSave,
            targetResponsibilityIds: [], // Clear other types
            processId: null,
        };
    } else if (data.analysisType === 'responsibility') { 
        const responsibilityIdsToSave = (data.targetResponsibilities || []).map(r => r.id);
        analysisDataToSave = {
            ...analysisDataBase,
            targetResponsibilityIds: responsibilityIdsToSave,
            targetSkillIds: [], // Clear other types
            processId: null,
        };
    } else { // analysisType === 'process'
        analysisDataToSave = {
            ...analysisDataBase,
            processId: data.processId, // Save processId
            targetSkillIds: [], // Clear other types
            targetResponsibilityIds: [],
        };
    }

    let operationSuccessful = false;
    try {
      if (editingAnalysis) {
        // Edit existing analysis metadata
        const analysisDocRef = doc(db, "gapAnalyses", editingAnalysis.id);
        // Update all relevant fields, including targetSkillIds
        await updateDoc(analysisDocRef, analysisDataToSave);
        console.log('Updated analysis:', editingAnalysis.id);
      } else {
        // Add new analysis record
        await addDoc(analysesCollectionRef, analysisDataToSave);
        console.log('Added new analysis:');
      }
      operationSuccessful = true;
      fetchAnalyses(); // Refetch the list
    } catch (err) {
       console.error(`Error ${editingAnalysis ? 'updating' : 'adding'} analysis:`, err);
       setError(`Failed to ${editingAnalysis ? 'update' : 'add'} analysis.`);
       // Re-throw error so dialog knows submission failed if needed
       throw err; 
    } finally {
        if (operationSuccessful) {
            closeDialog(); // Close dialog only on success
        }
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return;
    const analysisDocRef = doc(db, "gapAnalyses", id);
    try {
        await deleteDoc(analysisDocRef);
        console.log('Deleted analysis:', id);
        fetchAnalyses();
    } catch (err) {
        console.error("Error deleting analysis:", err);
        setError("Failed to delete analysis.");
    }
  };

  const getSeverityBadgeVariant = (severity: 'Low' | 'Medium' | 'High'): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case 'Low': return 'secondary';
      case 'Medium': return 'default'; // Or maybe 'outline' with custom color
      case 'High': return 'destructive';
      default: return 'secondary';
    }
  };

  // --- View Details Handler ---
  const handleViewDetails = (id: string) => {
    setSelectedAnalysisId(id);
  };
  const handleBackToList = () => {
    setSelectedAnalysisId(null);
  };

  // Render Overview Cards
  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold tracking-tight">Gap Analysis Overview</h2>
            <Button onClick={openAddDialog} disabled={!currentUser}> {/* Disable if not logged in */}
               <PlusCircle className="mr-2 h-4 w-4" /> Create New Analysis
            </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
           Review past analyses or create a new one to identify organizational gaps.
        </p>

        {isLoading ? (
            <Card className="flex flex-col items-center justify-center p-10 border-dashed">
                 <p>Loading analyses...</p>
            </Card>
        ) : error ? (
             <Card className="flex flex-col items-center justify-center p-10 border-dashed border-destructive">
                 <FileWarning className="w-12 h-12 text-destructive mb-4" />
                <CardTitle className="mb-2 text-destructive">Error Loading Data</CardTitle>
                <CardDescription className="mb-4 text-destructive">{error}</CardDescription>
                <Button onClick={fetchAnalyses} variant="destructive">Retry</Button>
            </Card>
        ) : analyses.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-10 border-dashed">
                 <FileWarning className="w-12 h-12 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">No Analyses Found</CardTitle>
                <CardDescription className="mb-4">Get started by creating your first gap analysis.</CardDescription>
                <Button onClick={openAddDialog} disabled={!currentUser}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Analysis
                </Button>
            </Card>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyses.map((analysis) => (
                    <Card key={analysis.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start mb-1">
                                <CardTitle className="text-lg">{analysis.name}</CardTitle>
                                <Badge variant={getSeverityBadgeVariant(analysis.severity)}>{analysis.severity} Severity</Badge>
                            </div>
                            <CardDescription>Last Updated: {analysis.lastUpdated}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground mb-4">{analysis.description}</p>
                            <div className="mb-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span>{analysis.progress}%</span>
                                </div>
                                <Progress value={analysis.progress} className="h-2" />
                            </div>
                            <p className="text-sm font-medium">Identified Gaps: {analysis.gapCount}</p>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(analysis.id)}>
                                View Details
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => openEditDialog(analysis)} disabled={!currentUser}>
                                Edit Settings
                            </Button>
                             <AlertDialog>
                               <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" disabled={!currentUser}>
                                     Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the analysis 
                                      <strong>{analysis.name}</strong>.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(analysis.id)} className="bg-red-600 hover:bg-red-700">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}

        {selectedAnalysisId && (
            <GapAnalysisDetailView
                analysisId={selectedAnalysisId}
                onBackToList={handleBackToList}
            />
        )}

        <GapAnalysisDialog 
            isOpen={isDialogOpen} 
            onClose={closeDialog} 
            onSubmit={handleFormSubmit} 
            initialData={editingAnalysis}
        />
    </div>
  );
};

export default GapAnalysisOverview; 