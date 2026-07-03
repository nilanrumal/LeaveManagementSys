import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc,
  deleteDoc,
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
  },

  async getNextEmployeeNumber(): Promise<string> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      let maxNum = 0;
      snap.forEach((doc) => {
        const data = doc.data();
        const empNo = data.employeeNo;
        if (empNo && typeof empNo === 'string' && empNo.startsWith('emp')) {
           const numPart = parseInt(empNo.substring(3), 10);
           if (!isNaN(numPart) && numPart > maxNum) {
             maxNum = numPart;
           }
        }
      });
      const nextNum = maxNum + 1;
      return `emp${String(nextNum).padStart(5, '0')}`;
    } catch (e) {
      console.error('Error auto-generating code:', e);
      return 'emp00001';
    }
  },

  async verifyEmployeeNoExists(empNo: string): Promise<UserProfile | null> {
    try {
      const q = query(
        collection(db, 'users'),
        where('employeeNo', '==', empNo.trim().toLowerCase())
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        // also try exact matching just in case
        const qExact = query(collection(db, 'users'), where('employeeNo', '==', empNo.trim()));
        const snapExact = await getDocs(qExact);
        if (snapExact.empty) {
          return null;
        }
        return snapExact.docs[0].data() as UserProfile;
      }
      return snap.docs[0].data() as UserProfile;
    } catch (e) {
      console.error('Error verifying employee No:', e);
      return null;
    }
  },

  listenAllUsers(callback: (users: UserProfile[]) => void) {
    const q = query(collection(db, 'users'));
    return onSnapshot(q, (snap) => {
      const usersList = snap.docs.map(doc => doc.data() as UserProfile);
      callback(usersList);
    }, (e) => handleFirestoreError(e, OperationTypeLocal.LIST, 'users'));
  },

  listenUserProfile(uid: string, callback: (user: UserProfile | null) => void) {
    const docRef = doc(db, 'users', uid);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data() as UserProfile);
      } else {
        callback(null);
      }
    }, (e) => handleFirestoreError(e, OperationTypeLocal.GET, `users/${uid}`));
  },

  async updateProfile(uid: string, data: Partial<UserProfile>) {
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), data);
    } catch (e) {
      handleFirestoreError(e, OperationTypeLocal.WRITE, path);
    }
  },

  async deleteProfile(uid: string) {
    const path = `users/${uid}`;
    try {
      await deleteDoc(doc(db, 'users', uid));
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
      where('employeeId', '==', uid)
    );
    return onSnapshot(q, (snap) => {
      const leaves = snap.docs.map(d => {
        const data = d.data();
        return { 
          id: d.id, 
          ...data,
          submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toMillis() : data.submittedAt,
          handledAt: data.handledAt instanceof Timestamp ? data.handledAt.toMillis() : data.handledAt
        } as LeaveRequest;
      });
      // Client-side sort to avoid composite index requirement
      const sortedLeaves = [...leaves].sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
      callback(sortedLeaves);
    }, (e) => handleFirestoreError(e, OperationTypeLocal.LIST, 'leaveRequests'));
  },

  listenAllLeaves(callback: (leaves: LeaveRequest[]) => void) {
    const q = query(
      collection(db, 'leaveRequests'),
      orderBy('submittedAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const leaves = snap.docs.map(d => {
        const data = d.data();
        return { 
          id: d.id, 
          ...data,
          submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toMillis() : data.submittedAt,
          handledAt: data.handledAt instanceof Timestamp ? data.handledAt.toMillis() : data.handledAt
        } as LeaveRequest;
      });
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

export const systemService = {
  async getSliderImage(): Promise<string> {
    try {
      const docRef = doc(db, 'settings', 'general');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data && typeof data.sliderImage === 'string') {
          return data.sliderImage;
        }
      }
    } catch (e) {
      console.error('Error fetching slider image:', e);
    }
    return "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop";
  },

  async updateSliderImage(imageUrl: string): Promise<void> {
    const path = 'settings/general';
    try {
      await setDoc(doc(db, 'settings', 'general'), {
        sliderImage: imageUrl,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationTypeLocal.WRITE, path);
    }
  },

  listenSliderImage(callback: (imageUrl: string) => void) {
    const docRef = doc(db, 'settings', 'general');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && typeof data.sliderImage === 'string') {
          callback(data.sliderImage);
          return;
        }
      }
      callback("https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop");
    }, (e) => {
      console.error('Error listening to slider image:', e);
      callback("https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop");
    });
  }
};
