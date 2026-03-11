import { useState, useEffect, useRef } from 'react';
import { Search, X, Check } from 'lucide-react';
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
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, phone')
                .eq('role', 'student') // Assuming only students pay fees
                .ilike('full_name', `%${query}%`)
                .limit(5);

            if (!error && data) {
                setResults(data);
                setIsOpen(true);
            }
        };

        const timeoutId = setTimeout(searchStudents, 300);
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
                <label className="text-sm font-medium text-slate-700">{label} {required && '*'}</label>
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                            {selectedStudent.full_name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800 text-sm">{selectedStudent.full_name}</p>
                            <p className="text-xs text-slate-500">{selectedStudent.email}</p>
                        </div>
                    </div>
                    <button onClick={handleClear} className="p-1 hover:bg-emerald-100 rounded text-emerald-600">
                        <X size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-1.5 relative" ref={wrapperRef}>
            <label className="text-sm font-medium text-slate-700">{label} {required && '*'}</label>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-slate-100 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    {results.map((student) => (
                        <button
                            key={student.id}
                            onClick={() => handleSelect(student)}
                            className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors flex items-center gap-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                {student.full_name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium text-slate-800 text-sm">{student.full_name}</p>
                                <div className="flex gap-2 text-xs text-slate-500">
                                    <span>{student.email}</span>
                                    {student.phone && <span>• {student.phone}</span>}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
