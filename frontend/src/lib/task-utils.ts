// Common task categories mapped to keywords and phrases
const categoryKeywords: Record<string, string[]> = {
  'Work': [
    'report', 'meeting', 'deadline', 'project', 'presentation', 'client', 
    'office', 'email', 'boss', 'colleague', 'proposal', 'business',
    'interview', 'hire', 'job', 'career', 'professional'
  ],
  'Personal': [
    'health', 'doctor', 'appointment', 'gym', 'workout', 'exercise', 
    'meditation', 'selfcare', 'hobby', 'relax', 'family', 'friend', 
    'social', 'party', 'date', 'relationship', 'home'
  ],
  'Shopping': [
    'buy', 'purchase', 'order', 'grocery', 'store', 'mall', 'shop',
    'market', 'item', 'product', 'online', 'delivery', 'amazon', 'shopping',
    'price', 'sale', 'discount'
  ],
  'Finance': [
    'pay', 'bill', 'budget', 'money', 'bank', 'transaction', 'invest', 
    'tax', 'financial', 'expense', 'income', 'salary', 'loan', 'debt',
    'credit', 'insurance', 'saving'
  ],
  'Education': [
    'study', 'learn', 'course', 'homework', 'assignment', 'exam', 'test', 
    'research', 'school', 'college', 'university', 'lecture', 'class',
    'grade', 'lesson', 'teaching', 'student', 'book', 'read'
  ],
  'Home': [
    'clean', 'laundry', 'cook', 'repair', 'fix', 'organize', 'furniture', 
    'kitchen', 'bathroom', 'bedroom', 'living', 'rent', 'mortgage', 'move',
    'house', 'apartment', 'chore', 'renovation'
  ],
  'Travel': [
    'trip', 'vacation', 'flight', 'hotel', 'booking', 'reservation', 'tour',
    'visit', 'pack', 'passport', 'ticket', 'destination', 'journey', 'travel',
    'suitcase', 'airport', 'bus', 'train'
  ],
  'Health': [
    'exercise', 'medicine', 'prescription', 'doctor', 'therapy', 'diet',
    'nutrition', 'vitamins', 'sleep', 'rest', 'wellness', 'medical', 'health',
    'dentist', 'checkup', 'vaccine', 'symptom'
  ]
};

// Natural language processing for category suggestion
export const suggestCategory = (text: string, existingCategories: string[] = []): string => {
  const normalizedText = text.toLowerCase();
  
  // Calculate scores for each category
  const scores = Object.entries(categoryKeywords).map(([category, keywords]) => {
    const score = keywords.reduce((total, keyword) => {
      if (normalizedText.includes(keyword.toLowerCase())) {
        // Give more weight to exact matches or when keyword appears at the beginning
        const weight = normalizedText.startsWith(keyword.toLowerCase()) ? 2 : 1;
        return total + weight;
      }
      return total;
    }, 0);
    
    // Boost score if the category already exists in user's tasks
    const boostFactor = existingCategories.includes(category) ? 1.5 : 1;
    
    return { category, score: score * boostFactor };
  });
  
  // Find the category with the highest score
  const bestMatch = scores.reduce((best, current) => 
    current.score > best.score ? current : best, 
    { category: 'Other', score: 0 }
  );
  
  // Use "Other" as default if no good matches found
  return bestMatch.score > 0 ? bestMatch.category : 'Other';
};

// Format date for display
export const formatDate = (date: Date | null): string => {
  if (!date) return '';
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  
  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
};

// Priority color mapping
export const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
};

// Category color mapping for visual distinction
export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Work': 'bg-indigo-100 border-indigo-300',
    'Personal': 'bg-purple-100 border-purple-300',
    'Shopping': 'bg-green-100 border-green-300',
    'Finance': 'bg-blue-100 border-blue-300',
    'Education': 'bg-yellow-100 border-yellow-300',
    'Home': 'bg-orange-100 border-orange-300',
    'Travel': 'bg-sky-100 border-sky-300',
    'Health': 'bg-rose-100 border-rose-300',
    'Other': 'bg-gray-100 border-gray-300',
  };
  
  return colors[category] || 'bg-gray-100 border-gray-300';
};
