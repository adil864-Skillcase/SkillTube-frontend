import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function SearchBar({ placeholder = "Search videos..." }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/search")}
      className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl text-gray-500"
    >
      <Search className="w-5 h-5" />
      <span>{placeholder}</span>
    </button>
  );
}
