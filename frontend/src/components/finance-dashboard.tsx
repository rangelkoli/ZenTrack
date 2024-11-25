import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  PieChart,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Type definitions remain the same
interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

interface TransactionFormData {
  description: string;
  amount: string;
  type: "income" | "expense";
  category: string;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

const FinanceDashboard: React.FC = () => {
  // State definitions remain the same
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTransaction, setNewTransaction] = useState<TransactionFormData>({
    description: "",
    amount: "",
    type: "expense",
    category: "general",
  });
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });

  const categories: string[] = [
    "general",
    "food",
    "transportation",
    "utilities",
    "entertainment",
    "shopping",
  ];

  // Functions remain the same
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async (): Promise<void> => {
    try {
      const response = await fetch("http://localhost:5000/api/transactions");
      const data: Transaction[] = await response.json();
      setTransactions(data);
      calculateSummary(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const calculateSummary = (transactionData: Transaction[]): void => {
    const summary = transactionData.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.totalIncome += parseFloat(transaction.amount.toString());
        } else {
          acc.totalExpenses += parseFloat(transaction.amount.toString());
        }
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0 }
    );

    summary.balance = summary.totalIncome - summary.totalExpenses;
    setSummary(summary as FinancialSummary);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTransaction),
      });
      if (response.ok) {
        fetchTransactions();
        setNewTransaction({
          description: "",
          amount: "",
          type: "expense",
          category: "general",
        });
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const deleteTransaction = async (id: number): Promise<void> => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/transactions/${id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        fetchTransactions();
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof TransactionFormData
  ): void => {
    setNewTransaction((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  return (
    <div className='p-4 space-y-4 bg-white dark:bg-gray-900'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='dark:bg-gray-800 dark:border-gray-700'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-300'>
              Total Income
            </CardTitle>
            <ArrowUpCircle className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold dark:text-white'>
              ${summary.totalIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className='dark:bg-gray-800 dark:border-gray-700'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-300'>
              Total Expenses
            </CardTitle>
            <ArrowDownCircle className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold dark:text-white'>
              ${summary.totalExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className='dark:bg-gray-800 dark:border-gray-700'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-300'>
              Balance
            </CardTitle>
            <DollarSign className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold dark:text-white'>
              ${summary.balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='dark:bg-gray-800 dark:border-gray-700'>
        <CardHeader>
          <CardTitle className='dark:text-white'>Add Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <input
                type='text'
                placeholder='Description'
                className='p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400'
                value={newTransaction.description}
                onChange={(e) => handleInputChange(e, "description")}
                required
              />
              <input
                type='number'
                placeholder='Amount'
                className='p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400'
                value={newTransaction.amount}
                onChange={(e) => handleInputChange(e, "amount")}
                required
              />
              <select
                className='p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                value={newTransaction.type}
                onChange={(e) => handleInputChange(e, "type")}
              >
                <option value='expense'>Expense</option>
                <option value='income'>Income</option>
              </select>
              <select
                className='p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                value={newTransaction.category}
                onChange={(e) => handleInputChange(e, "category")}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <button
              type='submit'
              className='w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 flex items-center justify-center gap-2'
            >
              <Plus className='h-4 w-4' />
              Add Transaction
            </button>
          </form>
        </CardContent>
      </Card>

      <Card className='dark:bg-gray-800 dark:border-gray-700'>
        <CardHeader>
          <CardTitle className='dark:text-white'>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className='flex items-center justify-between p-4 border rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'
              >
                <div>
                  <div className='font-medium dark:text-white'>
                    {transaction.description}
                  </div>
                  <div className='text-sm text-gray-500 dark:text-gray-400'>
                    {transaction.category} •{" "}
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <span
                    className={`font-medium ${
                      transaction.type === "income"
                        ? "text-green-500 dark:text-green-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}$
                    {parseFloat(transaction.amount.toString()).toFixed(2)}
                  </span>
                  <button
                    onClick={() => deleteTransaction(transaction.id)}
                    className='text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                    type='button'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceDashboard;
