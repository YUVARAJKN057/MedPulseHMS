import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp,
  orderBy,
  limit,
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Logging & Audit ---
export const logActivity = async (action: string, module: string, details: string = '') => {
  try {
    const user = auth.currentUser;
    await addDoc(collection(db, 'logs'), {
      userId: user?.uid || 'anonymous',
      userName: user?.displayName || 'System',
      action,
      module,
      details,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.warn('Logging failed:', err);
  }
};

export const getLogs = (callback: (data: any[]) => void, limitCount: number = 20) => {
  const q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(limitCount));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (err) => handleFirestoreError(err, OperationType.LIST, 'logs'));
};

// --- Appointments ---
export const getAppointments = (callback: (data: any[]) => void, role: string, uid: string) => {
  let q = query(
    collection(db, 'appointments'), 
    where('deletedAt', '==', null)
  );
  
  if (role === 'patient') {
    q = query(
      collection(db, 'appointments'), 
      where('patientId', '==', uid), 
      where('deletedAt', '==', null)
    );
  } else if (role === 'doctor') {
    q = query(
      collection(db, 'appointments'), 
      where('doctorId', '==', uid), 
      where('deletedAt', '==', null)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort in-memory
    data.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(data);
  }, (err) => handleFirestoreError(err, OperationType.LIST, 'appointments'));
};

export const createAppointment = async (data: any) => {
  try {
    const res = await addDoc(collection(db, 'appointments'), {
      ...data,
      status: 'pending',
      deletedAt: null,
      createdAt: serverTimestamp(),
    });
    await logActivity('Create Appointment', 'Appointments', `Created appt for ${data.patientName}`);
    return res;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'appointments');
  }
};

export const softDeleteAppointment = async (id: string) => {
  try {
    const apptRef = doc(db, 'appointments', id);
    await updateDoc(apptRef, { deletedAt: serverTimestamp() });
    await logActivity('Delete Appointment', 'Appointments', `Archived appointment ${id}`);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'appointments');
  }
};

// --- Billing ---
export const getBilling = (callback: (data: any[]) => void, role: string, uid: string) => {
  let q = query(
    collection(db, 'billing'), 
    where('deletedAt', '==', null)
  );
  
  if (role === 'patient') {
    q = query(
      collection(db, 'billing'), 
      where('patientId', '==', uid), 
      where('deletedAt', '==', null)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    data.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(data);
  }, (err) => handleFirestoreError(err, OperationType.LIST, 'billing'));
};

export const createInvoice = async (data: any) => {
  try {
    const res = await addDoc(collection(db, 'billing'), {
      ...data,
      deletedAt: null,
      createdAt: serverTimestamp(),
    });
    await logActivity('Create Invoice', 'Billing', `Invoice for ${data.patientName}`);
    return res;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'billing');
  }
};

export const createStaff = async (data: any) => {
  try {
    const res = await addDoc(collection(db, 'users'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    await logActivity('Add Staff', 'Staff', `Added ${data.name} as ${data.role}`);
    return res;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'users');
  }
};

// --- Medical Records ---
export const getMedicalRecords = (callback: (data: any[]) => void, role: string, uid: string) => {
  let q = query(
    collection(db, 'records'), 
    where('deletedAt', '==', null)
  );

  if (role === 'patient') {
    q = query(
      collection(db, 'records'), 
      where('patientId', '==', uid), 
      where('deletedAt', '==', null)
    );
  } else if (role === 'doctor') {
    q = query(
      collection(db, 'records'), 
      where('doctorId', '==', uid), 
      where('deletedAt', '==', null)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    data.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(data);
  }, (err) => handleFirestoreError(err, OperationType.LIST, 'records'));
};

export const createMedicalRecord = async (data: any) => {
  try {
    const res = await addDoc(collection(db, 'records'), {
      ...data,
      deletedAt: null,
      createdAt: serverTimestamp(),
    });
    await logActivity('Medical Entry', 'Records', `Entry for ${data.patientName}`);
    return res;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'records');
  }
};

// --- Utility: Export ---
export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => headers.map(header => {
    const val = obj[header];
    return typeof val === 'object' ? JSON.stringify(val).replace(/,/g, ';') : val;
  }).join(','));
  
  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
};

// --- Users/Staff ---
export const getStaff = (callback: (data: any[]) => void) => {
  const q = query(collection(db, 'users'), where('role', 'in', ['doctor', 'admin', 'receptionist']));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));
};

export const getPatients = (callback: (data: any[]) => void) => {
  const q = query(collection(db, 'users'), where('role', '==', 'patient'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));
};

// --- Dashboard Stats ---
export const getStats = async () => {
  try {
    const patientsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'patient')));
    const doctorsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'doctor')));
    const appointmentsSnap = await getDocs(collection(db, 'appointments'));
    const billingSnap = await getDocs(collection(db, 'billing'));
    const bedsSnap = await getDocs(collection(db, 'beds'));

    let revenue = 0;
    billingSnap.forEach(doc => {
      if (doc.data().status === 'paid') revenue += doc.data().amount || 0;
    });

    let occupiedBeds = 0;
    bedsSnap.forEach(doc => {
      if (doc.data().status === 'occupied') occupiedBeds++;
    });

    return {
      patients: patientsSnap.size,
      doctors: doctorsSnap.size,
      appointments: appointmentsSnap.size,
      revenue,
      totalBeds: bedsSnap.size,
      occupiedBeds
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'multiple');
  }
};

// --- Bed Management ---
export const getBeds = (callback: (data: any[]) => void, ward?: string) => {
  let q = query(collection(db, 'beds'), orderBy('number', 'asc'));
  if (ward) {
    q = query(collection(db, 'beds'), where('ward', '==', ward));
  }
  return onSnapshot(q, (snapshot) => {
    let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (ward) {
      data.sort((a: any, b: any) => String(a.number).localeCompare(String(b.number)));
    }
    callback(data);
  }, (err) => handleFirestoreError(err, OperationType.LIST, 'beds'));
};

export const updateBedStatus = async (id: string, status: 'vacant' | 'occupied' | 'cleaning' | 'maintenance', patientId?: string | null, patientName?: string | null) => {
  try {
    const ref = doc(db, 'beds', id);
    const bedDoc = await getDoc(ref);
    const bedData = bedDoc.data();
    
    const updateData: any = { status, updatedAt: serverTimestamp() };
    
    if (status === 'vacant') {
      updateData.patientId = null;
      updateData.patientName = null;
    } else {
      if (patientId !== undefined) updateData.patientId = patientId;
      if (patientName !== undefined) updateData.patientName = patientName;
    }
    
    await updateDoc(ref, updateData);

    // Track in History
    await addDoc(collection(db, 'bedHistory'), {
      bedId: id,
      bedNumber: bedData?.number || 'Unknown',
      action: status === 'occupied' ? 'Patient Assigned' : `Status changed to ${status}`,
      status,
      patientName: updateData.patientName || null,
      performedBy: auth.currentUser?.displayName || auth.currentUser?.email || 'Staff',
      timestamp: serverTimestamp()
    });

  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'beds');
  }
};

export const getBedHistory = (callback: (data: any[]) => void, limitCount: number = 50) => {
  const q = query(collection(db, 'bedHistory'), orderBy('timestamp', 'desc'), limit(limitCount));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (err) => handleFirestoreError(err, OperationType.LIST, 'bedHistory'));
};

export const deleteBed = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'beds', id));
    await logActivity('Delete Bed', 'Inventory', `Deleted bed ${id}`);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'beds');
  }
};

// --- Bed Requests ---
export const createBedRequest = async (requestData: any) => {
  try {
    await addDoc(collection(db, 'bedRequests'), {
      ...requestData,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    await logActivity('Bed Request', 'Admission', `New request from ${requestData.patientName}`);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'bedRequests');
  }
};

export const getBedRequests = (callback: (data: any[]) => void, userId?: string) => {
  let q = query(collection(db, 'bedRequests'), orderBy('createdAt', 'desc'));
  if (userId) {
    // Use simple query without orderBy to avoid needing composite indexes for now
    q = query(collection(db, 'bedRequests'), where('userId', '==', userId));
  }
  return onSnapshot(q, (snapshot) => {
    let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (userId) {
      // Sort in-memory for filtered query
      data.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }
    callback(data);
  }, (err) => handleFirestoreError(err, OperationType.LIST, 'bedRequests'));
};

export const updateBedRequestStatus = async (id: string, status: 'accepted' | 'rejected') => {
  try {
    const ref = doc(db, 'bedRequests', id);
    await updateDoc(ref, { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'bedRequests');
  }
};

export const createBed = async (bedData: any) => {
  try {
    return await addDoc(collection(db, 'beds'), {
      ...bedData,
      status: bedData.status || 'vacant',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'beds');
  }
};

// --- Bed Subscriptions ---
export const createBedSubscription = async (userId: string, ward: string, bedType: string) => {
  try {
    // Check if subscription already exists
    const q = query(
      collection(db, 'bedSubscriptions'),
      where('userId', '==', userId),
      where('ward', '==', ward),
      where('bedType', '==', bedType)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return;

    await addDoc(collection(db, 'bedSubscriptions'), {
      userId,
      ward,
      bedType,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'bedSubscriptions');
  }
};

export const deleteBedSubscription = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'bedSubscriptions', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'bedSubscriptions');
  }
};

export const getBedSubscriptions = (userId: string, callback: (data: any[]) => void) => {
  const q = query(
    collection(db, 'bedSubscriptions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (err) => handleFirestoreError(err, OperationType.LIST, 'bedSubscriptions'));
};

export const findRelevantSubscriptions = async (ward: string, bedType: string) => {
  try {
    const q = query(
      collection(db, 'bedSubscriptions'),
      where('ward', '==', ward),
      where('bedType', '==', bedType)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Failed to find relevant subscriptions:', err);
    return [];
  }
};

export const getNotifications = (callback: (data: any[]) => void, userId: string) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (err) => handleFirestoreError(err, OperationType.LIST, 'notifications'));
};

export const createNotification = async (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};

export const markNotificationAsRead = async (id: string) => {
  try {
    const ref = doc(db, 'notifications', id);
    await updateDoc(ref, { read: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'notifications');
  }
};
