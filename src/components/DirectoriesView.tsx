import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, ShieldCheck, HelpCircle, Star, Filter, 
  ExternalLink, BarChart3, Globe, Heart, CheckCircle2,
  UploadCloud, AlertCircle, FileSpreadsheet, Trash2, Check, ArrowRight
} from 'lucide-react';
import { Directory } from '../types';

interface DirectoriesViewProps {
  directories: Directory[];
  theme: 'dark' | 'light';
  onImportDirectories?: (newDirectories: Directory[]) => void;
}

export default function DirectoriesView({ directories, theme, onImportDirectories }: DirectoriesViewProps) {
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [feeFilter, setFeeFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [automationOnly, setAutomationOnly] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // CSV Importer States
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [validationLogs, setValidationLogs] = useState<{ type: 'success' | 'warning' | 'error'; message: string }[]>([]);
  const [parsedDirectories, setParsedDirectories] = useState<Directory[]>([]);
  const [importFeedback, setImportFeedback] = useState<{ success: boolean; msg: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Safe CSV Row line splitter that respects surrounding double-quotes
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const cleanCell = (cell: string): string => {
    let val = cell.trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1).trim();
    }
    return val;
  };

  const handleCSVData = (text: string) => {
    setValidationLogs([]);
    setParsedDirectories([]);
    setImportFeedback(null);

    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      setValidationLogs([{ type: 'error', message: 'CSV file is empty or missing content rows.' }]);
      return;
    }

    const headerLine = lines[0];
    const headerCells = parseCSVLine(headerLine).map(c => cleanCell(c).toLowerCase());
    
    // Map headers dynamically (case-insensitive & partial matching)
    const nameIdx = headerCells.findIndex(h => h.includes('name'));
    const domainIdx = headerCells.findIndex(h => h.includes('domain'));
    const countryIdx = headerCells.findIndex(h => h.includes('country') || h.includes('region'));
    const categoryIdx = headerCells.findIndex(h => h.includes('category'));
    const subTypeIdx = headerCells.findIndex(h => h.includes('submission type') || h.includes('submissiontype') || h.includes('type'));
    const diffIdx = headerCells.findIndex(h => h.includes('difficulty'));
    const authIdx = headerCells.findIndex(h => h.includes('authority') || h.includes('score') || h.includes('da'));
    const feeIdx = headerCells.findIndex(h => h.includes('fee') || h.includes('paid') || h.includes('cost') || h.includes('free'));
    const notesIdx = headerCells.findIndex(h => h.includes('notes') || h.includes('note') || h.includes('desc'));

    // Check critical headers
    const missingHeaders: string[] = [];
    if (nameIdx === -1) missingHeaders.push('Name');
    if (domainIdx === -1) missingHeaders.push('Domain');
    if (categoryIdx === -1) missingHeaders.push('Category');
    if (countryIdx === -1) missingHeaders.push('Country');

    if (missingHeaders.length > 0) {
      setValidationLogs([{
        type: 'error',
        message: `Missing required column headers: ${missingHeaders.join(', ')}. Please refer to the template below.`
      }]);
      return;
    }

    const tempParsed: Directory[] = [];
    const logs: { type: 'success' | 'warning' | 'error'; message: string }[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const rowNum = i + 1;
      const cells = parseCSVLine(lines[i]);
      if (cells.length === 1 && cells[0].trim() === '') continue; // Skip empty lines

      const rawName = nameIdx !== -1 ? cleanCell(cells[nameIdx] || '') : '';
      const rawDomain = domainIdx !== -1 ? cleanCell(cells[domainIdx] || '') : '';
      const rawCountry = countryIdx !== -1 ? cleanCell(cells[countryIdx] || '') : 'Global';
      const rawCategory = categoryIdx !== -1 ? cleanCell(cells[categoryIdx] || '') : 'General';
      const rawSubType = subTypeIdx !== -1 ? cleanCell(cells[subTypeIdx] || '') : 'Manual';
      const rawDiff = diffIdx !== -1 ? cleanCell(cells[diffIdx] || '') : 'Easy';
      const rawAuthStr = authIdx !== -1 ? cleanCell(cells[authIdx] || '') : '50';
      const rawFeeStr = feeIdx !== -1 ? cleanCell(cells[feeIdx] || '') : 'Free';
      const rawNotes = notesIdx !== -1 ? cleanCell(cells[notesIdx] || '') : 'Imported citation channel.';

      // Validation Rules
      if (!rawName || rawName.length < 2) {
        logs.push({ type: 'error', message: `Row ${rowNum}: Name is required and must be at least 2 characters. Skipped.` });
        continue;
      }

      if (!rawDomain || !rawDomain.includes('.')) {
        logs.push({ type: 'error', message: `Row ${rowNum} (${rawName}): Invalid web domain format "${rawDomain}". Skipped.` });
        continue;
      }

      // Submission Type correction
      let correctedType: Directory['submissionType'] = 'Manual';
      const lowType = rawSubType.toLowerCase();
      if (lowType.includes('high') || lowType.includes('priority')) {
        correctedType = 'High priority';
      } else if (lowType.includes('auto') || lowType.includes('machine')) {
        correctedType = 'Automated-ready';
      } else if (lowType.includes('email') || lowType.includes('verify')) {
        correctedType = 'Email verification needed';
      } else {
        correctedType = 'Manual';
        if (lowType !== 'manual' && lowType !== '') {
          logs.push({ type: 'warning', message: `Row ${rowNum} (${rawName}): Unknown submission type "${rawSubType}". Set to "Manual".` });
        }
      }

      // Difficulty mapping
      let correctedDiff: Directory['difficulty'] = 'Easy';
      const lowDiff = rawDiff.toLowerCase();
      if (lowDiff.includes('hard') || lowDiff.includes('difficult')) {
        correctedDiff = 'Hard';
      } else if (lowDiff.includes('med') || lowDiff.includes('average')) {
        correctedDiff = 'Medium';
      } else {
        correctedDiff = 'Easy';
        if (lowDiff !== 'easy' && lowDiff !== '') {
          logs.push({ type: 'warning', message: `Row ${rowNum} (${rawName}): Unknown difficulty "${rawDiff}". Set to "Easy".` });
        }
      }

      // Authority Score bounds check
      let score = parseInt(rawAuthStr, 10);
      if (isNaN(score) || score < 1 || score > 100) {
        score = 50;
        logs.push({ type: 'warning', message: `Row ${rowNum} (${rawName}): Authority Score "${rawAuthStr}" must be a number 1-100. Defaulted to 50.` });
      }

      // Free or Paid check
      let correctedFee: Directory['freeOrPaid'] = 'Free';
      if (rawFeeStr.toLowerCase().includes('paid') || rawFeeStr.toLowerCase().includes('premium') || rawFeeStr.toLowerCase().includes('cost')) {
        correctedFee = 'Paid';
      }

      const newDir: Directory = {
        id: 'dir_imp_' + Math.random().toString(36).substring(2, 9),
        name: rawName,
        domain: rawDomain,
        country: rawCountry,
        category: rawCategory,
        authorityScore: score,
        submissionType: correctedType,
        difficulty: correctedDiff,
        status: 'Active',
        automationReady: correctedType === 'Automated-ready',
        requiresEmailVerification: correctedType === 'Email verification needed' || correctedType === 'High priority',
        captchaLikely: correctedType === 'High priority' || correctedDiff === 'Hard',
        freeOrPaid: correctedFee,
        notes: rawNotes,
        lastChecked: new Date().toISOString().split('T')[0]
      };

      tempParsed.push(newDir);
    }

    if (tempParsed.length > 0) {
      logs.unshift({ type: 'success', message: `Successfully validated ${tempParsed.length} directories. Ready to import!` });
    } else {
      logs.push({ type: 'error', message: 'No valid records were extracted from the CSV file.' });
    }

    setValidationLogs(logs);
    setParsedDirectories(tempParsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleCSVData(text);
    };
    reader.onerror = () => {
      setValidationLogs([{ type: 'error', message: 'Failed to read file contents.' }]);
    };
    reader.readAsText(file);
  };

  // Drag and Drop Handling
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'text/csv' || file?.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        handleCSVData(text);
      };
      reader.readAsText(file);
    } else {
      setValidationLogs([{ type: 'error', message: 'Unsupported file type. Please upload a structured .CSV file.' }]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const commitImport = () => {
    if (parsedDirectories.length === 0) return;
    if (onImportDirectories) {
      onImportDirectories(parsedDirectories);
      setImportFeedback({
        success: true,
        msg: `Successfully imported ${parsedDirectories.length} custom directories into your local database!`
      });
      setParsedDirectories([]);
      setValidationLogs([]);
      setTimeout(() => {
        setIsImportOpen(false);
        setImportFeedback(null);
      }, 2500);
    }
  };

  // Filter computation memoized
  const filteredDirectories = useMemo(() => {
    return directories.filter(d => {
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || 
                          d.domain.toLowerCase().includes(search.toLowerCase()) ||
                          d.notes.toLowerCase().includes(search.toLowerCase());
      
      const matchCountry = countryFilter === 'All' || d.country.includes(countryFilter) || d.country === 'Global';
      const matchDifficulty = difficultyFilter === 'All' || d.difficulty === difficultyFilter;
      const matchFee = feeFilter === 'All' || d.freeOrPaid === feeFilter;
      const matchType = typeFilter === 'All' || d.submissionType === typeFilter;
      const matchAutomation = !automationOnly || d.automationReady;

      return matchSearch && matchCountry && matchDifficulty && matchFee && matchType && matchAutomation;
    });
  }, [directories, search, countryFilter, difficultyFilter, feeFilter, typeFilter, automationOnly]);


  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none">Global directory index</h1>
          <p className={`text-xs mt-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
            Explore 1,840+ target opportunities pre-configured with Domain Authority (DA) rankings and submission difficulty scores.
          </p>
        </div>

        {/* CSV Import Drawer Toggle Pin */}
        <button
          onClick={() => {
            setIsImportOpen(!isImportOpen);
            setParsedDirectories([]);
            setValidationLogs([]);
            setImportFeedback(null);
          }}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer border shadow-sm transition-all sm:shrink-0 ${
            isImportOpen 
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/25' 
              : theme === 'dark'
                ? 'bg-[#18181b] border-white/[0.08] text-white hover:bg-white/[0.04]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          {isImportOpen ? 'Close Importer' : 'Bulk Import CSV'}
        </button>
      </div>

      {/* CSV INTEGRATED WORKSPACE SANDBOX */}
      {isImportOpen && (
        <div className={`p-6 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#0f0f12] border-white/[0.06] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
        } transition-all space-y-5`}>
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
              <div>
                <h2 className="font-display font-black text-sm">Bulk Directory Importer (.CSV)</h2>
                <p className="text-[10px] text-gray-500 leading-none mt-0.5">Drag-and-drop or select any citation database spreadsheet</p>
              </div>
            </div>
            <button
              onClick={() => {
                setParsedDirectories([]);
                setValidationLogs([]);
                setImportFeedback(null);
              }}
              className="text-[10px] uppercase font-bold text-gray-500 hover:text-gray-300"
            >
              Clear Scratchpad
            </button>
          </div>

          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-colors ${
              dragActive 
                ? 'border-indigo-400 bg-indigo-500/5' 
                : theme === 'dark' 
                  ? 'border-white/10 hover:border-white/20 bg-white/[0.01]' 
                  : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
            onClick={triggerFileSelect}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <FileSpreadsheet className="w-10 h-10 text-emerald-400 mb-3 opacity-80" />
            <p className="text-xs font-bold leading-none">Drag and drop your directories .CSV here, or <span className="text-indigo-400 hover:underline">browse files</span></p>
            <p className="text-[10px] text-gray-500 mt-2 font-semibold">Columns to include: Name, Domain, Country, Category, Submission Type, Difficulty, Authority Score</p>
          </div>

          {/* Validation Logs Terminal */}
          {(validationLogs.length > 0 || importFeedback) && (
            <div className={`p-4 rounded-xl border ${
              theme === 'dark' ? 'bg-black/20 border-white/[0.04]' : 'bg-white border-slate-100'
            } text-xs space-y-2.5`}>
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-gray-500 flex items-center gap-1.5 leading-none">
                <AlertCircle className="w-3.5 h-3.5 text-indigo-400" /> Sandboxed Parse Validation Reports
              </h4>

              {importFeedback && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-2 font-semibold leading-relaxed">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{importFeedback.msg}</span>
                </div>
              )}

              {validationLogs.length > 0 && (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-2 font-mono text-[10px] divide-y divide-white/[0.02]">
                  {validationLogs.map((log, idx) => (
                    <div key={idx} className={`pt-1.5 first:pt-0 flex items-start gap-1.5 leading-relaxed ${
                      log.type === 'error' ? 'text-rose-400' :
                      log.type === 'warning' ? 'text-amber-400 font-medium' :
                      'text-emerald-400 font-bold'
                    }`}>
                      <span className="shrink-0">{log.type === 'error' ? '❌' : log.type === 'warning' ? '⚠' : '✓'}</span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Parsed Directory Grid List Preview */}
          {parsedDirectories.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <h3 className="text-xs font-bold text-gray-400">Total Valid Items Extracted: {parsedDirectories.length}</h3>
                <button
                  onClick={commitImport}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/10 cursor-pointer flex items-center gap-1.5 active:scale-95 transition-transform"
                >
                  Inject Verified Rows <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-44 overflow-y-auto pr-1">
                {parsedDirectories.map((dir, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    theme === 'dark' ? 'bg-[#18181b] border-white/[0.04]' : 'bg-white border-slate-200'
                  }`}>
                    <div className="min-w-0 flex-1 leading-normal">
                      <p className="font-bold text-xs truncate text-gray-200 dark:text-white">{dir.name}</p>
                      <p className="text-[10px] text-gray-500 truncate font-mono">{dir.domain}</p>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/15 text-indigo-400 font-black tracking-wider uppercase shrink-0 font-mono">
                      DA {dir.authorityScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guidelines Code sample template box */}
          <div className="pt-3 border-t border-white/[0.04]">
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest leading-none mb-2">CSV Structural Framework Alignment Template:</p>
            <pre className={`p-3 rounded-xl overflow-x-auto text-[10px] font-mono leading-relaxed ${
              theme === 'dark' ? 'bg-black/40 text-gray-500' : 'bg-slate-100 text-slate-600'
            }`}>
{`Name,Domain,Country,Category,Submission Type,Difficulty,Authority Score,Free Or Paid,Notes
"YellowPages Canada","yellowpages.ca","Canada","Local search","Manual","Medium",62,"Free","Strong geographic backlink weight"
"Scoot Directory","scoot.co.uk","UK","General","Automated-ready","Easy",74,"Free","Accepts automated payload submissions"`}
            </pre>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH PANEL BAR */}
      <div className={`p-4 rounded-2xl border space-y-4 ${
        theme === 'dark' ? 'bg-[#0f0f12] border-white/[0.06]' : 'bg-white border-slate-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Search bar */}
          <div className={`relative border rounded-xl overflow-hidden col-span-1 md:col-span-2 ${
            theme === 'dark' ? 'border-white/[0.06] bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
          }`}>
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Filter by name (Yelp, Bing, Google Business)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 text-xs w-full focus:outline-none bg-transparent font-medium text-gray-300 dark:text-white"
            />
          </div>

          {/* Location filter */}
          <div className="grid grid-cols-2 gap-2">
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className={`text-xs px-3 py-2.5 rounded-xl border focus:outline-none ${
                theme === 'dark' ? 'bg-[#18181b] border-white/[0.06] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="All">Target: All region</option>
              <option value="Global">Global</option>
              <option value="US">United States (US)</option>
              <option value="UK">United Kingdom (UK)</option>
              <option value="CA">Canada (CA)</option>
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className={`text-xs px-3 py-2.5 rounded-xl border focus:outline-none ${
                theme === 'dark' ? 'bg-[#18181b] border-white/[0.06] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="All">Difficulty: All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value)}
              className={`text-xs px-3 py-2.5 rounded-xl border focus:outline-none ${
                theme === 'dark' ? 'bg-[#18181b] border-white/[0.06] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="All">Fees: All</option>
              <option value="Free">Free Listing</option>
              <option value="Paid">Premium Paid</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`text-xs px-3 py-2.5 rounded-xl border focus:outline-none ${
                theme === 'dark' ? 'bg-[#18181b] border-white/[0.06] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="All">Type: All</option>
              <option value="High priority">High Priority</option>
              <option value="Automated-ready">Automated-ready</option>
              <option value="Manual">Manual Entry</option>
            </select>
          </div>
        </div>

        {/* Checkbox settings */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 font-semibold">
          <label className="flex items-center gap-2 text-gray-400 select-none cursor-pointer">
            <input 
              type="checkbox" 
              checked={automationOnly} 
              onChange={() => setAutomationOnly(!automationOnly)} 
              className="rounded border border-gray-400/20 text-sky-500 font-bold focus:ring-sky-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span>Show only automation-compatible channels (browser-ready)</span>
          </label>
          <span className="text-gray-500 font-normal">{filteredDirectories.length} opportunities found matching</span>
        </div>
      </div>

      {/* CORE TABLES OF LISTINGS */}
      <div className={`border rounded-2xl overflow-hidden ${
        theme === 'dark' ? 'bg-[#0f0f12] border-white/[0.06]' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[10px] uppercase font-bold tracking-wider text-gray-500 ${
                theme === 'dark' ? 'bg-white/[0.01] border-white/[0.06]' : 'bg-slate-50 border-slate-100'
              }`}>
                <th className="py-3.5 px-4 font-bold">Opportunity</th>
                <th className="py-3.5 px-4 font-bold">Country Target</th>
                <th className="py-3.5 px-4 font-bold">Core Category</th>
                <th className="py-3.5 px-4 font-bold">Authority (DA)</th>
                <th className="py-3.5 px-4 font-bold">Type Strategy</th>
                <th className="py-3.5 px-4 font-bold">Cost</th>
                <th className="py-3.5 px-4 font-bold">Difficulty</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-500/10">
              {filteredDirectories.map((dir) => (
                <tr key={dir.id} className="hover:bg-gray-500/5 transition-colors">
                  
                  {/* Name columns */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleFavorite(dir.id)}
                        className={`p-1 rounded cursor-pointer ${
                          favorites[dir.id] ? 'text-amber-500' : 'text-gray-500 hover:text-amber-500'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <div>
                        <div className="font-bold text-gray-100 dark:text-white flex items-center gap-1.5 leading-none">
                          <span className="text-gray-800 dark:text-white font-medium">{dir.name}</span>
                          {dir.automationReady && (
                            <span className="px-1.5 py-0.5 rounded-[4px] text-[8px] tracking-wide uppercase font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                              AUTO
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono flex items-center mt-0.5">
                          {dir.domain} <ExternalLink className="w-2.5 h-2.5 ml-0.5 text-gray-600" />
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Country */}
                  <td className="py-4 px-4 font-semibold text-gray-400">{dir.country}</td>

                  {/* Category */}
                  <td className="py-4 px-4 text-gray-400">{dir.category}</td>

                  {/* Authority Score progress line */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-black text-indigo-400">{dir.authorityScore}</span>
                      <div className="w-12 h-1 bg-gray-500/20 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${dir.authorityScore}%` }}></div>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono font-bold ${
                      dir.submissionType === 'High priority' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' :
                      dir.submissionType === 'Automated-ready' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25' :
                      'bg-sky-500/10 text-sky-400 border border-sky-500/25'
                    }`}>
                      {dir.submissionType}
                    </span>
                  </td>

                  {/* Fees */}
                  <td className="py-4 px-4">
                    <span className={`font-semibold font-mono text-[11px] ${dir.freeOrPaid === 'Paid' ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {dir.freeOrPaid}
                    </span>
                  </td>

                  {/* Difficulty */}
                  <td className="py-4 px-4">
                    <span className={`font-semibold font-mono text-[11px] ${
                      dir.difficulty === 'Hard' ? 'text-red-500' : dir.difficulty === 'Medium' ? 'text-amber-500' : 'text-green-500'
                    }`}>
                      {dir.difficulty}
                    </span>
                  </td>

                  {/* Info helper text */}
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => alert(`Directory guidelines logic:\n\n${dir.notes}\n\nLast Checked: ${dir.lastChecked}`)}
                      className={`text-[10px] font-semibold py-1.5 px-2.5 rounded-lg border cursor-pointer ${
                        theme === 'dark' ? 'border-white/[0.08] hover:bg-white/5 text-gray-400 hover:text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      View Notes
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDirectories.length === 0 && (
          <div className="p-8 text-center text-xs text-gray-500 italic">
            No directories match your selected filters. Reset parameters or search terms.
          </div>
        )}
      </div>

    </div>
  );
}
