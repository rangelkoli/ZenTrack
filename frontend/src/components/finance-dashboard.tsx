import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// Type definitions remain the same
interface Transaction {
  id: string;
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
  date: string;
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
    date: "",
  });
  const [date, setDate] = React.useState<Date>();
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [customCategory, setCustomCategory] = useState<string>("");

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
    fetchSummary();
  }, []);

  const fetchTransactions = async (): Promise<void> => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/finance/transactions"
      );
      const data: Transaction[] = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchSummary = async (): Promise<void> => {
    try {
      const response = await fetch("http://127.0.0.1:5000/finance/summary");
      const data: FinancialSummary = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/finance/transactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTransaction),
        }
      );
      if (response.ok) {
        fetchTransactions();
        fetchSummary();
        setNewTransaction({
          description: "",
          amount: "",
          type: "expense",
          category: "general",
          date: date ? date.toISOString() : "",
        });
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/finance/transactions/${id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        fetchTransactions();
        fetchSummary();
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
    <div className='p-4 space-y-4 bg-white dark:bg-gray-900 justify-center'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 justify-center'>
        <Card className='dark:bg-gray-800 dark:border-gray-700'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-300'>
              Total Income
            </CardTitle>
            <ArrowUpCircle className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold dark:text-white'>
              ${summary.totalIncome?.toFixed(2) || "0.00"}
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
              ${summary.totalExpenses?.toFixed(2) || "0.00"}
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
              ${summary.balance?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='dark:bg-gray-800 dark:border-gray-700 max-w-2xl'>
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
                value={customCategory}
                onChange={(e) => {
                  setCustomCategory(e.target.value);
                }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
                <option value='custom'>Custom</option>
              </select>
            </div>
            {newTransaction.category === "custom" && (
              <input
                type='text'
                placeholder='Custom Category'
                className='p-2 border w-full rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400'
                value={newTransaction.category}
                onChange={(e) => handleInputChange(e, "category")}
                required
              />
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                    "text-black dark:text-white rounded"
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0'>
                <Calendar
                  mode='single'
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className='bg-white dark:bg-gray-800 text-black dark:text-white'
                />
              </PopoverContent>
            </Popover>
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
