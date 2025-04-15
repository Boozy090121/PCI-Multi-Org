// Firestore service for matrices (RACI, responsibility, interaction)
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../config';

const COLLECTION_NAME = 'matrices';

// Get all matrices by type
export const getMatrices = async (type) => {
  try {
    const matricesQuery = query(
      collection(db, COLLECTION_NAME), 
      where('type', '==', type)
    );
    const snapshot = await getDocs(matricesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting matrices:', error);
    throw error;
  }
};

// Get a single matrix by ID
export const getMatrix = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Matrix not found');
    }
  } catch (error) {
    console.error('Error getting matrix:', error);
    throw error;
  }
};

// Create a new matrix
export const createMatrix = async (data) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating matrix:', error);
    throw error;
  }
};

// Update a matrix
export const updateMatrix = async (id, data) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating matrix:', error);
    throw error;
  }
};

// Delete a matrix
export const deleteMatrix = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting matrix:', error);
    throw error;
  }
};

// Export matrix to a specific format
export const exportMatrix = async (id, format) => {
  try {
    const matrix = await getMatrix(id);
    
    // This is a placeholder for actual export functionality
    // In a real implementation, this would convert the matrix data to the requested format
    
    return {
      data: matrix,
      format: format
    };
  } catch (error) {
    console.error('Error exporting matrix:', error);
    throw error;
  }
};
