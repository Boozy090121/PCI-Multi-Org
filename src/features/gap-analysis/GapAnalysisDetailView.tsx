import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertTriangle, Check, ChevronsUpDown, X as XIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { type StandardSkill } from '../standard-items/StandardSkillManagement';
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type StandardResponsibility } from '../standard-items/StandardResponsibilityManagement';
import { type Process } from '../processes/ProcessDialog';

// --- Data Structures ---
interface Role {
  id: string;
  title: string;
  skillIds?: string[]; // Roles must have skill IDs linked
  responsibilityIds?: string[]; // Add responsibility IDs to Role type
}

interface AnalysisDocument {
    id: string;
    name: string;
    description?: string;
    analysisType: 'skill' | 'responsibility' | 'process'; // Updated enum
    targetSkillIds?: string[];
    targetResponsibilityIds?: string[]; 
    processId?: string; // Add processId
    // Other potential fields (gapCount, severity, progress) - fetched but not updated here yet
}

interface GapAnalysisDetailViewProps {
  analysisId: string;
  onBack: () => void;
}

// --- Component --- 
const GapAnalysisDetailView: React.FC<GapAnalysisDetailViewProps> = ({ analysisId, onBack }) => {
  const [analysis, setAnalysis] = useState<AnalysisDocument | null>(null);
  const [processData, setProcessData] = useState<Process | null>(null); // State for fetched process data
  const [allRoles, setAllRoles] = useState<Role[]>([]); // All available roles
  const [allSkills, setAllSkills] = useState<StandardSkill[]>([]); // All standard skills
  const [allResponsibilities, setAllResponsibilities] = useState<StandardResponsibility[]>([]); // Added state for responsibilities
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]); // Roles included in current analysis view
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rolePopoverOpen, setRolePopoverOpen] = useState(false);

  const analysisDocRef = doc(db, "gapAnalyses", analysisId);

  // --- Fetch Initial Data --- 
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setProcessData(null); // Reset process data on new fetch
      try {
        const analysisPromise = getDoc(analysisDocRef);
        const rolesPromise = getDocs(query(collection(db, "roles"), orderBy("title")));
        const skillsPromise = getDocs(query(collection(db, "standardSkills"), orderBy("name")));
        const responsibilitiesPromise = getDocs(query(collection(db, "standardResponsibilities"), orderBy("name"))); // Added fetch

        const [analysisSnap, rolesSnap, skillsSnap, responsibilitiesSnap] = await Promise.all([
          analysisPromise,
          rolesPromise,
          skillsPromise,
          responsibilitiesPromise // Added to Promise.all
        ]);

        // Process Analysis
        if (!analysisSnap.exists()) {
          throw new Error("Gap Analysis not found.");
        }
        const analysisData = { id: analysisSnap.id, ...analysisSnap.data() } as AnalysisDocument;
        analysisData.targetSkillIds = analysisData.targetSkillIds || []; // Ensure array exists
        analysisData.targetResponsibilityIds = analysisData.targetResponsibilityIds || []; // Ensure array exists
        setAnalysis(analysisData);

        // Process Roles
        const rolesData = rolesSnap.docs.map(d => ({ 
            id: d.id, 
            ...(d.data() as Omit<Role, 'id'>), 
            skillIds: d.data().skillIds || [], // Ensure array exists
            responsibilityIds: d.data().responsibilityIds || [] // Ensure array exists
        })) as Role[];
        setAllRoles(rolesData);

        // Process Skills
        const skillsData = skillsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as StandardSkill[];
        setAllSkills(skillsData);

        // Process Responsibilities
        const responsibilitiesData = responsibilitiesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as StandardResponsibility[];
        setAllResponsibilities(responsibilitiesData); // Set state

        // Fetch Process data IF analysis type is 'process'
        if (analysisData.analysisType === 'process' && analysisData.processId) {
            const processDocRef = doc(db, "processes", analysisData.processId);
            const processSnap = await getDoc(processDocRef);
            if (processSnap.exists()) {
                 const fetchedProcess = { id: processSnap.id, ...processSnap.data() } as Process;
                 fetchedProcess.responsibilityIds = fetchedProcess.responsibilityIds || []; // Ensure array
                 setProcessData(fetchedProcess);
            } else {
                console.warn(`Process document with ID ${analysisData.processId} not found for analysis ${analysisId}`);
                setError("Associated process data not found. Displaying based on potentially stale data."); // Non-fatal error
            }
        }

      } catch (err: any) {
        console.error("Error fetching gap analysis details:", err);
        setError(err.message || "Failed to load gap analysis details.");
        setAnalysis(null);
        setAllRoles([]);
        setAllSkills([]);
        setAllResponsibilities([]); // Reset on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [analysisId]);

  // --- Role Selection Handlers --- 
  const handleToggleRole = (role: Role) => {
      setSelectedRoles(current => {
          const isSelected = current.some(r => r.id === role.id);
          return isSelected ? current.filter(r => r.id !== role.id) : [...current, role];
      });
  };
  const handleRemoveRole = (id: string) => {
      setSelectedRoles(current => current.filter(r => r.id !== id));
  };

  // --- Calculate Gaps (Memoized) --- 
  const analysisResults = useMemo(() => {
    // Determine which roles to analyze based on selection
    const isAnalyzingAllRoles = analysis?.analysisType === 'process' && selectedRoles.length === 0;
    const rolesToAnalyze = isAnalyzingAllRoles ? allRoles : selectedRoles;

    // Calculate current skills/responsibilities based on rolesToAnalyze
    const currentSkillIds = new Set<string>();
    const currentResponsibilityIds = new Set<string>();
    rolesToAnalyze.forEach(role => {
        (role.skillIds || []).forEach(skillId => currentSkillIds.add(skillId));
        (role.responsibilityIds || []).forEach(respId => currentResponsibilityIds.add(respId));
    });

    if (!analysis) {
        return { type: 'none', targetItems: [], metItems: [], gapItems: [] };
    }

    // Determine effective type and target IDs
    let effectiveType: 'skill' | 'responsibility' | 'none' = 'none';
    let targetIds: string[] = [];
    
    if (analysis.analysisType === 'skill') {
        effectiveType = 'skill';
        targetIds = analysis.targetSkillIds || [];
    } else if (analysis.analysisType === 'responsibility') {
        effectiveType = 'responsibility';
        targetIds = analysis.targetResponsibilityIds || [];
    } else if (analysis.analysisType === 'process') {
        effectiveType = 'responsibility'; // Process analysis results in responsibility gaps
        targetIds = processData?.responsibilityIds || []; // Use IDs from fetched process data
    }

    // Calculate gaps based on effective type
    if (effectiveType === 'skill' && allSkills.length > 0) {
        const skillMap = new Map(allSkills.map(s => [s.id, s]));
        const targets = targetIds.map(id => skillMap.get(id)).filter(Boolean) as StandardSkill[];
        const met: StandardSkill[] = [];
        const gap: StandardSkill[] = [];
        targets.forEach(target => {
            if (currentSkillIds.has(target.id)) met.push(target);
            else gap.push(target);
        });
        return { type: effectiveType, targetItems: targets, metItems: met, gapItems: gap };

    } else if (effectiveType === 'responsibility' && allResponsibilities.length > 0) {
        const respMap = new Map(allResponsibilities.map(r => [r.id, r]));
        const targets = targetIds.map(id => respMap.get(id)).filter(Boolean) as StandardResponsibility[];
        const met: StandardResponsibility[] = [];
        const gap: StandardResponsibility[] = [];
        targets.forEach(target => {
            if (currentResponsibilityIds.has(target.id)) met.push(target);
            else gap.push(target);
        });
        return { type: effectiveType, targetItems: targets, metItems: met, gapItems: gap };
    }

    // Default case
    return { type: 'none', targetItems: [], metItems: [], gapItems: [] };

  }, [analysis, processData, selectedRoles, allRoles, allSkills, allResponsibilities]); // Added allRoles dependency

  // --- Render Logic --- 

  if (isLoading) { /* ... Loading state ... */ }
  if (error && !analysis) { /* ... Fatal Error state ... */ }
  if (!analysis) { /* ... Fallback if no analysis found ... */ }

  // Main Render
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
           <div>
              <Button variant="outline" size="sm" onClick={onBack} className="mb-2">
                 <ArrowLeft className="mr-2 h-4 w-4" /> Back to Overview
              </Button>
              <CardTitle>{analysis?.name} {analysis?.analysisType === 'process' && processData ? `(Process: ${processData.name})` : `(${analysis?.analysisType} based)`}</CardTitle>
              <CardDescription>{analysis?.description || 'No description provided.'}</CardDescription>
            </div>
             {/* Add maybe export button or other actions here */} 
         </div>
         {/* Display non-fatal errors (e.g., future save errors) */}
         {error && <div className="mt-2 text-destructive text-sm">{error}</div>}
      </CardHeader>
      <CardContent className="space-y-6">
          {/* Role Selector */}
          <div className="space-y-2">
             <Label>Analyze Roles:</Label>
             <Popover open={rolePopoverOpen} onOpenChange={setRolePopoverOpen}>
                 <PopoverTrigger asChild>
                      <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={rolePopoverOpen}
                          className={cn("w-full justify-between", !selectedRoles.length && "text-muted-foreground")}
                      >
                          <span className="truncate"> 
                              {selectedRoles.length > 0 
                                  ? `${selectedRoles.length} role(s) selected` 
                                  : "Select roles to include..."}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-[--popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                     <Command>
                         <CommandInput placeholder="Search roles..." />
                         <CommandList>
                             <CommandEmpty>No roles found.</CommandEmpty>
                             <CommandGroup>
                                 {allRoles.map((role) => (
                                     <CommandItem
                                         key={role.id}
                                         value={role.title}
                                         onSelect={() => handleToggleRole(role)}
                                     >
                                         <Check className={cn("mr-2 h-4 w-4", selectedRoles.some(r => r.id === role.id) ? "opacity-100" : "opacity-0")}/>
                                         {role.title}
                                     </CommandItem>
                                 ))}
                             </CommandGroup>
                         </CommandList>
                     </Command>
                 </PopoverContent>
             </Popover>
             <div className="space-x-1 space-y-1 pt-1 min-h-[24px]">
                {selectedRoles.map((role) => (
                    <Badge variant="secondary" key={role.id}>
                       {role.title}
                       <button type="button" className="ml-1 rounded-full ..." onClick={() => handleRemoveRole(role.id)}>
                           <XIcon className="h-3 w-3 ..." />
                       </button>
                    </Badge>
                ))}
             </div>
          </div>
          
          {/* Results Area */}
          <div className="border-t pt-4 space-y-4">
              <p className="text-sm text-muted-foreground italic">
                  Gap analysis based on: {selectedRoles.length > 0 ? `${selectedRoles.length} Selected Role(s)` : 'All Defined Roles'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Target Items Column */}
                  <div className="md:col-span-1 space-y-2">
                      <h3 className="font-semibold">Target {analysisResults.type === 'skill' ? 'Skills' : 'Responsibilities'} ({analysisResults.targetItems.length})</h3>
                      {analysisResults.targetItems.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No target {analysisResults.type === 'skill' ? 'skills' : 'responsibilities'} defined {analysis?.analysisType === 'process' ? 'for this process' : 'for this analysis'}.</p>
                      ) : (
                          <ScrollArea className="h-60 border rounded-md p-2">
                             {analysisResults.targetItems.map(item => (
                                 <Badge key={item.id} variant="outline" className="mr-1 mb-1">{item.name}</Badge>
                             ))}
                          </ScrollArea>
                      )}
                  </div>
                  
                  {/* Met Items Column */}
                   <div className="md:col-span-1 space-y-2">
                      <h3 className="font-semibold">Met {analysisResults.type === 'skill' ? 'Skills' : 'Responsibilities'} ({analysisResults.metItems.length})</h3>
                      {analysisResults.metItems.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No target {analysisResults.type === 'skill' ? 'skills' : 'responsibilities'} met.</p>
                      ) : (
                          <ScrollArea className="h-60 border rounded-md p-2 border-green-300 bg-green-50/30">
                             {analysisResults.metItems.map(item => (
                                 <Badge key={item.id} variant="default" className="mr-1 mb-1 bg-green-600 hover:bg-green-700">{item.name}</Badge>
                             ))}
                          </ScrollArea>
                      )}
                  </div>

                  {/* Gap Items Column */}
                   <div className="md:col-span-1 space-y-2">
                      <h3 className="font-semibold">Gap {analysisResults.type === 'skill' ? 'Skills' : 'Responsibilities'} ({analysisResults.gapItems.length})</h3>
                      {analysisResults.gapItems.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No {analysisResults.type === 'skill' ? 'skill' : 'responsibility'} gaps identified.</p>
                      ) : (
                          <ScrollArea className="h-60 border rounded-md p-2 border-red-300 bg-red-50/30">
                             {analysisResults.gapItems.map(item => (
                                 <Badge key={item.id} variant="destructive" className="mr-1 mb-1">{item.name}</Badge>
                             ))}
                          </ScrollArea>
                      )}
                  </div>
              </div>
          </div>
      </CardContent>
    </Card>
  );
};

export default GapAnalysisDetailView; 