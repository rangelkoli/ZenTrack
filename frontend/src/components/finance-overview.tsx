import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { finances } from '@/lib/mockData'

export function FinanceOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Finances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 text-center">
          <div>
            <p className="text-xs sm:text-sm font-medium">Income</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600">${finances.income}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium">Expenses</p>
            <p className="text-lg sm:text-2xl font-bold text-red-600">${finances.expenses}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium">Savings</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-600">${finances.savings}</p>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-sm sm:text-base">Expense Categories</h4>
          <ul className="space-y-1 text-xs sm:text-sm">
            {finances.categories.map((category, index) => (
              <li key={index} className="flex justify-between">
                <span>{category.name}</span>
                <span>${category.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

