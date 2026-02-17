import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fetchArticles, saveArticle } from '../services/articleService';
import { Article, ArticleCell, ArticleCellType } from '../types';
import { Loader2, Calendar, Clock, ArrowLeft, Tag, Plus, Edit3, Save, Eye, Code, X, MoveUp, MoveDown, Trash2, Image as ImageIcon, Box } from 'lucide-react';
import { marked } from 'marked';

// --- Main Tab Component ---

export const WritingsTab: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'view' | 'edit'>('list');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchArticles();
    setArticles(data);
    setLoading(false);
  };

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setViewMode('view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateNew = () => {
    setSelectedArticle({
      id: '',
      title: '',
      excerpt: '',
      cells: [
        { id: '1', type: 'markdown', content: '# New Article\n\nStart writing here...' }
      ],
      publishedAt: '',
      readTime: '5 min read',
      tags: []
    });
    setViewMode('edit');
  };

  const handleEdit = () => {
    setViewMode('edit');
  };

  const handleSave = async (article: Article) => {
    const savedArticle = await saveArticle(article);
    const data = await fetchArticles();
    setArticles(data);
    setSelectedArticle(savedArticle);
    setViewMode('view');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedArticle(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-emerald-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-sm font-mono">Loading content...</span>
      </div>
    );
  }

  if (viewMode === 'edit' && selectedArticle) {
    return (
      <NotebookEditor 
        initialArticle={selectedArticle} 
        onSave={handleSave} 
        onCancel={() => selectedArticle.id ? setViewMode('view') : handleBack()} 
      />
    );
  }

  if (viewMode === 'view' && selectedArticle) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-8">
            <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to articles
            </button>
            <button onClick={handleEdit} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-emerald-500/20">
                <Edit3 size={16} />
                Edit Notebook
            </button>
        </div>
        <ArticleViewer article={selectedArticle} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={handleCreateNew} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20">
            <Plus size={18} />
            New Notebook
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {articles.map((article) => (
            <div key={article.id} onClick={() => handleArticleClick(article)} className="group bg-gray-800 border border-gray-700 rounded-xl p-8 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold border bg-blue-900/30 text-blue-300 border-blue-700/50">
                            {article.cells.length} Cells
                        </span>
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                            <Calendar size={12} /> {article.publishedAt}
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                        {article.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed mb-6 max-w-2xl">
                        {article.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {article.tags.map(tag => (
                            <span key={tag} className="text-xs font-mono text-gray-500 bg-gray-900/50 px-2 py-1 rounded">#{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

// --- Editor Components ---

const NotebookEditor: React.FC<{
  initialArticle: Article;
  onSave: (a: Article) => Promise<void>;
  onCancel: () => void;
}> = ({ initialArticle, onSave, onCancel }) => {
  const [article, setArticle] = useState<Article>({ ...initialArticle });
  const [isSaving, setIsSaving] = useState(false);

  const updateCell = (id: string, content: string) => {
    setArticle(prev => ({
      ...prev,
      cells: prev.cells.map(c => c.id === id ? { ...c, content } : c)
    }));
  };

  const addCell = (index: number, type: ArticleCellType) => {
    const newCell: ArticleCell = {
      id: Date.now().toString() + Math.random().toString().slice(2),
      type,
      content: type === 'jsx' 
        ? "import React from 'react';\n\nconst Component = () => (\n  <div className='p-4 bg-slate-800 text-white rounded'>\n    Hello World\n  </div>\n);\n\nexport default Component;" 
        : type === 'html' ? '<div>New HTML Cell</div>' : ''
    };
    const newCells = [...article.cells];
    newCells.splice(index + 1, 0, newCell);
    setArticle({ ...article, cells: newCells });
  };

  const removeCell = (id: string) => {
    if (article.cells.length <= 1) return;
    setArticle(prev => ({ ...prev, cells: prev.cells.filter(c => c.id !== id) }));
  };

  const moveCell = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === article.cells.length - 1) return;
    const newCells = [...article.cells];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newCells[index], newCells[targetIndex]] = [newCells[targetIndex], newCells[index]];
    setArticle({ ...article, cells: newCells });
  };

  const handleSave = async () => {
    if (!article.title) return alert('Title is required');
    setIsSaving(true);
    await onSave(article);
    setIsSaving(false);
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 flex flex-col min-h-screen">
      {/* Meta Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6 sticky top-0 z-20 backdrop-blur-md bg-gray-800/95">
        <div className="flex justify-between items-start gap-6 max-w-5xl mx-auto w-full">
            <div className="flex-1 space-y-4">
                <input 
                    type="text" 
                    value={article.title}
                    onChange={e => setArticle({...article, title: e.target.value})}
                    className="w-full bg-transparent text-3xl font-bold text-white placeholder-gray-600 focus:outline-none"
                    placeholder="Notebook Title"
                />
                <input 
                    type="text" 
                    value={article.excerpt}
                    onChange={e => setArticle({...article, excerpt: e.target.value})}
                    className="w-full bg-transparent text-gray-400 placeholder-gray-600 focus:outline-none"
                    placeholder="Short description..."
                />
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onCancel} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save
                </button>
            </div>
        </div>
      </div>

      {/* Cells */}
      <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full space-y-2">
        {article.cells.map((cell, index) => (
          <React.Fragment key={cell.id}>
             <CellEditor 
                cell={cell} 
                onChange={(content) => updateCell(cell.id, content)}
                onDelete={() => removeCell(cell.id)}
                onMoveUp={() => moveCell(index, 'up')}
                onMoveDown={() => moveCell(index, 'down')}
                isFirst={index === 0}
                isLast={index === article.cells.length - 1}
             />
             <AddCellDivider onAdd={(type) => addCell(index, type)} />
          </React.Fragment>
        ))}
        {article.cells.length === 0 && (
            <AddCellDivider onAdd={(type) => addCell(-1, type)} alwaysVisible />
        )}
      </div>
    </div>
  );
};

const CellEditor: React.FC<{
  cell: ArticleCell;
  onChange: (content: string) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}> = ({ cell, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const [preview, setPreview] = useState(false);

  const handleImagePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
            e.preventDefault();
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                if (cell.type === 'markdown') {
                    // Insert markdown image syntax
                    const cursor = (e.target as HTMLTextAreaElement).selectionStart;
                    const text = cell.content;
                    const newText = text.slice(0, cursor) + `\n![Image](${base64})\n` + text.slice(cursor);
                    onChange(newText);
                } else if (cell.type === 'image') {
                    onChange(base64);
                }
            };
            if (blob) reader.readAsDataURL(blob);
        }
    }
  }, [cell.type, cell.content, onChange]);

  return (
    <div className="group bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-sm hover:border-gray-500 transition-colors">
       {/* Cell Toolbar */}
       <div className="bg-gray-850 border-b border-gray-700/50 p-2 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
             <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                 cell.type === 'jsx' ? 'bg-violet-900/50 text-violet-300' : 
                 cell.type === 'html' ? 'bg-orange-900/50 text-orange-300' :
                 cell.type === 'image' ? 'bg-pink-900/50 text-pink-300' :
                 'bg-blue-900/50 text-blue-300'
             }`}>
                {cell.type}
             </span>
             <button onClick={() => setPreview(!preview)} className={`p-1 rounded hover:bg-gray-700 ${preview ? 'text-emerald-400' : 'text-gray-400'}`} title="Toggle Preview">
                <Eye size={14} />
             </button>
          </div>
          <div className="flex items-center gap-1">
             <button onClick={onMoveUp} disabled={isFirst} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><MoveUp size={14} /></button>
             <button onClick={onMoveDown} disabled={isLast} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><MoveDown size={14} /></button>
             <button onClick={onDelete} className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded ml-2"><Trash2 size={14} /></button>
          </div>
       </div>

       {/* Content Area */}
       <div className="relative">
          {preview ? (
              <div className="p-4 bg-gray-900 min-h-[100px] border-l-4 border-emerald-500/50">
                  <CellRenderer cell={cell} />
              </div>
          ) : (
              cell.type === 'image' ? (
                  <div 
                    className="p-8 text-center border-2 border-dashed border-gray-700 m-4 rounded-lg cursor-pointer hover:bg-gray-700/50"
                    onPaste={handleImagePaste}
                  >
                      {cell.content ? (
                          <div className="relative group/img inline-block">
                              <img src={cell.content} alt="Cell" className="max-h-64 rounded-lg" />
                              <button onClick={() => onChange('')} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"><X size={12} /></button>
                          </div>
                      ) : (
                          <div className="text-gray-400">
                             <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                             <p className="text-sm">Paste an image here (Ctrl+V)</p>
                          </div>
                      )}
                      {/* Hidden input to catch focus for paste events if needed */}
                      <input className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" onPaste={handleImagePaste} />
                  </div>
              ) : (
                <textarea 
                    value={cell.content}
                    onChange={(e) => onChange(e.target.value)}
                    onPaste={handleImagePaste}
                    className={`w-full bg-gray-900 text-gray-300 p-4 font-mono text-sm focus:outline-none min-h-[150px] resize-y ${cell.type === 'markdown' ? 'font-sans' : 'font-mono'}`}
                    placeholder={`Enter ${cell.type} content...`}
                />
              )
          )}
       </div>
    </div>
  );
};

const AddCellDivider: React.FC<{ onAdd: (type: ArticleCellType) => void; alwaysVisible?: boolean }> = ({ onAdd, alwaysVisible }) => {
  return (
    <div className={`relative py-4 flex items-center justify-center group ${alwaysVisible ? 'opacity-100' : 'opacity-0 hover:opacity-100'} transition-opacity`}>
       <div className="absolute inset-x-0 h-px bg-emerald-500/30 group-hover:bg-emerald-500/50 transition-colors"></div>
       <div className="relative z-10 flex gap-2">
          <button onClick={() => onAdd('markdown')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-full text-xs font-medium text-gray-300 hover:text-white hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
             <Plus size={12} /> Text
          </button>
          <button onClick={() => onAdd('jsx')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-full text-xs font-medium text-gray-300 hover:text-white hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all">
             <Code size={12} /> React
          </button>
          <button onClick={() => onAdd('image')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-full text-xs font-medium text-gray-300 hover:text-white hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/20 transition-all">
             <ImageIcon size={12} /> Image
          </button>
          <button onClick={() => onAdd('html')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-full text-xs font-medium text-gray-300 hover:text-white hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 transition-all">
             <Box size={12} /> HTML
          </button>
       </div>
    </div>
  );
};

// --- Viewer Components ---

const ArticleViewer: React.FC<{ article: Article }> = ({ article }) => {
  return (
    <article className="max-w-5xl mx-auto space-y-8 pb-20">
        <header className="text-center mb-12 border-b border-gray-800 pb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">{article.title}</h1>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400 font-mono">
                <span className="flex items-center gap-2"><Calendar size={14}/> {article.publishedAt}</span>
                <span className="flex items-center gap-2"><Clock size={14}/> {article.readTime}</span>
                <div className="flex gap-2">
                    {article.tags.map(tag => (
                        <span key={tag} className="text-emerald-400">#{tag}</span>
                    ))}
                </div>
            </div>
        </header>

        {article.cells.map(cell => (
            <div key={cell.id} className="animate-fade-in">
                <CellRenderer cell={cell} />
            </div>
        ))}
    </article>
  );
};

const CellRenderer: React.FC<{ cell: ArticleCell }> = ({ cell }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // HTML Script Execution
  useEffect(() => {
    if (cell.type === 'html' && contentRef.current) {
      const scripts = contentRef.current.querySelectorAll('script');
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr: any) => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        if (oldScript.parentNode) {
          oldScript.parentNode.replaceChild(newScript, oldScript);
        }
      });
    }
  }, [cell.content, cell.type]);

  if (cell.type === 'jsx') {
      return <JSXRenderer code={cell.content} />;
  }

  if (cell.type === 'image') {
      return cell.content ? (
          <div className="flex justify-center my-6">
              <img src={cell.content} alt="User Content" className="rounded-xl shadow-lg max-h-[500px] border border-gray-700" />
          </div>
      ) : null;
  }

  if (cell.type === 'html') {
      return <div ref={contentRef} dangerouslySetInnerHTML={{ __html: cell.content }} />;
  }

  // Markdown
  return (
     <div className="prose prose-invert prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(cell.content) as string }} />
  );
};

const JSXRenderer: React.FC<{ code: string }> = ({ code }) => {
    const generateSrcDoc = (userCode: string) => {
        // Robust mounting logic
        const mountScript = `
          try {
             // 1. Create a synthetic module scope
             const module = { exports: {} };
             const exports = module.exports;
             
             // 2. Wrap user code to capture exports
             // We use a self-executing async function to allow top-level await if needed in modern environments,
             // but mainly to contain scope.
             // We inject 'React', 'useState', etc. into the scope.
             
             ${userCode}

             // 3. Find the Component
             let App = module.exports.default || module.exports;
             
             // If user used "export default App", babel transforms it to exports.default
             // If user just did "const App = ...", we can't easily catch it unless they export it.
             // Fallback: Check window for global "App" if they attached it, though modules are strict.
             
             // If the default export is not a function/component, check if there is a named export 'App'
             if (!App || (typeof App !== 'function' && typeof App !== 'object')) {
                 if (exports.App) App = exports.App;
             }

             const rootElement = document.getElementById('root');
             const root = ReactDOM.createRoot(rootElement);

             if (App) {
                root.render(React.createElement(App));
             } else {
                root.render(React.createElement('div', {style: {color: '#f87171', padding: 20}}, 
                  "Error: No component exported. Please ensure you add 'export default ComponentName;' at the end of your code."
                ));
             }
          } catch (err) {
             const rootElement = document.getElementById('root');
             if(rootElement) {
                rootElement.innerHTML = '<div style="color: #f87171; padding: 20px; font-family: monospace;">Runtime Error: ' + err.message + '</div>';
             }
             console.error(err);
          }
        `;

        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                theme: { extend: { colors: { slate: { 800: '#1e293b', 900: '#0f172a' } } } }
            }
        </script>
        <!-- Load dependencies as UMD globals for reliability in SrcDoc without importmaps issues -->
        <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script crossorigin src="https://unpkg.com/recharts@2.12.0/umd/Recharts.min.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>
          body { background-color: #0f172a; color: white; min-height: 100vh; margin: 0; padding: 0; overflow-x: hidden; }
          #root { width: 100%; min-height: 100vh; display: flex; flex-direction: column; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel" data-presets="react">
          // Expose Recharts globals so users can destructure them from 'recharts' or use window.Recharts
          const { 
            LineChart, Line, AreaChart, Area, BarChart, Bar, 
            XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
            ResponsiveContainer, Label 
          } = window.Recharts;
          
          // Shim 'import' for the user code. 
          // Since we are not using native modules (to access UMD globals easily), 
          // we mock the import statements if the user wrote them.
          // Note: Babel standalone strips imports in 'react' preset usually, but let's be safe.
          // Actually, we rely on the user writing standard ES6. Babel standalone handles the syntax.
          // The critical part is that "import React from 'react'" doesn't actually load anything in a script tag without type=module.
          // So we rely on the globals being present.
          
          // EXECUTION
          ${mountScript}
        </script>
      </body>
      </html>
        `;
    }

    return (
        <div className="w-full bg-gray-950 rounded-xl overflow-hidden border border-gray-800 shadow-2xl my-6">
             <iframe 
                srcDoc={generateSrcDoc(code)}
                className="w-full min-h-[500px] border-0 bg-transparent"
                sandbox="allow-scripts allow-same-origin allow-popups"
             />
        </div>
    );
};