import { useState, useEffect, useRef } from 'react';
import { IconSearch as Search, IconX as X } from '@tabler/icons-react';
import { supabase } from '../../lib/supabase';

interface Student {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
}

interface StudentSearchProps {
    onSelect: (student: Student) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
}

export default function StudentSearch({ onSelect, label = "Search Student", placeholder = "Type name...", required = false }: StudentSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const searchStudents = async () => {
            const trimmed = query.trim().toLowerCase();
            if (trimmed.length < 1) {
                setResults([]);
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, phone')
                .eq('role', 'student')
                .limit(50);

            if (!error && data) {
                const filtered = data.filter((student) => {
                    const name = (student.full_name || '').toLowerCase();
                    const email = (student.email || '').toLowerCase();
                    const phone = (student.phone || '');
                    const id = (student.id || '').toLowerCase();
                    const idLast3 = id.slice(-3);
                    const idLast4 = id.slice(-4);

                    return (
                        name.includes(trimmed) ||
                        email.includes(trimmed) ||
                        phone.includes(trimmed) ||
                        id.includes(trimmed) ||
                        idLast3.includes(trimmed) ||
                        idLast4.includes(trimmed)
                    );
                }).slice(0, 8);

                setResults(filtered);
                setIsOpen(true);
            }
        };

        const timeoutId = setTimeout(searchStudents, 200);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelect = (student: Student) => {
        setSelectedStudent(student);
        onSelect(student);
        setIsOpen(false);
        setQuery('');
    };

    const handleClear = () => {
        setSelectedStudent(null);
        setQuery('');
    };

    if (selectedStudent) {
        return (
            <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{label} {required && '*'}</label>
                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                            {selectedStudent.full_name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedStudent.full_name}</p>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300">
                                    ID: #{selectedStudent.id.slice(-4).toUpperCase()}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{selectedStudent.email}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg text-emerald-600 dark:text-emerald-400 transition-colors"
                        title="Remove linked student"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-1.5 relative" ref={wrapperRef}>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{label} {required && '*'}</label>
            <div className="relative">
                <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => query.length >= 1 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium rounded-xl focus:border-indigo-500 outline-none transition-all"
                />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-20 w-full mt-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    {results.map((student) => (
                        <button
                            type="button"
                            key={student.id}
                            onClick={() => handleSelect(student)}
                            className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/70 border-b border-slate-100 dark:border-slate-800/60 last:border-0 transition-colors flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                                    {student.full_name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{student.full_name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{student.email}</p>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                #{student.id.slice(-4).toUpperCase()}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
