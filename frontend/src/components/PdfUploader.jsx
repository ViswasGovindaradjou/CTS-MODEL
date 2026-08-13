import React, { useState, useRef } from 'react';
import API from '../services/api';
import { UploadCloud, FileText, Loader2, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

export default function PdfUploader({ onExtracted, assessmentName = "Health Report" }) {
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please upload a valid PDF document (.pdf)');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await API.post('/predict/extract-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const extracted = res.data.extracted_fields || {};
      const fieldCount = Object.keys(extracted).length;

      if (fieldCount > 0) {
        onExtracted(extracted);
        setSuccessMsg(`✨ AI extracted ${fieldCount} clinical parameter(s) from "${file.name}"! Form fields updated automatically.`);
      } else {
        setSuccessMsg(`Uploaded "${file.name}". No matching numeric parameters recognized, but file parsed successfully.`);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to extract data from PDF file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>Auto-Fill from Medical Report (PDF)</span>
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Upload a lab test or medical PDF to extract values automatically into form fields.
            </p>
          </div>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,application/pdf"
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting PDF...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload PDF Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
