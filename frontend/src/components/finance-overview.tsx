import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface Category {
  category: string;
  amount: number;
}

interface Finances {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categories: Category[];
}

export function FinanceOverview() {
  const [finances, setFinances] = useState<Finances | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/finance/summary");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Finances = await response.json();
        setFinances(data);
      } catch (error) {
        console.error("Could not fetch finance summary:", error);
      }
    };

    fetchSummary();
  }, []);

  if (!finances) {
    return <div>Loading finance data...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Finances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-3 gap-2 sm:gap-4 mb-4 text-center'>
          <div>
            <p className='text-xs sm:text-sm font-medium'>Income</p>
            <p className='text-lg sm:text-2xl font-bold text-green-600'>
              ${finances.totalIncome.toFixed(2)}
            </p>
          </div>
          <div>
            <p className='text-xs sm:text-sm font-medium'>Expenses</p>
            <p className='text-lg sm:text-2xl font-bold text-red-600'>
              ${finances.totalExpenses.toFixed(2)}
            </p>
          </div>
          <div>
            <p className='text-xs sm:text-sm font-medium'>Savings</p>
            <p className='text-lg sm:text-2xl font-bold text-blue-600'>
              ${finances.balance.toFixed(2)}
            </p>
          </div>
        </div>
        <div>
          <h4 className='font-medium mb-2 text-sm sm:text-base'>
            Expense Categories
          </h4>
          <ul className='space-y-1 text-xs sm:text-sm'>
            {finances.categories.map((category, index) => (
              <li key={index} className='flex justify-between'>
                <span>{category.category}</span>
                <span>${category.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
