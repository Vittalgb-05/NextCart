import React from 'react'

const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg ${className}`}></div>
  )
}

export const ProductSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 w-full max-w-[200px]">
      <Skeleton className="w-full h-48" />
      <Skeleton className="w-3/4 h-4 mt-2" />
      <Skeleton className="w-1/2 h-3" />
      <div className="flex gap-1 mt-1">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-3 h-3 rounded-full" />)}
      </div>
      <Skeleton className="w-1/3 h-5 mt-2" />
    </div>
  )
}

export default Skeleton