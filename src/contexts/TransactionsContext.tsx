import { ReactNode, useEffect, useState, useCallback } from "react";
import { api } from "../lib/axios";
import { createContext } from "use-context-selector";

interface Transaction {
	id: number;
	description: string;
	type: 'income' | 'outcome';
	price: number;
	category: string;
	createdAt: string
}

interface TransactionsContextType {
	transactions: Transaction[];
	fetchTransactions: (query?: string) => Promise<void>;
	createTransaction: (data: CreateTransactionInput) => Promise<void>
}

export const TransactionsContext = createContext<TransactionsContextType>({} as TransactionsContextType)

interface TransactionsProviderProps {
	children: ReactNode
}

interface CreateTransactionInput {
	description: string
	price: number
	category: string
	type: 'income' | 'outcome'
}

export function TransactionsProvider({ children }: TransactionsProviderProps) {
	const [transactions, setTransactions] = useState<Transaction[]>([])

	const fetchTransactions = useCallback(
		async (query?: string) => {
			const response = await api.get('transactions', {
				params: {
					_sort: '-createdAt',
					q: query
				}
			})
	
			setTransactions(response.data)
		}, [])

	const createTransaction = useCallback(
		async (data: CreateTransactionInput) => {
			const { description, category, price, type } = data;

			const response = await api.post('transactions', {
				description,
				price,
				category,
				type,
				createdAt: new Date().toISOString()
			})

			setTransactions(state => [response.data, ...state])
		}, [])

	useEffect(() => {
		fetchTransactions()
	}, [fetchTransactions])

	return (
		<TransactionsContext.Provider value={{
			transactions: transactions,
			fetchTransactions: fetchTransactions,
			createTransaction: createTransaction
		}}>
			{children}
		</TransactionsContext.Provider>
	)
}