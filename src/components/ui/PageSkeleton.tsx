import Skeleton from './Skeleton'

const PageSkeleton = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container mx-auto px-4">
                {/* Header Skeleton */}
                <div className="text-center mb-12">
                    <Skeleton className="h-10 w-64 mx-auto mb-4" />
                    <Skeleton className="h-6 w-96 mx-auto" />
                </div>

                {/* Content Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-80 flex flex-col">
                            <Skeleton className="w-14 h-14 rounded-xl mb-6" />
                            <Skeleton className="h-6 w-3/4 mb-4" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-5/6 mb-6" />
                            <div className="mt-auto">
                                <Skeleton className="h-10 w-full rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PageSkeleton
