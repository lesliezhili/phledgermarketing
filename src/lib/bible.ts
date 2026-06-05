export interface Verse {
  text: string
  reference: string
  category: string
}

export const BIBLE_VERSES: Verse[] = [
  { text: "Commit to the LORD whatever you do, and he will establish your plans.", reference: "Proverbs 16:3", category: "business" },
  { text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11", category: "hope" },
  { text: "Whatever you do, work heartily, as for the Lord and not for men.", reference: "Colossians 3:23", category: "work" },
  { text: "The plans of the diligent lead surely to abundance, but everyone who is hasty comes only to poverty.", reference: "Proverbs 21:5", category: "business" },
  { text: "Iron sharpens iron, and one man sharpens another.", reference: "Proverbs 27:17", category: "networking" },
  { text: "A good name is to be chosen rather than great riches, and favor is better than silver or gold.", reference: "Proverbs 22:1", category: "branding" },
  { text: "Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.", reference: "Matthew 5:16", category: "marketing" },
  { text: "Where there is no vision, the people perish.", reference: "Proverbs 29:18", category: "leadership" },
  { text: "Two are better than one, because they have a good return for their labor.", reference: "Ecclesiastes 4:9", category: "networking" },
  { text: "The LORD will make you the head, not the tail.", reference: "Deuteronomy 28:13", category: "success" },
  { text: "Trust in the LORD with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5", category: "faith" },
  { text: "Ask and it will be given to you; seek and you will find; knock and the door will be opened to you.", reference: "Matthew 7:7", category: "sales" },
  { text: "For where your treasure is, there your heart will be also.", reference: "Matthew 6:21", category: "finance" },
  { text: "The blessing of the LORD makes rich, and he adds no sorrow with it.", reference: "Proverbs 10:22", category: "wealth" },
  { text: "A generous person will prosper; whoever refreshes others will be refreshed.", reference: "Proverbs 11:25", category: "generosity" },
  { text: "Whoever can be trusted with very little can also be trusted with much.", reference: "Luke 16:10", category: "stewardship" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.", reference: "Joshua 1:9", category: "courage" },
  { text: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13", category: "strength" },
  { text: "The tongue has the power of life and death, and those who love it will eat its fruit.", reference: "Proverbs 18:21", category: "communication" },
  { text: "A word fitly spoken is like apples of gold in a setting of silver.", reference: "Proverbs 25:11", category: "content" },
  { text: "In all your ways acknowledge Him, and He shall direct your paths.", reference: "Proverbs 3:6", category: "guidance" },
  { text: "And let us not grow weary of doing good, for in due season we will reap, if we do not give up.", reference: "Galatians 6:9", category: "perseverance" },
  { text: "For which of you, desiring to build a tower, does not first sit down and count the cost.", reference: "Luke 14:28", category: "planning" },
  { text: "Well done, good and faithful servant! You have been faithful with a few things; I will put you in charge of many things.", reference: "Matthew 25:21", category: "faithfulness" },
  { text: "He who gathers money little by little makes it grow.", reference: "Proverbs 13:11", category: "finance" },
  { text: "Delight yourself in the LORD, and he will give you the desires of your heart.", reference: "Psalm 37:4", category: "desire" },
  { text: "The LORD is my shepherd; I shall not want.", reference: "Psalm 23:1", category: "provision" },
  { text: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.", reference: "Matthew 6:33", category: "priorities" },
  { text: "Do nothing out of selfish ambition or vain conceit. Rather, in humility value others above yourselves.", reference: "Philippians 2:3", category: "humility" },
  { text: "The fear of the LORD is the beginning of wisdom.", reference: "Proverbs 9:10", category: "wisdom" },
]

export function getDailyVerse(): Verse {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return BIBLE_VERSES[dayOfYear % BIBLE_VERSES.length]
}

export function getVerseByCategory(category: string): Verse {
  const filtered = BIBLE_VERSES.filter(v => v.category === category)
  if (filtered.length === 0) return BIBLE_VERSES[0]
  return filtered[Math.floor(Math.random() * filtered.length)]
}

export const MARKETING_WISDOM = [
  {
    title: "The Power of Your Personal Brand",
    verse: "A good name is to be chosen rather than great riches (Proverbs 22:1)",
    lesson: "Your LinkedIn profile IS your professional brand. Just as Scripture teaches that reputation is more valuable than wealth, invest in building an authentic, trustworthy presence.",
    application: "Optimize your LinkedIn headline to reflect your core values and unique value proposition. Be authentic — don't oversell."
  },
  {
    title: "Content That Speaks Life",
    verse: "The tongue has the power of life and death (Proverbs 18:21)",
    lesson: "Every post you publish on LinkedIn has the power to inspire, educate, or discourage. Choose words that build up your audience.",
    application: "Before posting, ask: Does this content serve others? Does it speak life into their careers?"
  },
  {
    title: "The Networking Principle",
    verse: "Iron sharpens iron, and one man sharpens another (Proverbs 27:17)",
    lesson: "LinkedIn networking isn't about collecting connections — it's about building mutual growth relationships.",
    application: "Send personalized connection requests. Engage meaningfully with others' content. Offer help before asking for favors."
  },
  {
    title: "Strategic Planning",
    verse: "For which of you, desiring to build a tower, does not first count the cost (Luke 14:28)",
    lesson: "Effective LinkedIn marketing requires planning. Don't post randomly — develop a content calendar and track metrics.",
    application: "Create a 30-day content plan. Define your KPIs. Review weekly."
  },
  {
    title: "Perseverance in Marketing",
    verse: "Let us not grow weary of doing good, for in due season we will reap (Galatians 6:9)",
    lesson: "LinkedIn success doesn't happen overnight. Consistent engagement builds compound trust and authority.",
    application: "Commit to posting 3-5x/week for 90 days. Engage with 10 posts daily. The harvest will come."
  },
  {
    title: "Servant Leadership in Business",
    verse: "Do nothing out of selfish ambition. In humility value others above yourselves (Philippians 2:3)",
    lesson: "The most effective LinkedIn marketers are those who serve their audience first. Give value freely.",
    application: "Share knowledge without gatekeeping. Celebrate others' wins. Recommend competitors when it serves the client better."
  },
]
