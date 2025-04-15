// Firestore service for departments
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../config';

const COLLECTION_NAME = 'departments';

// Get all departments
export const getDepartments = async () => {
  try {
    const departmentsQuery = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
    const snapshot = await getDocs(departmentsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting departments:', error);
    throw error;
  }
};

// Get a single department by ID
export const getDepartment = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Department not found');
    }
  } catch (error) {
    console.error('Error getting department:', error);
    throw error;
  }
};

// Create a new department
export const createDepartment = async (data) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating department:', error);
    throw error;
  }
};

// Update a department
export const updateDepartment = async (id, data) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

// Delete a department
export const deleteDepartment = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
};

// Import departments from file (CSV/Excel)
export const importDepartments = async (departments) => {
  try {
    const batch = [];
    for (const department of departments) {
      batch.push(
        createDepartment({
          name: department.name,
          color: department.color || '#000000',
          order: department.order || 0
        })
      );
    }
    return Promise.all(batch);
  } catch (error) {
    console.error('Error importing departments:', error);
    throw error;
  }
};
