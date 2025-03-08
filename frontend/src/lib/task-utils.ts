import { format } from "date-fns";

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
export const formatDate = (date: Date): string => {
  try {
    return format(date, "MMM d, yyyy");
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

// Priority color mapping
export const priorityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

// Get category color for visual indication
export const getCategoryColor = (category: string): string => {
  // Generate a consistent color based on the category name
  const colors = [
    "border-l-4 border-blue-500",
    "border-l-4 border-green-500",
    "border-l-4 border-purple-500",
    "border-l-4 border-orange-500",
    "border-l-4 border-pink-500",
    "border-l-4 border-indigo-500",
    "border-l-4 border-cyan-500",
    "border-l-4 border-rose-500",
  ];

  if (!category) {
    return "border-l-4 border-gray-300";
  }

  // Use a hash function to get a consistent index for the same category
  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };

  const index = Math.abs(hashCode(category) % colors.length);
  return colors[index];
};
