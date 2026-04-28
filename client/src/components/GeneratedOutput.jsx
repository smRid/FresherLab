import { Copy, Download, Printer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

const GeneratedOutput = ({ content, title = 'Generated Output', filename = 'fresherlab-output', showPrint = false }) => {
  const copyContent = async () => {
    await navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  const downloadContent = (extension = 'md') => {
    const blob = new Blob([content], { type: extension === 'md' ? 'text/markdown' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded .${extension}`);
  };

  const printContent = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }
    printWindow.document.write(`<pre style="white-space:pre-wrap;font-family:Arial,sans-serif;line-height:1.55;padding:32px;">${content.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char]))}</pre>`);
    printWindow.document.close();
    printWindow.print();
  };

  if (!content) {
    return null;
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h2 className='text-lg font-semibold text-slate-800'>{title}</h2>
        <div className='flex flex-wrap gap-2'>
          <button type='button' onClick={copyContent} className='inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50'>
            <Copy className='h-4 w-4' /> Copy
          </button>
          <button type='button' onClick={() => downloadContent('txt')} className='inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50'>
            <Download className='h-4 w-4' /> TXT
          </button>
          <button type='button' onClick={() => downloadContent('md')} className='inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50'>
            <Download className='h-4 w-4' /> MD
          </button>
          {showPrint && (
            <button type='button' onClick={printContent} className='inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800'>
              <Printer className='h-4 w-4' /> Print PDF
            </button>
          )}
        </div>
      </div>
      <div className='reset-tw max-h-[560px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700'>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default GeneratedOutput;
