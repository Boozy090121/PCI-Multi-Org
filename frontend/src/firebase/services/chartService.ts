// Firestore service for organizational charts
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

const COLLECTION_NAME = 'charts';

// Get all charts
export const getCharts = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting charts:', error);
    throw error;
  }
};

// Get a single chart by ID
export const getChart = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Chart not found');
    }
  } catch (error) {
    console.error('Error getting chart:', error);
    throw error;
  }
};

// Create a new chart
export const createChart = async (data) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating chart:', error);
    throw error;
  }
};

// Update a chart
export const updateChart = async (id, data) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating chart:', error);
    throw error;
  }
};

// Delete a chart
export const deleteChart = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting chart:', error);
    throw error;
  }
};

// Export chart to a specific format (PNG, PDF, SVG)
export const exportChart = async (id, format) => {
  try {
    const chart = await getChart(id);
    
    // This is a placeholder for actual export functionality
    // In a real implementation, this would convert the chart data to the requested format
    
    return {
      data: chart,
      format: format
    };
  } catch (error) {
    console.error('Error exporting chart:', error);
    throw error;
  }
};
