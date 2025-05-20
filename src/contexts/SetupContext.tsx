import { createContext, useContext, useState, ReactNode } from 'react';

interface SetupState {
    isSetupComplete: boolean;
    appName: string;
    appLogo: string;
    adminEmail: string;
    adminName: string;
}

interface SetupContextType {
    setupState: SetupState;
    updateSetupState: (newState: Partial<SetupState>) => void;
    completeSetup: () => void;
}

const defaultSetupState: SetupState = {
    isSetupComplete: false,
    appName: '',
    appLogo: '',
    adminEmail: '',
    adminName: '',
};

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export const SetupProvider = ({ children }: { children: ReactNode }) => {
    const [setupState, setSetupState] = useState<SetupState>(() => {
        const savedState = localStorage.getItem('setupState');
        return savedState ? JSON.parse(savedState) : defaultSetupState;
    });

    const updateSetupState = (newState: Partial<SetupState>) => {
        setSetupState(prev => {
            const updated = { ...prev, ...newState };
            localStorage.setItem('setupState', JSON.stringify(updated));
            return updated;
        });
    };

    const completeSetup = () => {
        setSetupState(prev => {
            const updated = { ...prev, isSetupComplete: true };
            localStorage.setItem('setupState', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <SetupContext.Provider value={{ setupState, updateSetupState, completeSetup }}>
            {children}
        </SetupContext.Provider>
    );
};

export const useSetup = () => {
    const context = useContext(SetupContext);
    if (context === undefined) {
        throw new Error('useSetup must be used within a SetupProvider');
    }
    return context;
}; 