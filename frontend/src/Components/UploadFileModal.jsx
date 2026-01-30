import { useState } from "react";

const FileUploadModal = ({ onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError("");
    
    if (file) {
      // Validate file size (5MB max as per backend config)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    try {
      setUploading(true);
      setError("");
      await onUpload(selectedFile);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b bg-slate-50">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Upload File
          </h2>
          <p className="text-slate-500 mt-1">
            Select a file to upload (Max 5MB)
          </p>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">
              {error}
            </div>
          )}

          {/* File Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Choose File
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf,.json,.csv"
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className={`flex items-center justify-center w-full px-6 py-4 border-2 border-dashed rounded-xl cursor-pointer transition ${
                  selectedFile
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
                } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-slate-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-slate-600">
                    {selectedFile ? (
                      <span className="font-semibold text-indigo-600">
                        {selectedFile.name}
                      </span>
                    ) : (
                      <>
                        <span className="font-semibold text-indigo-600">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    PNG, JPG, PDF, JSON, CSV up to 5MB
                  </p>
                </div>
              </label>
            </div>

            {/* File Info */}
            {selectedFile && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-slate-400 hover:text-rose-500 transition"
                    disabled={uploading}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Allowed File Types Info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              Allowed File Types:
            </h4>
            <div className="flex flex-wrap gap-2">
              {["JPEG", "PNG", "PDF", "JSON", "CSV"].map((type) => (
                <span
                  key={type}
                  className="px-2 py-1 text-xs rounded-lg bg-white text-slate-600 font-medium"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white
              font-semibold shadow-lg hover:bg-indigo-500 transition
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload File"}
            </button>
            <button
              onClick={onClose}
              disabled={uploading}
              className="flex-1 py-3 rounded-xl border border-slate-300
              text-slate-700 font-semibold hover:bg-slate-50 transition
              disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;