import { Article } from '../types';

let MOCK_ARTICLES: Article[] = [
  {
    id: '3',
    title: 'Global Money Supply vs GDP Analysis',
    excerpt: 'An interactive analysis of M2 Money Supply correlation with Real GDP across major economic zones (USA, Eurozone, China) over the last century.',
    cells: [
      {
        id: 'c1',
        type: 'markdown',
        content: '# Global Economic Indicators\n\nThis chart visualizes the correlation between **M2 Money Supply** and **Real GDP** over the last 100 years. Notice the divergence patterns during major economic crises.'
      },
      {
        id: 'c2',
        type: 'jsx',
        content: `import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';

// Historical estimates based on FRED (USA), World Bank/NBS (China) and ECB
const data = [
  { year: 1925, us_m2: 0.8, us_gdp: 1.1, eu_m2: null, eu_gdp: 0.9, cn_m2: null, cn_gdp: null },
  { year: 1930, us_m2: 0.9, us_gdp: 1.2, eu_m2: null, eu_gdp: 1.0, cn_m2: null, cn_gdp: null },
  { year: 1940, us_m2: 1.5, us_gdp: 1.6, eu_m2: null, eu_gdp: 0.8, cn_m2: null, cn_gdp: null },
  { year: 1950, us_m2: 2.8, us_gdp: 2.5, eu_m2: 1.2, eu_gdp: 1.5, cn_m2: null, cn_gdp: 0.2 },
  { year: 1960, us_m2: 3.5, us_gdp: 3.8, eu_m2: 2.0, eu_gdp: 2.8, cn_m2: null, cn_gdp: 0.3 },
  { year: 1970, us_m2: 5.2, us_gdp: 5.5, eu_m2: 3.5, eu_gdp: 4.5, cn_m2: null, cn_gdp: 0.4 },
  { year: 1980, us_m2: 6.8, us_gdp: 7.8, eu_m2: 5.8, eu_gdp: 7.2, cn_m2: 0.2, cn_gdp: 0.6 },
  { year: 1990, us_m2: 8.5, us_gdp: 10.2, eu_m2: 8.2, eu_gdp: 9.8, cn_m2: 0.8, cn_gdp: 1.2 },
  { year: 2000, us_m2: 11.2, us_gdp: 13.5, eu_m2: 10.5, eu_gdp: 12.5, cn_m2: 3.5, cn_gdp: 3.8 },
  { year: 2010, us_m2: 16.5, us_gdp: 16.8, eu_m2: 14.8, eu_gdp: 14.2, cn_m2: 12.5, cn_gdp: 10.5 },
  { year: 2015, us_m2: 19.8, us_gdp: 18.5, eu_m2: 16.5, eu_gdp: 15.5, cn_m2: 18.2, cn_gdp: 14.2 },
  { year: 2020, us_m2: 25.4, us_gdp: 20.2, eu_m2: 20.2, eu_gdp: 16.8, cn_m2: 26.5, cn_gdp: 18.5 },
  { year: 2024, us_m2: 24.8, us_gdp: 22.5, eu_m2: 21.5, eu_gdp: 18.2, cn_m2: 32.4, cn_gdp: 21.8 },
  { year: 2026, us_m2: 25.1, us_gdp: 23.8, eu_m2: 22.8, eu_gdp: 19.5, cn_m2: 35.2, cn_gdp: 23.5 },
];

const Chart = () => {
  const [region, setRegion] = useState('us');
  const [logScale, setLogScale] = useState(false);

  const regionInfo = {
    us: { name: 'United States', m2Key: 'us_m2', gdpKey: 'us_gdp', colorM2: '#3b82f6', colorGDP: '#10b981' },
    eu: { name: 'Eurozone', m2Key: 'eu_m2', gdpKey: 'eu_gdp', colorM2: '#8b5cf6', colorGDP: '#f59e0b' },
    cn: { name: 'China', m2Key: 'cn_m2', gdpKey: 'cn_gdp', colorM2: '#ef4444', colorGDP: '#ec4899' },
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg text-slate-100 font-sans">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex bg-slate-700 p-1 rounded-lg">
          {Object.entries(regionInfo).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setRegion(key)}
              style={{
                 backgroundColor: region === key ? '#4f46e5' : 'transparent',
                 color: region === key ? 'white' : '#cbd5e1',
              }}
              className="px-4 py-2 rounded-md transition-all font-medium"
            >
              {info.name}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => setLogScale(!logScale)}
          className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-sm transition-colors"
        >
          {logScale ? 'Log Scale: ON' : 'Log Scale: OFF'}
        </button>
      </div>

      <div style={{ height: 400, width: '100%' }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="year" stroke="#94a3b8" />
            <YAxis 
              scale={logScale ? 'log' : 'auto'} 
              domain={logScale ? ['auto', 'auto'] : [0, 'auto']}
              stroke="#94a3b8"
            />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }}
            />
            <Legend verticalAlign="top" height={36} />
            <Line 
              type="monotone" 
              dataKey={regionInfo[region].m2Key} 
              name="M2 Supply" 
              stroke={regionInfo[region].colorM2} 
              strokeWidth={3}
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey={regionInfo[region].gdpKey} 
              name="Real GDP" 
              stroke={regionInfo[region].colorGDP} 
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Chart;`
      },
      {
        id: 'c3',
        type: 'markdown',
        content: '### Key Takeaways\n\nThe gap between M2 and GDP growth has widened significantly in recent years. This metric is often used by macro-economists to gauge potential inflationary pressures in the asset markets.'
      }
    ],
    publishedAt: '2025-06-10',
    readTime: 'Interactive Chart',
    tags: ['Economics', 'Recharts', 'React'],
  },
  {
    id: '1',
    title: 'The Architecture of AI-First Applications',
    excerpt: 'Exploring how Large Language Models are reshaping the fundamental structure of modern web applications.',
    cells: [
        {
            id: 'c1',
            type: 'markdown',
            content: '# The Architecture of AI-First Applications\n\nIn the last decade, we built applications that *might* use AI. Today, we are building applications where AI is the *kernel*.\n\n## The Inversion of Control\n\nTraditionally, user interfaces were deterministic state machines. You click a button, a specific function runs, and the state updates. With LLMs, the "function" is often a probabilistic prompt that yields creative, unscripted results.'
        },
        {
            id: 'c2',
            type: 'markdown',
            content: '### Key Components\n\n1. **The Context Window**: Think of this as your new RAM.\n2. **Streaming UI**: Latency is high, so perceived performance relies on streaming tokens.\n3. **RAG (Retrieval Augmented Generation)**: Grounding the model in your own data.'
        }
    ],
    publishedAt: '2025-05-15',
    readTime: '5 min read',
    tags: ['AI', 'Architecture', 'React'],
  },
  {
    id: '2',
    title: 'Interactive Data: A Live Demo',
    excerpt: 'A demonstration of embedding raw HTML, CSS, and JavaScript directly into the portfolio to create interactive visualizations.',
    cells: [
        {
            id: 'c1',
            type: 'html',
            content: `<style>
  .demo-container {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    font-family: 'JetBrains Mono', monospace;
  }
  .orb {
    width: 60px;
    height: 60px;
    background: radial-gradient(circle at 30% 30%, #22d3ee, #0891b2);
    border-radius: 50%;
    margin: 0 auto 20px;
    box-shadow: 0 0 20px #22d3ee80;
    transition: transform 0.1s;
  }
</style>
<div class="demo-container">
  <h3>Interactive Physics Orb</h3>
  <div class="orb" id="orb"></div>
</div>
<script>
  (function() {
     const orb = document.getElementById('orb');
     let y = 0, dir = 1;
     setInterval(() => {
        y += dir;
        if(y > 20 || y < -20) dir *= -1;
        orb.style.transform = "translateY(" + y + "px)";
     }, 30);
  })();
</script>`
        }
    ],
    publishedAt: '2025-06-02',
    readTime: 'Interactive',
    tags: ['Visualization', 'D3', 'Canvas'],
  }
];

export const fetchArticles = async (): Promise<Article[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  return [...MOCK_ARTICLES];
};

export const saveArticle = async (article: Article): Promise<Article> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (!article.id) {
    // Create new
    const newArticle = {
      ...article,
      id: Date.now().toString(),
      publishedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    };
    MOCK_ARTICLES.unshift(newArticle);
    return newArticle;
  } else {
    // Update existing
    const index = MOCK_ARTICLES.findIndex(a => a.id === article.id);
    if (index !== -1) {
      MOCK_ARTICLES[index] = article;
      return article;
    }
    throw new Error('Article not found');
  }
};