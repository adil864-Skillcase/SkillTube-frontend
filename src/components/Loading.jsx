export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#edb843] border-t-transparent rounded-full animate-spin" />
        <span className="text-[#002856] text-sm font-medium">Loading...</span>
      </div>
    </div>
  );
}
