import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fetchArticles, saveArticle } from '../services/articleService.js';
import { Article, ArticleCell, ArticleCellType } from '../types.js';
import { Loader2, Calendar, Clock, ArrowLeft, Tag, Plus, Edit3, Save, Eye, Code, X, MoveUp, MoveDown, Trash2, Image as ImageIcon, Box, AlertTriangle, RefreshCw, GripHorizontal } from 'lucide-react';
import { marked } from 'marked';

// --- Main Tab Component ---

export const WritingsTab: React.FC<{ isAdmin?: boolean }> = ({ isAdmin }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'view' | 'edit'>('list');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchArticles();
    setArticles(data);
    setLoading(false);
  };

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setViewMode('view');
    scrollToTop();
  };


  const handleCreateNew = () => {
    setSelectedArticle({
      id: '',
      title: '',
      excerpt: '',
      cells: [
        { id: '1', type: 'markdown', content: '# New Notebook\n\nStart writing here...' }
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
      <div ref={containerRef} className="animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to articles
          </button>
          {isAdmin && (
            <button onClick={handleEdit} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-emerald-500/20">
              <Edit3 size={16} />
              Edit Notebook
            </button>
          )}
        </div>
        <ArticleViewer article={selectedArticle} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {isAdmin && (
        <div className="flex justify-end">
          <button onClick={handleCreateNew} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20">
            <Plus size={18} />
            New Notebook
          </button>
        </div>
      )}

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

  // Update cell now accepts Partial<ArticleCell> to handle both content and height updates
  const updateCell = (id: string, updates: Partial<ArticleCell>) => {
    setArticle(prev => ({
      ...prev,
      cells: prev.cells.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const addCell = (index: number, type: ArticleCellType) => {
    const newCell: ArticleCell = {
      id: Date.now().toString() + Math.random().toString().slice(2),
      type,
      content: type === 'jsx'
        ? "import React from 'react';\n\nconst App = () => {\n  return (\n    <div className='p-6 bg-slate-800 text-white rounded-lg'>\n      <h2 className='text-xl font-bold mb-2'>Hello World</h2>\n      <p>Edit this code to see changes instantly!</p>\n    </div>\n  );\n};\n\nexport default App;"
        : type === 'html' ? '<div class="p-4 bg-slate-800 rounded text-white">\n  <h3>HTML Cell</h3>\n</div>' : ''
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
      <div className="bg-gray-800 border-b border-gray-700 p-6 sticky top-0 z-20 backdrop-blur-md bg-gray-800/95 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 max-w-5xl mx-auto w-full">
          <div className="flex-1 space-y-2 w-full">
            <input
              type="text"
              value={article.title}
              onChange={e => setArticle({ ...article, title: e.target.value })}
              className="w-full bg-transparent text-2xl md:text-3xl font-bold text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded px-2 -ml-2 transition-all"
              placeholder="Notebook Title"
            />
            <input
              type="text"
              value={article.excerpt}
              onChange={e => setArticle({ ...article, excerpt: e.target.value })}
              className="w-full bg-transparent text-gray-400 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded px-2 -ml-2 text-sm transition-all"
              placeholder="Short description..."
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={onCancel} className="flex-1 md:flex-none px-4 py-2 text-gray-400 hover:text-white transition-colors bg-gray-700/50 rounded-lg hover:bg-gray-700">Cancel</button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Cells */}
      <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-4">
        {article.cells.map((cell, index) => (
          <React.Fragment key={cell.id}>
            <CellEditor
              cell={cell}
              onChange={(updates) => updateCell(cell.id, updates)}
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
  onChange: (updates: Partial<ArticleCell>) => void;
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
            onChange({ content: newText });
          } else if (cell.type === 'image') {
            onChange({ content: base64 });
          }
        };
        if (blob) reader.readAsDataURL(blob);
      }
    }
  }, [cell.type, cell.content, onChange]);

  return (
    <div className="group bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-sm hover:border-gray-500 transition-all duration-200">
      {/* Cell Toolbar */}
      <div className="bg-gray-850 border-b border-gray-700/50 p-2 pl-4 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wider ${cell.type === 'jsx' ? 'bg-violet-900/50 text-violet-300' :
            cell.type === 'html' ? 'bg-orange-900/50 text-orange-300' :
              cell.type === 'image' ? 'bg-pink-900/50 text-pink-300' :
                'bg-blue-900/50 text-blue-300'
            }`}>
            {cell.type}
          </span>
          <button
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${preview ? 'bg-emerald-900/30 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            title={preview ? "Edit" : "Preview"}
          >
            {preview ? <Edit3 size={12} /> : <Eye size={12} />}
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={isFirst} className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 hover:bg-gray-700 rounded"><MoveUp size={14} /></button>
          <button onClick={onMoveDown} disabled={isLast} className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 hover:bg-gray-700 rounded"><MoveDown size={14} /></button>
          <div className="w-px h-4 bg-gray-700 mx-1"></div>
          <button onClick={onDelete} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"><Trash2 size={14} /></button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative">
        {preview ? (
          <div className="p-6 bg-gray-900 min-h-[100px] border-l-4 border-emerald-500/50 animate-fade-in">
            <CellRenderer
              cell={cell}
              onHeightChange={(h) => onChange({ height: h })}
            />
          </div>
        ) : (
          cell.type === 'image' ? (
            <div
              className="p-12 text-center border-2 border-dashed border-gray-700 m-4 rounded-lg cursor-pointer hover:bg-gray-700/30 hover:border-gray-500 transition-all"
              onPaste={handleImagePaste}
            >
              {cell.content ? (
                <div className="relative group/img inline-block">
                  <img src={cell.content} alt="Cell" className="max-h-96 rounded-lg shadow-2xl" />
                  <button onClick={() => onChange({ content: '' })} className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-500 text-white p-2 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity shadow-lg backdrop-blur-sm"><X size={16} /></button>
                </div>
              ) : (
                <div className="text-gray-400 flex flex-col items-center gap-3">
                  <div className="p-4 bg-gray-800 rounded-full">
                    <ImageIcon size={32} className="opacity-50" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-300">Paste an image here</p>
                    <p className="text-xs text-gray-500 mt-1">Ctrl+V / Cmd+V to insert from clipboard</p>
                  </div>
                </div>
              )}
              {/* Hidden input to catch focus for paste events */}
              <input className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" onPaste={handleImagePaste} />
            </div>
          ) : (
            <textarea
              value={cell.content}
              onChange={(e) => onChange({ content: e.target.value })}
              onPaste={handleImagePaste}
              className={`w-full bg-gray-900 text-gray-300 p-4 font-mono text-sm focus:outline-none min-h-[200px] resize-y ${cell.type === 'markdown' ? 'font-sans' : 'font-mono'}`}
              spellCheck={false}
              placeholder={
                cell.type === 'jsx' ? "// Write React code here. Must export default a component." :
                  cell.type === 'html' ? "<!-- HTML Content -->" :
                    "Markdown text..."
              }
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
      <div className="absolute inset-x-0 h-px bg-emerald-500/20 group-hover:bg-emerald-500/40 transition-colors"></div>
      <div className="relative z-10 flex gap-3">
        <button onClick={() => onAdd('markdown')} className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 border border-gray-700 rounded-full text-xs font-bold text-gray-400 hover:text-white hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
          <Plus size={14} className="text-emerald-500" /> Text
        </button>
        <button onClick={() => onAdd('jsx')} className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 border border-gray-700 rounded-full text-xs font-bold text-gray-400 hover:text-white hover:border-violet-500 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
          <Code size={14} className="text-violet-500" /> React
        </button>
        <button onClick={() => onAdd('image')} className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 border border-gray-700 rounded-full text-xs font-bold text-gray-400 hover:text-white hover:border-pink-500 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all">
          <ImageIcon size={14} className="text-pink-500" /> Image
        </button>
        <button onClick={() => onAdd('html')} className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 border border-gray-700 rounded-full text-xs font-bold text-gray-400 hover:text-white hover:border-orange-500 hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all">
          <Box size={14} className="text-orange-500" /> HTML
        </button>
      </div>
    </div>
  );
};

// --- Viewer Components ---

const ArticleViewer: React.FC<{ article: Article }> = ({ article }) => {
  return (
    <article className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="text-center mb-12 border-b border-gray-800 pb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight leading-tight">{article.title}</h1>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400 font-mono">
          <span className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full"><Calendar size={14} className="text-emerald-400" /> {article.publishedAt}</span>
          <span className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full"><Clock size={14} className="text-emerald-400" /> {article.readTime}</span>
        </div>
        {article.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {article.tags.map(tag => (
              <span key={tag} className="text-xs font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 px-3 py-1 rounded-full uppercase tracking-wider">#{tag}</span>
            ))}
          </div>
        )}
      </header>

      {article.cells.map(cell => (
        <div key={cell.id} className="animate-fade-in">
          <CellRenderer cell={cell} />
        </div>
      ))}
    </article>
  );
};

const CellRenderer: React.FC<{ cell: ArticleCell; onHeightChange?: (h: number) => void }> = ({ cell, onHeightChange }) => {
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
    return (
      <JSXRenderer
        code={cell.content}
        height={cell.height}
        onHeightChange={onHeightChange}
      />
    );
  }

  if (cell.type === 'image') {
    return cell.content ? (
      <div className="flex justify-center my-8">
        <img src={cell.content} alt="Content" className="rounded-xl shadow-2xl max-h-[600px] border border-gray-800" />
      </div>
    ) : null;
  }

  if (cell.type === 'html') {
    return <div ref={contentRef} className="w-full overflow-hidden" dangerouslySetInnerHTML={{ __html: cell.content }} />;
  }

  // Markdown
  return (
    <div className="prose prose-invert prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(cell.content) as string }} />
  );
};

const JSXRenderer: React.FC<{ code: string; height?: number; onHeightChange?: (h: number) => void }> = ({ code, height, onHeightChange }) => {
  const [key, setKey] = useState(0);

  // Default to 500 if not set. Use controlled height if provided, otherwise internal default.
  const currentHeight = height || 500;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = currentHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newHeight = Math.max(200, startHeight + (moveEvent.clientY - startY));
      if (onHeightChange) {
        onHeightChange(newHeight);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Clean code to remove imports/exports which break the browser script environment
  const cleanUserCode = (rawCode: string) => {
    let clean = rawCode
      .replace(/^import\s+.*?from\s+['"].*?['"];?/gm, '')
      .replace(/^export\s+default\s+/gm, '');
    return clean;
  };

  const generateSrcDoc = (rawCode: string) => {
    const cleanedCode = cleanUserCode(rawCode);
    const safeCode = cleanedCode.replace(/<\/script>/gi, '<\\/script>');

    const preamble = `
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
  <script crossorigin src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js"></script>
  <script crossorigin src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
  <script crossorigin src="https://cdn.jsdelivr.net/npm/prop-types@15.8.1/prop-types.min.js"></script>
  <script crossorigin src="https://cdn.jsdelivr.net/npm/recharts@2.12.0/umd/Recharts.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { background-color: #0f172a; color: white; margin: 0; padding: 0; overflow-x: hidden; }
    #root { width: 100%; min-height: 100%; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useMemo, useRef, useCallback } = React;
    
    // Expose ALL Recharts components to global scope to handle any import
    Object.keys(Recharts).forEach(key => {
        window[key] = Recharts[key];
    });

`;

    const postamble = `
    
    const rootElement = document.getElementById('root');
    const root = ReactDOM.createRoot(rootElement);

    // Heuristic to find the component
    let ComponentToRender = null;
    if (typeof App !== 'undefined') ComponentToRender = App;
    else if (typeof Chart !== 'undefined') ComponentToRender = Chart;
    else if (typeof Component !== 'undefined') ComponentToRender = Component;

    if (ComponentToRender) {
      root.render(<ComponentToRender />);
    } else {
      root.render(
        <div className="flex h-screen items-center justify-center text-red-400 bg-slate-900 p-4 text-center">
          Component not found. Please define 'App' or 'Chart'.
        </div>
      );
    }
  </script>
</body>
</html>
`;

    return preamble + safeCode + postamble;
  }

  return (
    <div className="w-full bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-700 shadow-xl my-6 flex flex-col relative transition-all duration-300 group/frame" style={{ height: currentHeight }}>
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => setKey(k => k + 1)}
          className="p-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white rounded-md transition-colors backdrop-blur-sm"
          title="Reload"
        >
          <RefreshCw size={14} />
        </button>
      </div>
      <iframe
        key={key}
        srcDoc={generateSrcDoc(code)}
        className="w-full h-full border-0 bg-transparent"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        title="React Sandbox"
      />

      {/* Resize Handle (Only visible if onHeightChange is provided) */}
      {onHeightChange && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute bottom-0 left-0 right-0 h-4 bg-gray-800/80 hover:bg-emerald-500/80 cursor-ns-resize flex items-center justify-center transition-all opacity-0 group-hover/frame:opacity-100 z-20 backdrop-blur-sm"
          title="Drag to resize"
        >
          <GripHorizontal size={16} className="text-white/50" />
        </div>
      )}
    </div>
  );
};
