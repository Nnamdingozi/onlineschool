// utils/colorUtils.ts

const subjectColors: Record<string, string> = {
    Mathematics: 'bg-red-500',
    English: 'bg-green-500',
    Science: 'bg-blue-500',
    History: 'bg-yellow-500',
    Geography: 'bg-purple-500',
    // Add more subjects as needed...
  };
  
  const defaultColor = 'bg-gray-500';
  
  export function getSubjectColor(subjectName: string): string {
    // Normalize name: capitalize first letter for matching
    const name = subjectName.trim();
    return subjectColors[name] ?? defaultColor;
  }
  
  // Optionally, export subjectColors if you want to dynamically add to it
  export { subjectColors };
  