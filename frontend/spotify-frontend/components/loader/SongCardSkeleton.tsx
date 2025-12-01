"use client";

const SongCardSkeleton = () => {
  return (
    <div className="p-3 sm:p-4 bg-secondary rounded-lg animate-pulse">
      <div className="relative mb-3 sm:mb-4">
        {/* Cover Image Placeholder */}
        <div className="w-full aspect-square bg-[#2f2f2f] rounded-md shadow-custom-md" />

        {/* Play Button Placeholder */}
        <div className="
          absolute bottom-2 right-2 
          w-10 h-10 sm:w-12 sm:h-12 
          rounded-full bg-[#3a3a3a] 
          shadow-custom-lg
        " />
      </div>

      {/* Title Text */}
      <div className="h-4 bg-[#3a3a3a] rounded w-3/4 mb-2" />

      {/* Artist Text */}
      <div className="h-3 bg-[#3a3a3a] rounded w-1/2" />
    </div>
  );
};

export default SongCardSkeleton;
