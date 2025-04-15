// Firestore service for headcount calculators
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

const COLLECTION_NAME = 'calculators';

// Get all calculators
export const getCalculators = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting calculators:', error);
    throw error;
  }
};

// Get a single calculator by ID
export const getCalculator = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Calculator not found');
    }
  } catch (error) {
    console.error('Error getting calculator:', error);
    throw error;
  }
};

// Create a new calculator
export const createCalculator = async (data) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      scenarios: [],
      results: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating calculator:', error);
    throw error;
  }
};

// Update a calculator
export const updateCalculator = async (id, data) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating calculator:', error);
    throw error;
  }
};

// Delete a calculator
export const deleteCalculator = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting calculator:', error);
    throw error;
  }
};

// Run a simulation with specific inputs
export const runSimulation = async (id, inputs) => {
  try {
    const calculator = await getCalculator(id);
    
    // This is a placeholder for actual calculation logic
    // In a real implementation, this would perform complex calculations based on inputs
    
    // Create a new scenario with the inputs and results
    const scenario = {
      id: Date.now().toString(),
      name: inputs.name || `Scenario ${calculator.scenarios.length + 1}`,
      inputs: inputs,
      results: {
        // Placeholder for calculation results
        recommendedHeadcount: Math.ceil(
          (inputs.workOrdersPerDay * inputs.avgHandlingTime) / 
          (inputs.workHoursPerDay * 60 * (1 - inputs.absencePercentage / 100))
        ),
        timestamp: new Date()
      }
    };
    
    // Update the calculator with the new scenario
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      scenarios: [...calculator.scenarios, scenario],
      results: scenario.results,
      updatedAt: new Date()
    });
    
    return scenario;
  } catch (error) {
    console.error('Error running simulation:', error);
    throw error;
  }
};

// Export calculator results to a specific format
export const exportResults = async (id, format) => {
  try {
    const calculator = await getCalculator(id);
    
    // This is a placeholder for actual export functionality
    // In a real implementation, this would convert the calculator data to the requested format
    
    return {
      data: calculator,
      format: format
    };
  } catch (error) {
    console.error('Error exporting calculator results:', error);
    throw error;
  }
};
