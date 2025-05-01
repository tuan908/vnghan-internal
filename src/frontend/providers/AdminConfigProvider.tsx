// In a new file: /contexts/AdminConfigContext.tsx
"use client";

import {
	createContext,
	type FC,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

export interface AdminConfig {
	todayHighlightColor: string;
}

interface AdminConfigContextType {
	config: AdminConfig;
	updateConfig: (newConfig: Partial<AdminConfig>) => void;
}

const defaultConfig: AdminConfig = {
	todayHighlightColor: "bg-red-200", // Default Tailwind red background
};

export const AdminConfigContext = createContext<AdminConfigContextType>({
	config: defaultConfig,
	updateConfig: () => {}, // Default empty function
});

interface AdminConfigProviderProps {
	children: ReactNode;
}

export const AdminConfigProvider: FC<AdminConfigProviderProps> = ({
	children,
}) => {
	const [config, setConfig] = useState<AdminConfig>(defaultConfig);

	// Load config from localStorage on mount
	useEffect(() => {
		try {
			const savedConfig = localStorage.getItem("adminConfig");
			if (savedConfig) {
				setConfig(JSON.parse(savedConfig));
			}
		} catch (error) {
			console.error("Failed to load admin config:", error);
		}
	}, []);

	const updateConfig = (newConfig: Partial<AdminConfig>): void => {
		try {
			const updatedConfig = { ...config, ...newConfig };
			setConfig(updatedConfig);
			localStorage.setItem("adminConfig", JSON.stringify(updatedConfig));
		} catch (error) {
			console.error("Failed to save admin config:", error);
		}
	};

	return (
		<AdminConfigContext.Provider value={{ config, updateConfig }}>
			{children}
		</AdminConfigContext.Provider>
	);
};

export const useAdminConfig = (): AdminConfigContextType =>
	useContext(AdminConfigContext);
