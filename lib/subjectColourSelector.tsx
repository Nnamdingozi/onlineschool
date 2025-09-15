// utils/colorUtils.ts

const subjectColors: Record<string, string> = {
  mathematics: 'bg-red-500',
  'further-mathematics': 'bg-green-500',
  'basic-science': 'bg-blue-500',
  english: 'bg-yellow-500',
  geography: 'bg-purple-500',
  biology: 'bg-rose-500',
  'social-studies': 'bg-yellow-500',
  chemistry: 'bg-green-300',
};

const defaultColor = 'bg-green-400';

export function getSubjectColor(slug: string): string {
  return subjectColors[slug] ?? defaultColor;
}


//   "slug": "basic-science"
// },
// {
//   "slug": "basic-technology"
// },
// {
//   "slug": "physical-and-health-education"
// },
// {
//   "slug": "information-and-communication-technology"
// },
// {
//   "slug": "civic-education"
// },
// {
//   "slug": "cultural-and-creative-arts"
// },
// {
//   "slug": "business-studies"
// },
// {
//   "slug": "christian-religious-studies"
// },
// {
//   "slug": "islamic-religious-studies"
// },
// {
//   "slug": "agricultural-science"
// },
// {
//   "slug": "home-economics"
// },
// {
//   "slug": "french-language"
// },
// {
//   "slug": "arabic-language"
// },
// {
//   "slug": "igbo-language"
// },
// {
//   "slug": "music"
// },
// {
//   "slug": "fine-arts"
// },
// {
//   "slug": "drama-/-theatre-arts"
// },
// {
//   "slug": "one-trade/entrepreneurship-subject"
// },
// {
//   "slug": "biology"
// },
// {
//   "slug": "chemistry"
// },
// {
//   "slug": "physics"
// },
// {
//   "slug": "literature-in-english"
// },
// {
//   "slug": "government"
// },
// {
//   "slug": "history"
// },
// {
//   "slug": "geography"
// },
// {
//   "slug": "economics"
// },
// {
//   "slug": "auto-mechanics"
// },
// {
//   "slug": "book-keeping"
// },
// {
//   "slug": "commerce"
// },
// {
//   "slug": "marketing"
// },
// {
//   "slug": "data-processing"
// },
// {
//   "slug": "fisheries"
// },
// {
//   "slug": "garment-making"
// },
// {
//   "slug": "food-and-nutrition"
// },
// {
//   "slug": "yoruba-language"
// },
// {
//   "slug": "igbo-language"
// },
// {
//   "slug": "hausa-language"
// },
// {
//   "slug": "financial-accounting"
// },
// {
//   "slug": "animal-husbandry"
// },
// {
//   "slug": "salesmanship"
// }
// ]
// // 