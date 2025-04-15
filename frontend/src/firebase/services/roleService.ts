// Firestore service for roles
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../config';

const COLLECTION_NAME = 'roles';

// Get all roles for a department
export const getRoles = async (departmentId) => {
  try {
    const rolesQuery = query(
      collection(db, COLLECTION_NAME), 
      where('departmentId', '==', departmentId),
      orderBy('title', 'asc')
    );
    const snapshot = await getDocs(rolesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting roles:', error);
    throw error;
  }
};

// Get a single role by ID
export const getRole = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Role not found');
    }
  } catch (error) {
    console.error('Error getting role:', error);
    throw error;
  }
};

// Create a new role
export const createRole = async (data) => {
  try {
    // Save the current version as the first version
    const currentVersion = {
      ...data,
      timestamp: new Date()
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      versions: [currentVersion],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
};

// Update a role
export const updateRole = async (id, data) => {
  try {
    // Get the current role to add to version history
    const roleDoc = await getRole(id);
    
    // Create a new version entry
    const newVersion = {
      ...roleDoc,
      timestamp: new Date()
    };
    
    // Remove the id from the version history
    delete newVersion.id;
    
    // Update the role with the new data and add the previous version to history
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      versions: [...(roleDoc.versions || []), newVersion],
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
};

// Delete a role
export const deleteRole = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting role:', error);
    throw error;
  }
};

// Clone a role
export const cloneRole = async (id) => {
  try {
    const roleToClone = await getRole(id);
    
    // Remove id and modify title to indicate it's a clone
    delete roleToClone.id;
    roleToClone.title = `${roleToClone.title} (Copy)`;
    
    // Create a new role with the cloned data
    return createRole(roleToClone);
  } catch (error) {
    console.error('Error cloning role:', error);
    throw error;
  }
};

// Compare two roles
export const compareRoles = async (roleId1, roleId2) => {
  try {
    const role1 = await getRole(roleId1);
    const role2 = await getRole(roleId2);
    
    // Create a comparison object
    const comparison = {
      role1: {
        id: role1.id,
        title: role1.title,
      },
      role2: {
        id: role2.id,
        title: role2.title,
      },
      differences: {}
    };
    
    // Compare each field
    const fieldsToCompare = [
      'title', 'level', 'responsibilities', 'clientInteraction', 
      'approvalAuthorities', 'skills', 'experience', 'reporting', 'headcount'
    ];
    
    for (const field of fieldsToCompare) {
      if (JSON.stringify(role1[field]) !== JSON.stringify(role2[field])) {
        comparison.differences[field] = {
          role1: role1[field],
          role2: role2[field]
        };
      }
    }
    
    return comparison;
  } catch (error) {
    console.error('Error comparing roles:', error);
    throw error;
  }
};
