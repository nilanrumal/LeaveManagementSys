import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { LeaveRequest, UserProfile, OperationType } from '../types';

enum OperationTypeLocal {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationTypeLocal, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const userService = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, 'users', uid);
      const snap = await getDoc(docRef);
      return snap.exists() ? snap.data() as UserProfile : null;
    } catch (e) {
      handleFirestoreError(e, OperationTypeLocal.GET, path);
      return null;
    }
  },

  async createProfile(profile: UserProfile) {
    const path = `users/${profile.uid}`;
    try {
      await setDoc(doc(db, 'users', profile.uid), profile);
    } catch (e) {
      handleFirestoreError(e, OperationTypeLocal.WRITE, path);
    }
  }
};

export const leaveService = {
  async submitRequest(request: Omit<LeaveRequest, 'id' | 'submittedAt' | 'status'>) {
    const path = 'leaveRequests';
    try {
      await addDoc(collection(db, 'leaveRequests'), {
        ...request,
        status: 'Pending',
        submittedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationTypeLocal.WRITE, path);
    }
  },

  listenUserLeaves(uid: string, callback: (leaves: LeaveRequest[]) => void) {
    const q = query(
      collection(db, 'leaveRequests'), 
      where('employeeId', '==', uid),
      orderBy('submittedAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const leaves = snap.docs.map(d => ({ id: d.id, ...d.data() } as LeaveRequest));
      callback(leaves);
    }, (e) => handleFirestoreError(e, OperationTypeLocal.LIST, 'leaveRequests'));
  },

  listenAllLeaves(callback: (leaves: LeaveRequest[]) => void) {
    const q = query(
      collection(db, 'leaveRequests'),
      orderBy('submittedAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const leaves = snap.docs.map(d => ({ id: d.id, ...d.data() } as LeaveRequest));
      callback(leaves);
    }, (e) => handleFirestoreError(e, OperationTypeLocal.LIST, 'leaveRequests'));
  },

  async updateStatus(requestId: string, status: 'Approved' | 'Rejected', comment?: string) {
    const path = `leaveRequests/${requestId}`;
    try {
      await updateDoc(doc(db, 'leaveRequests', requestId), {
        status,
        adminComment: comment || '',
        handledAt: Date.now()
      });
    } catch (e) {
      handleFirestoreError(e, OperationTypeLocal.WRITE, path);
    }
  }
};
