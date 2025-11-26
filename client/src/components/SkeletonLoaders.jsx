
export const FeedbackSkeleton = () => (
  <div className="border-2 border-black bg-white p-3 sm:p-4 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="h-6 w-20 bg-gray-200 rounded"></div>
      <div className="h-4 w-32 bg-gray-200 rounded"></div>
    </div>
    <div className="bg-gray-100 px-3 py-2 sm:px-4 sm:py-3 rounded">
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  </div>
);

export const FeedbackListSkeleton = () => (
  <div className="space-y-4">
    <FeedbackSkeleton />
    <FeedbackSkeleton />
    <FeedbackSkeleton />
  </div>
);


export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="p-3 border-2 border-black bg-gray-100">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-8"></div>
        </div>
      </div>
    ))}
  </div>
);