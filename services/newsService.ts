
import { Article } from '../types';

// Mock data for different industries
const mockNewsData: { [key: string]: Article[] } = {
  Healthcare: [
    { title: "AI Revolutionizes Drug Discovery", description: "New AI models are predicting protein structures, accelerating the creation of new medicines by years.", url: "#" },
    { title: "Telehealth Adoption Surges Post-Pandemic", description: "Virtual doctor visits are now a permanent fixture in the healthcare landscape, improving access to care.", url: "#" },
    { title: "Breakthrough in Gene Editing with CRISPR", description: "Scientists announce a major step forward in CRISPR technology, potentially curing several genetic disorders.", url: "#" },
    { title: "Wearable Tech Now Monitors Glucose Levels", description: "A new smart watch can monitor blood sugar levels non-invasively, a game-changer for diabetics.", url: "#" },
    { title: "The Rise of Personalized Medicine", description: "Treatments are now being tailored to individual genetic profiles, leading to better patient outcomes.", url: "#" },
    { title: "Mental Health Apps See Record Growth", description: "Digital platforms for mental wellness are becoming essential tools for millions worldwide.", url: "#" },
    { title: "Robotic Surgery Becomes More Accessible", description: "The cost of surgical robots is decreasing, allowing more hospitals to offer minimally invasive procedures.", url: "#" },
    { title: "Fighting Superbugs with Phage Therapy", description: "An old method of using viruses to fight bacteria is making a comeback against antibiotic-resistant infections.", url: "#" },
    { title: "3D Printing Organs Moves Closer to Reality", description: "Researchers successfully 3D print a functional miniature human heart, a major milestone.", url: "#" },
    { title: "Global Vaccine Collaboration for Future Pandemics", description: "Nations are forming alliances to ensure rapid development and equitable distribution of vaccines.", url: "#" },
  ],
  Technology: [
    { title: "Quantum Computing Achieves New Milestone", description: "A new quantum processor has solved a problem previously thought to be unsolvable by classical computers.", url: "#" },
    { title: "The Metaverse Economy: Beyond Gaming", description: "Virtual real estate and digital assets are creating a new, trillion-dollar digital economy.", url: "#" },
    { title: "Next-Gen AI Models Can Reason and Plan", description: "The latest large language models are showing surprising capabilities in logical reasoning and multi-step planning.", url: "#" },
    { title: "Sustainable Tech: The Push for Green Data Centers", description: "Major tech companies are investing billions in renewable energy to power their data centers.", url: "#" },
    { title: "Cybersecurity in the Age of AI Threats", description: "Experts are warning of new, sophisticated cyber attacks powered by generative AI.", url: "#" },
    { title: "Decentralized Internet (Web3) Gains Traction", description: "A new vision for the internet, built on blockchain technology, promises more user control and privacy.", url: "#" },
    { title: "The Future of Work is Hybrid and Asynchronous", description: "Companies are redesigning workflows to accommodate flexible schedules and remote collaboration.", url: "#" },
    { title: "Solid-State Batteries to Revolutionize EVs", description: "A breakthrough in battery technology could double the range of electric vehicles and reduce charging times.", url: "#" },
    { title: "Augmented Reality Glasses Go Mainstream", description: "Sleek, lightweight AR glasses are finally ready for the consumer market, blending digital and physical worlds.", url: "#" },
    { title: "Ethical AI: New Frameworks for Responsible Development", description: "Governments and organizations are establishing new rules to ensure AI is developed and used ethically.", url: "#" },
  ],
};

mockNewsData.Finance = [...mockNewsData.Technology].reverse();
mockNewsData['Renewable Energy'] = [...mockNewsData.Healthcare].reverse();
mockNewsData['E-commerce'] = [...mockNewsData.Technology, ...mockNewsData.Healthcare].slice(0, 10);

/**
 * Mocks fetching the top 10 news articles for a given industry.
 * In a real application, this would make an API call to a news service like GNews.
 * @param industry The industry to fetch news for.
 * @returns A promise that resolves to an array of Article objects.
 */
export const fetchTopNews = (industry: string): Promise<Article[]> => {
  console.log(`Fetching mock news for: ${industry}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockNewsData[industry] || mockNewsData.Technology);
    }, 500); // Simulate network delay
  });
};
