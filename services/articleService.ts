import { Article } from '../types';

let MOCK_ARTICLES: Article[] = [
  {
    id: '3',
    title: 'Sostenibilidad Fiscal: Análisis Intereses vs Ingresos',
    excerpt: 'Comparativa visual del impacto de los tipos de interés en las cuentas públicas de las principales potencias económicas.',
    cells: [
      {
        id: 'c1',
        type: 'markdown',
        content: '# Deuda, Intereses y Sostenibilidad\n\nEste gráfico analiza qué porcentaje de los ingresos fiscales de cada región se destina únicamente a pagar los intereses de la deuda pública. Es un indicador clave de salud financiera a largo plazo.'
      },
      {
        id: 'c2',
        type: 'jsx',
        height: 800,
        content: `import React, { useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

// Datos estimados para 2025-2026 basados en proyecciones del FMI y CBO
const fiscalData = [
  {
    region: 'EE. UU.',
    intereses_ingresos: 16.5, // % de los ingresos fiscales destinados a pagar intereses
    ingresos_gdp: 25.8,      // % total de ingresos fiscales sobre el PIB
    coste_interes: 'Alto',
    alerta: 'Presión por tipos altos'
  },
  {
    region: 'Eurozona',
    intereses_ingresos: 5.2,  // Media agregada (Alemania es bajo, Italia es alto)
    ingresos_gdp: 46.2,      // Mayor presión fiscal que EE. UU.
    coste_interes: 'Moderado',
    alerta: 'Estabilidad fiscal'
  },
  {
    region: 'China',
    intereses_ingresos: 12.8, // Incluyendo estimaciones de deuda LGFV
    ingresos_gdp: 20.5,      // Ingresos fiscales centrales relativamente bajos
    coste_interes: 'Elevado',
    alerta: 'Riesgo en gobiernos locales'
  }
];

const App = () => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg shadow-2xl">
          <p className="font-bold text-white mb-2 underline">{label}</p>
          <p className="text-sm text-amber-400">
            Intereses / Ingresos: <span className="font-bold">{payload[0].value}%</span>
          </p>
          <p className="text-sm text-blue-400">
            Ingresos Fiscales / PIB: <span className="font-bold">{payload[1].value}%</span>
          </p>
          <div className="mt-2 pt-2 border-t border-slate-700">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Estado:</p>
            <p className="text-xs text-white">{payload[0].payload.alerta}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-white">Sostenibilidad: Intereses vs Ingresos</h1>
          <p className="text-slate-400 mt-2">¿Qué porcentaje de lo que recauda el Estado se va directamente a pagar intereses?</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={fiscalData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="region" stroke="#94a3b8" tick={{fill: '#fff'}} />
                  <YAxis yAxisId="left" stroke="#94a3b8" tick={{fill: '#94a3b8'}} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36}/>
                  
                  {/* Referencia de peligro histórico (15% es zona roja) */}
                  <ReferenceLine yAxisId="left" y={15} label={{ value: 'Zona de Peligro', position: 'right', fill: '#ef4444', fontSize: 10 }} stroke="#ef4444" strokeDasharray="5 5" />
                  
                  <Bar 
                    yAxisId="left" 
                    dataKey="intereses_ingresos" 
                    name="% Ingresos para Intereses" 
                    fill="#f59e0b" 
                    radius={[4, 4, 0, 0]} 
                    barSize={60}
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="ingresos_gdp" 
                    name="% Ingresos Fiscales / PIB" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#3b82f6' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 text-[11px] text-slate-500 italic text-center">
              Un valor de Intereses/Ingresos superior al 15% indica que la política fiscal está seriamente comprometida por el coste de la deuda.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-xl">
              <h3 className="text-amber-400 font-bold text-sm mb-2">El Problema de EE. UU.</h3>
              <p className="text-xs text-slate-300">
                A pesar de ser la economía más fuerte, su baja recaudación relativa (25% del PIB) frente a una deuda creciente y tipos altos hace que los intereses consuman ya el **16.5%** de sus ingresos. Esto es "dinero muerto" que no vuelve a la economía.
              </p>
            </div>

            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
              <h3 className="text-blue-400 font-bold text-sm mb-2">El "Buffer" de Europa</h3>
              <p className="text-xs text-slate-300">
                Europa recauda muchísimo más (46% del PIB). Esto le da un margen de maniobra enorme: aunque deba dinero, tiene una capacidad de pago muy superior en relación con lo que gasta en intereses.
              </p>
            </div>

            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
              <h3 className="text-red-400 font-bold text-sm mb-2">China: Ingreso Invisible</h3>
              <p className="text-xs text-slate-300">
                China tiene una recaudación central baja porque gran parte del dinero se queda en los gobiernos locales. Cuando estos deben pagar sus deudas, el ratio de intereses se dispara, drenando la inversión pública.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <h2 className="text-xl font-bold mb-4 text-white">Conclusión: ¿Por qué esto impulsa la Plata y el Oro?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-400">
            <p>
              Cuando un país como **EE. UU. entra en la "Zona de Peligro" (más del 15% de ingresos para intereses)**, el mercado empieza a anticipar que la única solución será imprimir dinero para devaluar la deuda o bajar los tipos de interés de forma artificial (represión financiera).
            </p>
            <p>
              Ambas soluciones son altamente **inflacionarias**. En este escenario, la plata y el oro dejan de ser "especulación" y se convierten en el único refugio para preservar el poder adquisitivo frente a un sistema fiscal que está dedicando más dinero a su pasado (deuda) que a su futuro (inversión).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;`
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