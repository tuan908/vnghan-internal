import React, { createContext, ReactNode, useContext, useState } from "react";

export type DialogType = "edit" | "delete" | null;

/**
 * FAANG-standard: Form UI State Context
 *
 * Isolates form UI state from table rendering to prevent re-render cascades.
 * Only form-related UI components should consume this context.
 */
export interface FormUIState {
	hasUnsavedChanges: boolean;
	activeDialog: DialogType;
	currentItemId: number | null;
	isDialogOpen: boolean;
}

export interface FormUIActions {
	setHasUnsavedChanges: (value: boolean) => void;
	setActiveDialog: (dialog: DialogType) => void;
	setCurrentItemId: (id: number | null) => void;
	closeDialog: () => void;
	openEditDialog: (itemId: number) => void;
	openDeleteDialog: (itemId: number) => void;
}

export type FormUIContextValue = FormUIState & FormUIActions;

// Create context with undefined default - components must be wrapped
const FormUIContext = createContext<FormUIContextValue | undefined>(undefined);

// Context provider component
interface FormUIProviderProps {
	children: ReactNode;
}

export function FormUIProvider({ children }: FormUIProviderProps) {
	// Form UI state - isolated from table rendering
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [activeDialog, setActiveDialog] = useState<DialogType>(null);
	const [currentItemId, setCurrentItemId] = useState<number | null>(null);

	const isDialogOpen = activeDialog !== null;

	// Action creators - stable references
	const closeDialog = React.useCallback(() => {
		setActiveDialog(null);
		setHasUnsavedChanges(false);
	}, []);

	const openEditDialog = React.useCallback((itemId: number) => {
		setCurrentItemId(itemId);
		setActiveDialog("edit");
		setHasUnsavedChanges(false);
	}, []);

	const openDeleteDialog = React.useCallback((itemId: number) => {
		setCurrentItemId(itemId);
		setActiveDialog("delete");
	}, []);

	const value: FormUIContextValue = {
		// State
		hasUnsavedChanges,
		activeDialog,
		currentItemId,
		isDialogOpen,

		// Actions
		setHasUnsavedChanges,
		setActiveDialog,
		setCurrentItemId,
		closeDialog,
		openEditDialog,
		openDeleteDialog,
	};

	return (
		<FormUIContext.Provider value={value}>{children}</FormUIContext.Provider>
	);
}

// Hook for consuming form UI context
export function useFormUI(): FormUIContextValue {
	const context = useContext(FormUIContext);
	if (!context) {
		throw new Error("useFormUI must be used within a FormUIProvider");
	}
	return context;
}

// Hook for components that only need form UI state (read-only)
export function useFormUIState(): FormUIState {
	const { hasUnsavedChanges, activeDialog, currentItemId, isDialogOpen } =
		useFormUI();
	return { hasUnsavedChanges, activeDialog, currentItemId, isDialogOpen };
}

export default FormUIContext;
