// src/lib/services/auth.ts
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	sendPasswordResetEmail,
	updateProfile,
	signOut as firebaseSignOut,
	onAuthStateChanged,
	type User as FirebaseUser
} from 'firebase/auth';
import { derived, writable, type Readable } from 'svelte/store';
import { goto } from '$app/navigation';
import type { User } from '../types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { browser } from '$app/environment';
import { getAuthInstance, getDbInstance } from '$lib/firebase';

// --- MOCK FLAG ---
// Use 'true' to bypass Firebase Auth, 'false' to use real Firebase
// Reads from .env file (VITE_USE_MOCK_AUTH=true)
const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
// --- END MOCK FLAG ---

// Auth store
export const authStore = writable<{
	user: User | null;
	loading: boolean;
	error: string | null;
}>({
	user: null,
	loading: !useMockAuth && !browser ? false : true, // Start loading only if using Firebase & on client
	error: null
});

// Mock User Data (Only used if useMockAuth is true)
const mockUser: User = {
	id: 'mock-user-123',
	email: 'test@test.com',
	name: 'Mock User',
	role: 'admin', // Give mock user admin role for testing all features
	lastLogin: new Date(),
	photoURL: 'https://placehold.co/100x100/7FBA00/FFF?text=MU' // Placeholder image
};

async function createUserProfile(firebaseUser: FirebaseUser): Promise<User> {
	// ... (keep the existing createUserProfile function as is) ...
	// It will only be called if useMockAuth is false
	const db = getDbInstance();
	if (!db) throw new Error('Firestore not initialized');
	const userDocRef = doc(db, 'users', firebaseUser.uid);
	const userDoc = await getDoc(userDocRef);
	if (userDoc.exists()) {
		const dbData = userDoc.data();
		return {
			id: firebaseUser.uid,
			email: firebaseUser.email || dbData.email || '',
			name: firebaseUser.displayName || dbData.name || '',
			role: dbData.role || 'readonly',
			photoURL: firebaseUser.photoURL || dbData.photoURL || undefined,
			lastLogin: new Date()
		};
	} else {
		const newUser: User = {
			id: firebaseUser.uid,
			email: firebaseUser.email || '',
			name: firebaseUser.displayName || 'New User',
			role: 'readonly',
			lastLogin: new Date(),
			photoURL: firebaseUser.photoURL || undefined
		};
		await setDoc(userDocRef, newUser);
		return newUser;
	}
}

export function initAuth(): void {
	if (!browser) {
		authStore.set({ user: null, loading: false, error: null });
		return;
	}

	// --- MOCK LOGIC for initAuth ---
	if (useMockAuth) {
		console.warn('Using Mock Authentication. No real Firebase Auth listener attached.');
		// Simulate logged-out state initially, login page will call signIn
		authStore.set({ user: null, loading: false, error: null });
		return; // Skip Firebase listener setup
	}
	// --- END MOCK LOGIC ---

	// Original Firebase logic (runs only if useMockAuth is false)
	console.log('initAuth called (Client - Real Firebase)');
	const auth = getAuthInstance();
	if (!auth) {
		console.error('Auth service not available when initAuth was called (browser).');
		authStore.set({ user: null, loading: false, error: 'Auth service unavailable' });
		return;
	}
	authStore.update((state) => ({ ...state, loading: true, error: null }));
	onAuthStateChanged(
		auth,
		async (firebaseUser) => {
			// ... (keep existing onAuthStateChanged logic) ...
			console.log('Auth state changed:', firebaseUser?.uid || 'No user');
			if (firebaseUser) {
				try {
					const user = await createUserProfile(firebaseUser);
					authStore.set({ user, loading: false, error: null });
				} catch (error) {
					console.error('Error creating/loading user profile:', error);
					authStore.set({ user: null, loading: false, error: 'Failed to load user profile' });
				}
			} else {
				authStore.set({ user: null, loading: false, error: null });
			}
		},
		(error) => {
			console.error('Error in onAuthStateChanged listener:', error);
			authStore.set({ user: null, loading: false, error: 'Authentication listener error.' });
		}
	);
}

export async function signIn(email: string, password: string): Promise<void> {
	if (!browser) throw new Error('Sign in can only be called on the client.');
	authStore.update((state) => ({ ...state, loading: true, error: null }));

	// --- MOCK LOGIC for signIn ---
	if (useMockAuth) {
		console.warn(`Mock Sign In attempt for: ${email}`);
		await new Promise((res) => setTimeout(res, 500)); // Simulate network delay
		// Simple mock check - use 'test@test.com' / 'password' to log in
		if (email === 'test@test.com' && password === 'password') {
			console.log('Mock Sign In successful.');
			authStore.set({ user: mockUser, loading: false, error: null });
			goto('/'); // Redirect to dashboard after mock login
		} else {
			console.log('Mock Sign In failed.');
			const errorMsg = 'Invalid mock credentials';
			authStore.update((state) => ({ ...state, loading: false, error: errorMsg }));
			throw new Error(errorMsg);
		}
		return; // End mock logic
	}
	// --- END MOCK LOGIC ---

	// Original Firebase logic (runs only if useMockAuth is false)
	const auth = getAuthInstance();
	if (!auth) throw new Error('Auth service not available');
	try {
		await signInWithEmailAndPassword(auth, email, password);
		// Listener updates store, navigation might happen based on store change
	} catch (error: any) {
		// ... (keep existing Firebase error handling) ...
		let errorMessage = 'Failed to sign in';
		if (
			error.code === 'auth/user-not-found' ||
			error.code === 'auth/wrong-password' ||
			error.code === 'auth/invalid-credential'
		) {
			errorMessage = 'Invalid email or password';
		} else if (error.code === 'auth/too-many-requests') {
			errorMessage = 'Access temporarily disabled due to too many failed login attempts.';
		} else if (error.code === 'auth/invalid-api-key') {
			errorMessage = 'Authentication configuration error.';
		} else if (error.code === 'auth/network-request-failed') {
			errorMessage = 'Network error. Please check your connection.';
		}
		console.error('Sign in error:', error.code, error.message);
		authStore.update((state) => ({ ...state, loading: false, error: errorMessage }));
		throw new Error(errorMessage);
	}
}

export async function signOut(): Promise<void> {
	if (!browser) return;

	// --- MOCK LOGIC for signOut ---
	if (useMockAuth) {
		console.warn('Mock Sign Out');
		authStore.set({ user: null, loading: false, error: null });
		goto('/login'); // Redirect after mock logout
		return; // End mock logic
	}
	// --- END MOCK LOGIC ---

	// Original Firebase logic
	const auth = getAuthInstance();
	if (!auth) {
		console.warn('Auth not available for sign out');
		authStore.set({ user: null, loading: false, error: 'Auth unavailable' });
		goto('/login');
		return;
	}
	try {
		await firebaseSignOut(auth);
		// Listener handles store update
		goto('/login');
	} catch (error) {
		console.error('Error signing out:', error);
		authStore.update((state) => ({ ...state, error: 'Failed to sign out.' }));
		throw error;
	}
}

// --- Other Functions (register, resetPassword, etc.) ---
// Add 'useMockAuth' checks to these as well if you need to test them without Firebase.
// For now, they will likely throw errors if called while mocking is enabled.
// Example for register:
export async function register(email: string, password: string, name: string): Promise<void> {
	if (!browser) throw new Error('Register can only be called on the client.');
	if (useMockAuth) {
		console.warn('Mock Register: Simulating success, no user created.');
		authStore.update((s) => ({ ...s, loading: true }));
		await new Promise((res) => setTimeout(res, 300));
		// Simulate immediate login after register? Or just success message?
		// For now, just show success and let user log in with mock credentials.
		authStore.update((s) => ({ ...s, loading: false, error: null }));
		alert('Mock registration successful! Please log in with test@test.com / password.');
		goto('/login');
		return;
	}
	// ... (keep existing Firebase registration logic) ...
	const auth = getAuthInstance();
	if (!auth) throw new Error('Auth service not available');
	authStore.update((state) => ({ ...state, loading: true, error: null }));
	// ... rest of try/catch
}

// ... (Add similar mock guards to resetPassword, updateUserProfile, updateUserRole if needed for testing) ...
export async function resetPassword(email: string): Promise<void> {
	if (!browser) throw new Error('Password reset can only be called on the client.');
	if (useMockAuth) {
		console.warn('Mock Password Reset: Simulating email sent.');
		alert(`(Mock) Password reset email sent to ${email}`);
		return;
	}
	const auth = getAuthInstance();
	if (!auth) throw new Error('Auth service not available');
	// ... rest of try/catch
}

export async function updateUserProfile(userId: string, data: Partial<User>): Promise<void> {
	if (!browser) throw new Error('User profile update can only be called on the client.');
	if (useMockAuth) {
		console.warn('Mock Update User Profile:', userId, data);
		if (userId === mockUser.id) {
			Object.assign(mockUser, data); // Update in-memory mock user
			authStore.update((s) => (s.user ? { ...s, user: { ...s.user, ...data } } : s));
		}
		return;
	}
	const db = getDbInstance();
	if (!db) throw new Error('Database service not available');
	// ... rest of try/catch
}

export async function updateUserRole(userId: string, role: User['role']): Promise<void> {
	if (!browser) throw new Error('User role update can only be called on the client.');
	if (useMockAuth) {
		console.warn(`Mock Update User Role for ${userId} to ${role}. Requires admin.`);
		if (userId === mockUser.id && mockUser.role === 'admin') {
			// Simple check
			mockUser.role = role;
			authStore.update((s) =>
				s.user?.id === userId ? { ...s, user: { ...s.user, role: role } } : s
			);
			alert(`(Mock) Role for ${userId} updated to ${role}`);
		} else {
			alert('(Mock) Role update failed (not admin or wrong user).');
		}
		return;
	}
	// ... rest of function including permission check and calling updateUserProfile
}

// checkUserRole should work fine as it reads from the store, which is updated by mock functions
export function checkUserRole(requiredRole: User['role']): Readable<boolean> {
	// ... (keep existing derived logic) ...
	return derived(authStore, ($authStore) => {
		if (!$authStore.user || $authStore.loading) return false;
		const rolesHierarchy = { readonly: 0, performer: 1, manager: 2, admin: 3 };
		const userLevel = rolesHierarchy[$authStore.user.role] ?? -1;
		const requiredLevel = rolesHierarchy[requiredRole] ?? -1;
		return userLevel >= requiredLevel;
	});
}

// Derived stores
export const user = derived(authStore, ($authStore) => $authStore.user);
export const loading = derived(authStore, ($authStore) => $authStore.loading);
export const error = derived(authStore, ($authStore) => $authStore.error);

// Default export
export default {
	signIn,
	signOut,
	register,
	resetPassword,
	updateUserProfile,
	updateUserRole,
	user,
	loading,
	error,
	checkUserRole,
	initAuth
};
