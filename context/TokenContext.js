
import { createContext, useState, useContext } from "react";
export const TokenContext = createContext();
export const useTokens = () => useContext(TokenContext);
export const TokenProvider = ({ children }) => {
  const [balance, setBalance] = useState(5); // 1re conversion offerte
  const debit = (n) => setBalance((b) => b - n);
  const credit = (n) => setBalance((b) => b + n);
  return (
    <TokenContext.Provider value={{ balance, debit, credit }}>
      {children}
    </TokenContext.Provider>
  );
}
