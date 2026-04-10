import { useState, useEffect, useRef, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadToCloudinary, getOptimizedImageUrl } from '../../lib/cloudinary'
import { Plus, Image as ImageIcon, Trash2, FolderPlus, Tag, CheckCircle2, Edit2, X, Save } from 'lucide-react'
import ImageTagger, { type ImageTag } from '../../components/admin/ImageTagger'

interface Category {
    id: string;
    name: string;
    layout_style: string;
}

interface GalleryImage {
    id: string;
    cloudinary_url: string;
    title: string | null;
    description: string | null;
    event_name: string | null;
    event_date: string | null;
    group_cover: boolean;
    categories: string[];
    tags: ImageTag[];
}

export default function AdminGallery() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);

    // New Category Form
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatStyle, setNewCatStyle] = useState('collage');

    // Upload Form State
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    // Shared Form Fields (used for Upload & Edit)
    const [uploadCategories, setUploadCategories] = useState<string[]>([]);
    const [eventName, setEventName] = useState('');
    const [isNewEvent, setIsNewEvent] = useState(false);
    const [eventDate, setEventDate] = useState('');
    const [isGroupCover, setIsGroupCover] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageTags, setImageTags] = useState<ImageTag[]>([]);
    
    // Edit Modal State
    const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Unique Event Names from uploaded images
    const existingEvents = useMemo(() => {
        const events = new Set(images.map(img => img.event_name).filter(Boolean));
        return Array.from(events) as string[];
    }, [images]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [catRes, imgRes] = await Promise.all([
                supabase.from('gallery_categories').select('*').order('name'),
                supabase.from('gallery_images').select('*').order('created_at', { ascending: false })
            ]);

            if (catRes.error) throw catRes.error;
            if (imgRes.error) throw imgRes.error;

            setCategories(catRes.data || []);
            setImages(imgRes.data || []);
        } catch (error: any) {
            console.error('Error fetching gallery data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from('gallery_categories')
                .insert([{ name: newCatName, layout_style: newCatStyle }])
                .select()
                .single();

            if (error) throw error;
            setCategories([...categories, data].sort((a, b) => a.name.localeCompare(b.name)));
            setIsCreatingCategory(false);
            setNewCatName('');
        } catch (error: any) {
            alert('Failed to create category: ' + error.message);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        // Reset fields for new upload
        resetFormFields();
    };

    const resetFormFields = () => {
        setUploadCategories([]);
        setEventName('');
        setIsNewEvent(false);
        setEventDate('');
        setIsGroupCover(false);
        setTitle('');
        setDescription('');
        setImageTags([]);
    };

    const toggleUploadCategory = (catId: string) => {
        setUploadCategories(prev => 
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        try {
            setIsUploading(true);

            // 1. Upload to Cloudinary
            const cloudRes = await uploadToCloudinary(selectedFile);

            // 2. Save metadata to Supabase
            const { data, error } = await supabase.from('gallery_images').insert({
                cloudinary_url: cloudRes.url,
                cloudinary_public_id: cloudRes.public_id,
                categories: uploadCategories,
                event_name: eventName || null,
                event_date: eventDate || null,
                group_cover: isGroupCover,
                title: title || null,
                description: description || null,
                tags: imageTags
            }).select('*').single();

            if (error) throw error;

            // Update UI
            setImages([data, ...images]);
            setPreviewUrl(null);
            setSelectedFile(null);
            resetFormFields();
            if (fileInputRef.current) fileInputRef.current.value = '';

        } catch (error: any) {
            alert('Upload failed: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this image?')) return;
        try {
            const { error } = await supabase.from('gallery_images').delete().eq('id', id);
            if (error) throw error;
            setImages(images.filter(img => img.id !== id));
        } catch (error: any) {
            alert('Failed to delete: ' + error.message);
        }
    };

    const openEditModal = (img: GalleryImage) => {
        setEditingImage(img);
        setUploadCategories(img.categories || []);
        setEventName(img.event_name || '');
        setIsNewEvent(img.event_name && !existingEvents.includes(img.event_name) ? true : false);
        setEventDate(img.event_date || '');
        setIsGroupCover(img.group_cover);
        setTitle(img.title || '');
        setDescription(img.description || '');
        setImageTags(img.tags || []);
    };

    const handleSaveEdit = async () => {
        if (!editingImage) return;
        try {
            setIsSavingEdit(true);
            const { data, error } = await supabase.from('gallery_images').update({
                categories: uploadCategories,
                event_name: eventName || null,
                event_date: eventDate || null,
                group_cover: isGroupCover,
                title: title || null,
                description: description || null,
                tags: imageTags
            }).eq('id', editingImage.id).select('*').single();

            if (error) throw error;

            // Update images list
            setImages(images.map(img => img.id === data.id ? data : img));
            setEditingImage(null);
            resetFormFields();
        } catch (error: any) {
            alert('Save failed: ' + error.message);
        } finally {
            setIsSavingEdit(false);
        }
    };

    const renderFormFields = () => (
        <div className="space-y-4">
            {/* Categories */}
            <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Sections / Categories (Required)</label>
                <div className="flex flex-wrap gap-2">
                    {categories.map(c => (
                        <button
                            key={c.id} type="button"
                            onClick={() => toggleUploadCategory(c.id)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${uploadCategories.includes(c.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            {uploadCategories.includes(c.id) && <CheckCircle2 size={12} />}
                            {c.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Title (Optional)</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full text-sm rounded-lg border-slate-200" placeholder="Image Title" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Image Date (Optional)</label>
                        <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full text-sm rounded-lg border-slate-200" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Description (Optional)</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full text-sm rounded-lg border-slate-200 h-16 resize-none" placeholder="Brief description..." />
                </div>
            </div>

            {/* Event Grouping Toggle */}
            <div className="flex items-center gap-2 pt-2">
                <input 
                    type="checkbox" 
                    id="isEventToggle"
                    checked={!!eventName || isNewEvent} 
                    onChange={e => {
                        if (e.target.checked) {
                            if (existingEvents.length > 0) {
                                setIsNewEvent(false);
                                setEventName(existingEvents[0]);
                            } else {
                                setIsNewEvent(true);
                            }
                        } else {
                            setIsNewEvent(false);
                            setEventName('');
                            setIsGroupCover(false);
                        }
                    }}
                    className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4" 
                />
                <label htmlFor="isEventToggle" className="text-sm font-semibold text-slate-700 cursor-pointer">
                    Link image to an Event
                </label>
            </div>

            {/* Event Grouping */}
            {(!!eventName || isNewEvent) && (
                <div className="p-4 bg-pink-50 border border-pink-200 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold text-pink-800 uppercase tracking-wider">Event Grouping</h4>
                            <button type="button" onClick={() => setIsNewEvent(!isNewEvent)} className="text-[10px] bg-pink-100 text-pink-700 px-2 py-1 rounded hover:bg-pink-200 transition-colors shadow-sm">
                                {isNewEvent ? 'Select Existing Event' : '+ Create New Event'}
                            </button>
                        </div>
                        <p className="text-[10px] text-pink-600/80 leading-tight">If part of an event, images sharing the same Event Name will be grouped together.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <label className="block text-xs text-pink-700 font-medium mb-1">Event Name (Required)</label>
                            {isNewEvent || existingEvents.length === 0 ? (
                                <input type="text" value={eventName} onChange={e => setEventName(e.target.value)} className="w-full text-sm rounded-md border-pink-200 focus:ring-pink-500 focus:border-pink-500 bg-white" placeholder="e.g. Annual Fest" />
                            ) : (
                                <select value={eventName} onChange={e => setEventName(e.target.value)} className="w-full text-sm rounded-md border-pink-200 focus:ring-pink-500 focus:border-pink-500 bg-white shadow-sm">
                                    <option value="">-- Select Event --</option>
                                    {existingEvents.map(evt => (
                                        <option key={evt} value={evt}>{evt}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer group w-max">
                        <input type="checkbox" checked={isGroupCover} onChange={e => setIsGroupCover(e.target.checked)} className="rounded text-pink-600 border-pink-300 focus:ring-pink-500" />
                        <span className="text-xs text-pink-800 font-medium group-hover:text-pink-900 transition-colors">Set as Event Cover</span>
                    </label>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Gallery Management</h2>
                    <p className="text-slate-500 text-sm">Upload images, manage categories, and edit gallery contents.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Left Column: Forms */}
                <div className="space-y-6">
                    
                    {/* Categories Manager */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <FolderPlus size={18} className="text-indigo-600" />
                                Categories & Styles
                            </h3>
                            <button 
                                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                                className="text-xs text-indigo-600 font-medium hover:underline"
                            >
                                {isCreatingCategory ? 'Cancel' : '+ New Category'}
                            </button>
                        </div>

                        {isCreatingCategory && (
                            <form onSubmit={handleCreateCategory} className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm space-y-3">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Category Name</label>
                                    <input 
                                        type="text" required value={newCatName} onChange={e => setNewCatName(e.target.value)}
                                        className="w-full rounded-lg border-slate-200" placeholder="e.g. Graduation 2026"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Creative Layout Rule</label>
                                    <select 
                                        value={newCatStyle} onChange={e => setNewCatStyle(e.target.value)}
                                        className="w-full rounded-lg border-slate-200"
                                    >
                                        <option value="collage">Masonry Collage (Dynamic Grid)</option>
                                        <option value="curve_road">Curve Road (Timeline)</option>
                                        <option value="scatter_3d">Scatter 3D (Floating Interactive)</option>
                                        <option value="bento_flow">Bento Flow (Asymmetrical Box Mix)</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-indigo-600 text-white rounded-lg py-2 text-xs font-semibold hover:bg-indigo-700">Save Category</button>
                            </form>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {categories.map(c => (
                                <div key={c.id} className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-md shadow-sm text-slate-600 flex flex-col">
                                    <span className="font-semibold">{c.name}</span>
                                    <span className="text-[10px] text-slate-400 capitalize">{c.layout_style.replace('_', ' ')}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image Upload Form */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                            <ImageIcon size={18} className="text-pink-600" />
                            Upload New Image
                        </h3>

                        <form onSubmit={handleUpload} className="space-y-4">
                            
                            {/* File Selection */}
                            {!previewUrl ? (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                                >
                                    <Plus className="mx-auto text-slate-400 mb-2" size={24} />
                                    <p className="text-sm font-medium text-slate-600">Click to select image</p>
                                    <p className="text-xs text-slate-400 mt-1">High-res supported (Cloudinary optimized)</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-500">Image Selected</span>
                                        <button type="button" onClick={() => { setPreviewUrl(null); resetFormFields(); }} className="text-xs text-red-500 hover:underline">Remove</button>
                                    </div>
                                    <ImageTagger 
                                        imageUrl={previewUrl}
                                        initialTags={imageTags}
                                        onChange={setImageTags}
                                    />
                                </div>
                            )}

                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

                            {previewUrl && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    {renderFormFields()}

                                    <button 
                                        type="submit" 
                                        disabled={isUploading || uploadCategories.length === 0}
                                        className="w-full bg-slate-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-lg shadow-slate-900/20"
                                    >
                                        {isUploading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Uploading to Cloud...
                                            </>
                                        ) : 'Upload & Publish Image'}
                                    </button>
                                    {uploadCategories.length === 0 && <p className="text-center text-red-500 text-[10px]">Please select at least one category.</p>}
                                </div>
                            )}

                        </form>
                    </div>

                </div>

                {/* Right Column: Image Grid */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 h-[calc(100vh-140px)] overflow-y-auto w-full">
                        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10 pb-2">
                            <h3 className="font-semibold text-slate-800">Uploaded Images</h3>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{images.length} Total</span>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-square bg-slate-100 animate-pulse rounded-xl"></div>)}
                            </div>
                        ) : images.length === 0 ? (
                            <div className="text-center py-20 text-slate-400 flex flex-col items-center">
                                <ImageIcon size={48} className="opacity-20 mb-3" />
                                <p>No images uploaded yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {images.map(img => (
                                    <div 
                                        key={img.id} 
                                        className="group relative rounded-xl overflow-hidden aspect-square border border-slate-200 shadow-sm bg-slate-50 cursor-pointer"
                                        onClick={() => openEditModal(img)}
                                    >
                                        <img 
                                            src={getOptimizedImageUrl(img.cloudinary_url, 400)} 
                                            alt={img.title || 'Gallery image'}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                                            {img.event_name && (
                                                <div className="absolute top-2 left-2 right-2 flex justify-between">
                                                    <span className="text-[9px] bg-pink-500/90 text-white px-1.5 py-0.5 rounded shadow shadow-pink-500/20 truncate max-w-[70%]">
                                                        Event: {img.event_name}
                                                    </span>
                                                    {img.group_cover && <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded shadow">Cover</span>}
                                                </div>
                                            )}
                                            
                                            {/* Hover Actions */}
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={(e) => handleDelete(img.id, e)}
                                                    className="w-8 h-8 bg-red-500/90 hover:bg-red-600 rounded flex items-center justify-center text-white backdrop-blur-md"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            <h4 className="text-white text-sm font-semibold truncate mb-1">{img.title || 'Untitled'}</h4>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {/* Represent attached categories */}
                                                {img.categories.map(catId => {
                                                    const catName = categories.find(c => c.id === catId)?.name || 'Unknown';
                                                    return (
                                                        <span key={catId} className="text-[9px] bg-indigo-500/80 border border-indigo-400 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">
                                                            {catName}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Edit Image Modal */}
            {editingImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingImage(null)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-20">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Edit2 size={18} className="text-indigo-600" />
                                Edit Image Details
                            </h3>
                            <button onClick={() => setEditingImage(null)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left: Tagger / Preview */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Image Content & Tags</h4>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-2">
                                    <ImageTagger 
                                        imageUrl={getOptimizedImageUrl(editingImage.cloudinary_url, 800)}
                                        initialTags={imageTags}
                                        onChange={setImageTags}
                                    />
                                </div>
                            </div>

                            {/* Right: Metadata Form */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Metadata</h4>
                                {renderFormFields()}
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0 z-20">
                            <button 
                                onClick={() => setEditingImage(null)}
                                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveEdit}
                                disabled={isSavingEdit || uploadCategories.length === 0}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                            >
                                {isSavingEdit ? 'Saving...' : (
                                    <>
                                        <Save size={16} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
