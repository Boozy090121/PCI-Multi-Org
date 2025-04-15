// Firestore service for implementation planning
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../config';

const COLLECTION_NAME = 'implementations';

// Get all implementation plans
export const getImplementations = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting implementation plans:', error);
    throw error;
  }
};

// Get a single implementation plan by ID
export const getImplementation = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Implementation plan not found');
    }
  } catch (error) {
    console.error('Error getting implementation plan:', error);
    throw error;
  }
};

// Create a new implementation plan
export const createImplementation = async (data) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      phases: data.phases || [],
      milestones: data.milestones || [],
      gaps: data.gaps || [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating implementation plan:', error);
    throw error;
  }
};

// Update an implementation plan
export const updateImplementation = async (id, data) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating implementation plan:', error);
    throw error;
  }
};

// Delete an implementation plan
export const deleteImplementation = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting implementation plan:', error);
    throw error;
  }
};

// Analyze gaps between current and future state
export const analyzeGaps = async (currentState, futureState) => {
  try {
    // This is a placeholder for actual gap analysis logic
    // In a real implementation, this would compare current and future states to identify gaps
    
    const gaps = [];
    
    // Compare departments
    const departmentGaps = compareDepartments(currentState.departments, futureState.departments);
    if (departmentGaps.length > 0) {
      gaps.push({
        type: 'department',
        items: departmentGaps
      });
    }
    
    // Compare roles
    const roleGaps = compareRoles(currentState.roles, futureState.roles);
    if (roleGaps.length > 0) {
      gaps.push({
        type: 'role',
        items: roleGaps
      });
    }
    
    // Compare skills
    const skillGaps = compareSkills(currentState.roles, futureState.roles);
    if (skillGaps.length > 0) {
      gaps.push({
        type: 'skill',
        items: skillGaps
      });
    }
    
    // Compare headcount
    const headcountGaps = compareHeadcount(currentState.roles, futureState.roles);
    if (headcountGaps.length > 0) {
      gaps.push({
        type: 'headcount',
        items: headcountGaps
      });
    }
    
    return gaps;
  } catch (error) {
    console.error('Error analyzing gaps:', error);
    throw error;
  }
};

// Helper functions for gap analysis
const compareDepartments = (currentDepartments, futureDepartments) => {
  const gaps = [];
  
  // Find departments in future state that don't exist in current state
  futureDepartments.forEach(futureDept => {
    const currentDept = currentDepartments.find(dept => dept.name === futureDept.name);
    if (!currentDept) {
      gaps.push({
        type: 'new',
        name: futureDept.name,
        description: `New department "${futureDept.name}" needs to be created`
      });
    }
  });
  
  // Find departments in current state that don't exist in future state
  currentDepartments.forEach(currentDept => {
    const futureDept = futureDepartments.find(dept => dept.name === currentDept.name);
    if (!futureDept) {
      gaps.push({
        type: 'removed',
        name: currentDept.name,
        description: `Department "${currentDept.name}" will be removed`
      });
    }
  });
  
  return gaps;
};

const compareRoles = (currentRoles, futureRoles) => {
  const gaps = [];
  
  // Find roles in future state that don't exist in current state
  futureRoles.forEach(futureRole => {
    const currentRole = currentRoles.find(role => 
      role.title === futureRole.title && role.departmentId === futureRole.departmentId
    );
    if (!currentRole) {
      gaps.push({
        type: 'new',
        title: futureRole.title,
        departmentId: futureRole.departmentId,
        description: `New role "${futureRole.title}" needs to be created`
      });
    }
  });
  
  // Find roles in current state that don't exist in future state
  currentRoles.forEach(currentRole => {
    const futureRole = futureRoles.find(role => 
      role.title === currentRole.title && role.departmentId === currentRole.departmentId
    );
    if (!futureRole) {
      gaps.push({
        type: 'removed',
        title: currentRole.title,
        departmentId: currentRole.departmentId,
        description: `Role "${currentRole.title}" will be removed`
      });
    }
  });
  
  return gaps;
};

const compareSkills = (currentRoles, futureRoles) => {
  const gaps = [];
  
  // Compare skills for roles that exist in both current and future states
  futureRoles.forEach(futureRole => {
    const currentRole = currentRoles.find(role => 
      role.title === futureRole.title && role.departmentId === futureRole.departmentId
    );
    
    if (currentRole) {
      // Find skills in future role that don't exist in current role
      const futureSkills = futureRole.skills || [];
      const currentSkills = currentRole.skills || [];
      
      futureSkills.forEach(futureSkill => {
        if (!currentSkills.includes(futureSkill)) {
          gaps.push({
            type: 'skill',
            title: futureRole.title,
            departmentId: futureRole.departmentId,
            skill: futureSkill,
            description: `New skill "${futureSkill}" needed for role "${futureRole.title}"`
          });
        }
      });
    }
  });
  
  return gaps;
};

const compareHeadcount = (currentRoles, futureRoles) => {
  const gaps = [];
  
  // Compare headcount for roles that exist in both current and future states
  futureRoles.forEach(futureRole => {
    const currentRole = currentRoles.find(role => 
      role.title === futureRole.title && role.departmentId === futureRole.departmentId
    );
    
    if (currentRole) {
      const currentHeadcount = currentRole.headcount?.current || 0;
      const futureHeadcount = futureRole.headcount?.projected || 0;
      
      if (futureHeadcount > currentHeadcount) {
        gaps.push({
          type: 'increase',
          title: futureRole.title,
          departmentId: futureRole.departmentId,
          current: currentHeadcount,
          projected: futureHeadcount,
          difference: futureHeadcount - currentHeadcount,
          description: `Headcount increase needed for "${futureRole.title}" (${currentHeadcount} to ${futureHeadcount})`
        });
      } else if (futureHeadcount < currentHeadcount) {
        gaps.push({
          type: 'decrease',
          title: futureRole.title,
          departmentId: futureRole.departmentId,
          current: currentHeadcount,
          projected: futureHeadcount,
          difference: currentHeadcount - futureHeadcount,
          description: `Headcount decrease planned for "${futureRole.title}" (${currentHeadcount} to ${futureHeadcount})`
        });
      }
    }
  });
  
  return gaps;
};
