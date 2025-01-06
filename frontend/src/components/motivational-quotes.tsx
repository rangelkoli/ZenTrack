import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { motivationalQuotes } from '@/lib/mockData'

export function MotivationalQuote() {
  const [quote, setQuote] = useState('')

  useEffect(() => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
    setQuote(randomQuote)
  }, [])

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <blockquote className="italic text-sm sm:text-lg text-center">{quote}</blockquote>
      </CardContent>
    </Card>
  )
}

