import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailSkeleton() {
  return (
    <div
      className="px-4 pt-[80px] pb-[130px] lg:px-[100px]"
      aria-busy="true"
      aria-label="Loading product"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="flex w-full shrink-0 gap-4 lg:w-1/2">
          <div className="hidden w-20 flex-col gap-3 lg:flex">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="aspect-square w-full rounded-lg" />
          </div>
          <Skeleton className="aspect-square w-full rounded-xl" />
        </div>
        <div className="flex w-full flex-col justify-center gap-3 lg:w-1/2">
          <Skeleton className="h-9 w-full max-w-lg lg:h-10" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-1 h-8 w-28" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5 max-w-xl" />
          <div className="mt-4 flex gap-2 border-t border-transparent pt-4">
            <Skeleton className="h-10 w-12 rounded-full" />
            <Skeleton className="h-10 w-12 rounded-full" />
            <Skeleton className="h-10 w-12 rounded-full" />
            <Skeleton className="h-10 w-12 rounded-full" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-transparent pt-4">
            <Skeleton className="h-12 rounded-full lg:h-14" />
            <Skeleton className="h-12 rounded-full lg:h-14" />
          </div>
        </div>
      </div>
      <div className="mt-10 space-y-4">
        <div className="flex flex-wrap gap-4 py-5">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-40 w-full max-w-3xl rounded-lg" />
      </div>
    </div>
  );
}
