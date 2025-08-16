// src/components/DraftsOverview.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Edit3, Eye, ArrowRight, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useDraftStore } from "../stores/useDraftsStore";
import DraftPreview from "./DraftPreview"; // optional

const DRAFTS_PER_PAGE = 3;

export default function DraftsOverview() {
  const navigate = useNavigate();
  const { drafts, fetchDrafts } = useDraftStore();
  const [loading, setLoading] = useState(false);
  const [previewDraft, setPreviewDraft] = useState(null);
  const [page, setPage] = useState(0);

  const totalDrafts = useMemo(
    () => (drafts || []).filter(d => d.status === "draft" && !d.deletedAt).length,
    [drafts]
  );

  const cleanDrafts = useMemo(() => {
    return (drafts || [])
      .filter(d => d.status === "draft")
      .filter(d => !d.deletedAt)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }, [drafts]);

  const totalPages = Math.max(1, Math.ceil(cleanDrafts.length / DRAFTS_PER_PAGE));
  const pageStart = page * DRAFTS_PER_PAGE;
  const pageEnd = pageStart + DRAFTS_PER_PAGE;
  const pageItems = cleanDrafts.slice(pageStart, pageEnd);

  const goPrev = () => setPage(p => (p === 0 ? totalPages - 1 : p - 1));
  const goNext = () => setPage(p => (p === totalPages - 1 ? 0 : p + 1));

  const refresh = async () => {
    try {
      setLoading(true);
      await fetchDrafts();
      setPage(0); // reset to first page after refresh
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial fetch
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep page in range if list size changes
  useEffect(() => {
    if (page > totalPages - 1) setPage(0);
  }, [totalPages, page]);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <FileText className="h-5 w-5 text-indigo-600 mr-2" />
          Drafts at a Glance
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({totalDrafts} total)
          </span>
        </h2>

        <div className="flex items-center space-x-3">
          {/* Pagination controls */}
          {cleanDrafts.length > 0 && totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={goPrev}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <span className="text-sm text-gray-600 px-2">
                {page + 1} of {totalPages}
              </span>
              <button
                onClick={goNext}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          )}

          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/drafts"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center transition-colors duration-200"
          >
            Manage drafts
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : pageItems.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4">
            {pageItems.map((d) => (
              <li key={d._id} className="flex items-start justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {d.type || "draft"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(d.updatedAt || d.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="mt-1 font-semibold text-gray-900 truncate">
                    {d.title || "Untitled Draft"}
                  </h3>
                  {Array.isArray(d.content) && d.content.length > 0 && (
                    <p
                      className="mt-1 text-sm text-gray-600 overflow-hidden"
                      style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                    >
                      {d.content[0]}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewDraft(d)}
                    className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4 mr-1" /> Preview
                  </button>
                  <button
                    onClick={() => navigate(`/edit-draft/${d._id}`)}
                    className="px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center"
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4 mr-1" /> Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full inline-flex mb-3">
              <FileText className="h-6 w-6 text-gray-500" />
            </div>
            <p className="text-gray-700 font-medium">No drafts yet</p>
            <p className="text-gray-500 text-sm">Create or generate your first draft to get started.</p>
            <Link
              to="/upload-newsletter"
              className="inline-flex mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Create Draft
            </Link>
          </div>
        )}
      </div>

      {previewDraft && (
        <DraftPreview draft={previewDraft} onClose={() => setPreviewDraft(null)} />
      )}
    </div>
  );
}
