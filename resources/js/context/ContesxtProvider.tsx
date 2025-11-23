import React, { createContext, ReactNode, SetStateAction, useContext, useState } from 'react';

type Context = {
    children: ReactNode;
};

export const ContextProvider: React.FC<Context> = ({ children }) => {
    const [pendingSubmitScore, setPendingSubmitScore] = useState(false);

    return (
        <stateContext.Provider
            value={{
                pendingSubmitScore,
                setPendingSubmitScore,
            }}
        >
            {children}
        </stateContext.Provider>
    );
};

export const useContextUser = () => {
    const context = useContext(stateContext);

    if (!context) {
        throw new Error('Context must be used within a PokemonProvider');
    }
    return context;
};

type ContextType = {
    setPendingSubmitScore: React.Dispatch<SetStateAction<boolean>>;
    pendingSubmitScore: boolean;
};
export const stateContext = createContext<ContextType | null>(null);
