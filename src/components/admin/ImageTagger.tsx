import { useState, useRef, useEffect } from 'react'
import { Plus, X, Tag } from 'lucide-react'

export interface ImageTag {
    id: string; // random local id
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    label: string;
    description: string;
}

interface ImageTaggerProps {
    imageUrl: string;
    initialTags?: ImageTag[];
    onChange: (tags: ImageTag[]) => void;
}

export default function ImageTagger({ imageUrl, initialTags = [], onChange }: ImageTaggerProps) {
    const [tags, setTags] = useState<ImageTag[]>(initialTags);
    const [isAdding, setIsAdding] = useState(false);
    const [newTagPos, setNewTagPos] = useState<{ x: number, y: number } | null>(null);
    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');
    
    const containerRef = useRef<HTMLDivElement>(null);

    // Update parent when tags change
    useEffect(() => {
        onChange(tags);
    }, [tags]);

    const handleImageClick = (e: React.MouseEvent) => {
        if (!isAdding || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        
        // Calculate percentages
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setNewTagPos({ x, y });
        setLabel('');
        setDescription('');
    };

    const handleSaveTag = () => {
        if (!newTagPos || !label.trim()) return;

        const newTag: ImageTag = {
            id: Math.random().toString(36).substring(7),
            x: newTagPos.x,
            y: newTagPos.y,
            label: label.trim(),
            description: description.trim()
        };

        setTags([...tags, newTag]);
        setNewTagPos(null);
        setIsAdding(false);
    };

    const handleRemoveTag = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTags(tags.filter(t => t.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-700">Visual Tags</h3>
                <button
                    type="button"
                    onClick={() => { setIsAdding(!isAdding); setNewTagPos(null); }}
                    className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                        isAdding 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                >
                    {isAdding ? <X size={14} /> : <Plus size={14} />}
                    {isAdding ? 'Cancel' : 'Add Tag Layer'}
                </button>
            </div>

            {isAdding && !newTagPos && (
                <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs p-3 rounded-lg flex items-center gap-2">
                    <Tag size={16} />
                    Click anywhere on the image below to place a tag.
                </div>
            )}

            {newTagPos && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 relative">
                    <button 
                        type="button" 
                        onClick={() => setNewTagPos(null)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                        <X size={16} />
                    </button>
                    <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">New Tag Details</h4>
                    <div>
                        <label className="text-xs text-slate-500 mb-1 block">Label (Short title)</label>
                        <input
                            autoFocus
                            type="text"
                            value={label}
                            onChange={e => setLabel(e.target.value)}
                            className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g. Science Lab"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 mb-1 block">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none h-20"
                            placeholder="Brief description of this area..."
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleSaveTag}
                        disabled={!label.trim()}
                        className="w-full bg-slate-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                        Save Tag Layer
                    </button>
                </div>
            )}

            <div 
                ref={containerRef}
                className={`relative w-full rounded-xl overflow-hidden border-2 ${isAdding ? 'border-indigo-400 cursor-crosshair' : 'border-slate-200'}`}
                onClick={handleImageClick}
                style={{ minHeight: '200px' }}
            >
                <img src={imageUrl} alt="Upload preview" className="w-full h-auto block select-none pointer-events-none" />
                
                {/* Render Tags */}
                {tags.map((tag) => (
                    <div 
                        key={tag.id}
                        className="absolute group flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
                    >
                        <div className="relative z-10 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full shadow-lg flex items-center justify-center">
                            <div className="absolute inset-0 bg-indigo-600 rounded-full animate-ping opacity-20"></div>
                        </div>
                        
                        {/* Hover Edit/Delete Panel */}
                        <div className="absolute top-full mt-2 w-max max-w-[200px] bg-slate-900 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto shadow-xl z-20">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <span className="text-xs font-bold">{tag.label}</span>
                                <button 
                                    onClick={(e) => handleRemoveTag(tag.id, e)}
                                    className="text-white/50 hover:text-red-400 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-300 leading-tight">{tag.description}</p>
                        </div>
                    </div>
                ))}

                {/* Render active new tag ghost */}
                {newTagPos && (
                    <div 
                        className="absolute w-4 h-4 bg-indigo-600 border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${newTagPos.x}%`, top: `${newTagPos.y}%` }}
                    />
                )}
            </div>
            
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {tags.map(tag => (
                        <div key={tag.id} className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                            <Tag size={10} className="text-indigo-400" />
                            {tag.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
