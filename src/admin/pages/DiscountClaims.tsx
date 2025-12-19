import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Search,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    Phone,
    Trash2,
    AlertTriangle,
    X
} from 'lucide-react';
import { format } from 'date-fns';

interface Inquiry {
    id: string;
    student_name: string;
    guardian_name: string;
    course: string;
    class: string;
    contact_number: string;
    discount_percentage: number;
    duration_months: number;
    status: 'pending' | 'contacted' | 'admitted' | 'rejected';
    created_at: string;
}

const DiscountClaims = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    // Custom Delete Confirmation State
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const { data, error } = await supabase
                .from('discount_inquiries')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setInquiries(data || []);
        } catch (error) {
            console.error('Error fetching inquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('discount_inquiries')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            setInquiries(inquiries.map(item =>
                item.id === id ? { ...item, status: newStatus as any } : item
            ));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const confirmDelete = (id: string) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            // We use .select() to ensure the row was actually deleted and returned.
            // If RLS blocks the delete, count will be 0 or data will be empty.
            const { data, error } = await supabase
                .from('discount_inquiries')
                .delete()
                .eq('id', deleteId)
                .select();

            if (error) throw error;

            // RLS Check: If no data returned, it means nothing was deleted (permission denied)
            if (!data || data.length === 0) {
                console.error('Delete operation failed: No records deleted. Check RLS policies.');
                alert('Permission Denied: Unable to delete record from database.');
                setShowDeleteModal(false);
                return;
            }

            // Update local state only if DB delete was successful
            setInquiries(inquiries.filter(item => item.id !== deleteId));
            setShowDeleteModal(false);
            setDeleteId(null);
        } catch (error) {
            console.error('Error deleting inquiry:', error);
            alert('Failed to delete record: ' + (error as any).message);
            setShowDeleteModal(false);
        }
    };

    const filteredInquiries = inquiries.filter(inquiry => {
        const matchesSearch =
            inquiry.student_name.toLowerCase().includes(search.toLowerCase()) ||
            inquiry.contact_number.includes(search);
        const matchesFilter = filter === 'all' || inquiry.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'contacted': return 'bg-blue-100 text-blue-800';
            case 'admitted': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Discount Claims</h1>
                    <p className="text-slate-500">Manage student discount inquiries</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search student name or phone..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflows-x-auto">
                    {['all', 'pending', 'contacted', 'admitted', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${filter === status
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Student Details</th>
                                <th className="px-6 py-4 font-semibold">Course Interest</th>
                                <th className="px-6 py-4 font-semibold">Discount</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Loading inquiries...
                                    </td>
                                </tr>
                            ) : filteredInquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No inquiries found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredInquiries.map((inquiry) => (
                                    <tr key={inquiry.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                                    {inquiry.student_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{inquiry.student_name}</div>
                                                    <div className="text-xs text-slate-500">G: {inquiry.guardian_name}</div>
                                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                                        <Phone size={12} />
                                                        <a href={`tel:${inquiry.contact_number}`} className="hover:text-indigo-600">
                                                            {inquiry.contact_number}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{inquiry.course}</div>
                                            <div className="text-xs text-slate-500">Class: {inquiry.class || 'N/A'}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <Clock size={12} />
                                                {inquiry.duration_months} Months
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                {inquiry.discount_percentage}% OFF
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar size={14} />
                                                {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                                            </div>
                                            <div className="text-xs text-slate-400 pl-6">
                                                {format(new Date(inquiry.created_at), 'h:mm a')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={inquiry.status}
                                                onChange={(e) => updateStatus(inquiry.id, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${getStatusColor(inquiry.status)}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="admitted">Admitted</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateStatus(inquiry.id, 'admitted')}
                                                    className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Mark Admitted"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(inquiry.id, 'rejected')}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Reject"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(inquiry.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowDeleteModal(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                                <AlertTriangle size={24} />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Inquiry?</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Are you sure you want to delete this record? This action cannot be undone.
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscountClaims;
