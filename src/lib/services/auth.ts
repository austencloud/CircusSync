// src/lib/services/auth.ts
// Authentication service for CircusSync

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { derived, writable, type Readable } from "svelte/store";
import { goto } from "$app/navigation";
import type { User } from "../types";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";

// Auth store
export const authStore = writable<{
  user: User | null;
  loading: boolean;
  error: string | null;
}>({
  user: null,
  loading: true,
  error: null,
});

// Initialize Firebase Auth
const auth = getAuth();
const db = getFirestore();

// Helper to convert Firebase User to our User model
async function createUserProfile(firebaseUser: FirebaseUser): Promise<User> {
  // Get additional user data from Firestore
  const userDocRef = doc(db, "users", firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    // User profile exists, return it
    return {
      ...(userDoc.data() as User),
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: firebaseUser.displayName || "",
      photoURL: firebaseUser.photoURL || undefined,
      lastLogin: new Date(),
    };
  } else {
    // Create a new user profile
    const newUser: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: firebaseUser.displayName || "",
      role: "readonly", // Default role for new users
      lastLogin: new Date(),
    };

    // Save to Firestore
    await setDoc(userDocRef, newUser);
    return newUser;
  }
}

// Initialize auth state listener
export function initAuth(): void {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const user = await createUserProfile(firebaseUser);
        authStore.set({ user, loading: false, error: null });
      } catch (error) {
        console.error("Error creating user profile:", error);
        authStore.set({
          user: null,
          loading: false,
          error: "Failed to load user profile",
        });
      }
    } else {
      authStore.set({ user: null, loading: false, error: null });
    }
  });
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<void> {
  authStore.update((state) => ({ ...state, loading: true, error: null }));

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Auth state listener will update the store
  } catch (error: any) {
    let errorMessage = "Failed to sign in";

    // Handle specific Firebase auth errors
    if (
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {
      errorMessage = "Invalid email or password";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "Too many failed login attempts. Please try again later.";
    }

    authStore.update((state) => ({
      ...state,
      loading: false,
      error: errorMessage,
    }));
    throw new Error(errorMessage);
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    goto("/login"); // Redirect to login page
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

// Register a new user
export async function register(
  email: string,
  password: string,
  name: string
): Promise<void> {
  authStore.update((state) => ({ ...state, loading: true, error: null }));

  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // Update profile with name
    await updateProfile(firebaseUser, { displayName: name });

    // Auth state listener will handle creating the user profile
  } catch (error: any) {
    let errorMessage = "Failed to register";

    if (error.code === "auth/email-already-in-use") {
      errorMessage = "Email is already in use";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password is too weak";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Email is invalid";
    }

    authStore.update((state) => ({
      ...state,
      loading: false,
      error: errorMessage,
    }));
    throw new Error(errorMessage);
  }
}

// Reset password
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    let errorMessage = "Failed to send password reset email";

    if (error.code === "auth/user-not-found") {
      errorMessage = "No user found with this email";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Email is invalid";
    }

    throw new Error(errorMessage);
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  data: Partial<User>
): Promise<void> {
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, data, { merge: true });

    // If current user, update auth store
    authStore.update((state) => {
      if (state.user && state.user.id === userId) {
        return {
          ...state,
          user: { ...state.user, ...data },
        };
      }
      return state;
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

// Update user role (admin only)
export async function updateUserRole(
  userId: string,
  role: User["role"]
): Promise<void> {
  authStore.update((state) => {
    // Only allow role updates if current user is admin
    if (!state.user || state.user.role !== "admin") {
      throw new Error(
        "Unauthorized: Only administrators can update user roles"
      );
    }
    return state;
  });

  await updateUserProfile(userId, { role });
}

// Check if user is authorized for a specific role
export function checkUserRole(requiredRole: User["role"]): Readable<boolean> {
  return derived(authStore, ($authStore) => {
    if (!$authStore.user) return false;

    // Admin role has access to everything
    if ($authStore.user.role === "admin") return true;

    // Manager role has access to manager and performer
    if (
      $authStore.user.role === "manager" &&
      (requiredRole === "manager" ||
        requiredRole === "performer" ||
        requiredRole === "readonly")
    ) {
      return true;
    }

    // Performer role has access to performer
    if (
      $authStore.user.role === "performer" &&
      (requiredRole === "performer" || requiredRole === "readonly")
    ) {
      return true;
    }

    // Readonly role has access only to readonly
    if ($authStore.user.role === "readonly" && requiredRole === "readonly") {
      return true;
    }

    return false;
  });
}

// Export a readable store of the current user
export const user = derived(authStore, ($authStore) => $authStore.user);

// Export a readable store of the loading state
export const loading = derived(authStore, ($authStore) => $authStore.loading);

// Export a readable store of the error state
export const error = derived(authStore, ($authStore) => $authStore.error);

// Initialize auth on app start
initAuth();

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
};
