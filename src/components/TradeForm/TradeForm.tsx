import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, TrendingUp, TrendingDown, X, Plus, Camera, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../UI';
import { useTradeActions } from '../../hooks/useTrades';
import { TradeFormData } from '../../types';
import { extractFromMT5Screenshot, MT5ExtractedData } from '../../utils/mt5Parser';

const SYMBOLS = ['GBPUSD', 'EURUSD', 'USDCAD', 'XAUUSD', 'BTCUSD'];
const PRESET_TAGS = ['Scalp', 'Swing', 'Breakout', 'Reversal', 'Trend', 'News'];

const TradeForm = () => {
  const navigate = useNavigate();
  const { createTrade, loading, uploadScreenshots } = useTradeActions();

  const [formData, setFormData] = useState<TradeFormData>({
    symbol: 'GBPUSD',
    direction: 'long',
    entryPrice: 0,
    exitPrice: undefined,
    stopLoss: undefined,
    takeProfit: undefined,
    lotSize: 0.01,
    entryDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    exitDate: undefined,
    pnl: undefined,
    status: 'open',
    entryReason: '',
    notes: '',
    afterReview: '',
    tags: [],
  });

  const [customSymbol, setCustomSymbol] = useState('');
  const [showCustomSymbol, setShowCustomSymbol] = useState(false);
  const [customTag, setCustomTag] = useState('');

  // OCR state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const ocrFileInputRef = useRef<HTMLInputElement>(null);
  const screenshotsInputRef = useRef<HTMLInputElement>(null);

  const [selectedScreenshots, setSelectedScreenshots] = useState<Array<{ file: File; preview: string }>>([]);
  const previewsRef = useRef<string[]>([]);

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setExtractionProgress(0);
    setExtractionError(null);

    try {
      const extractedData = await extractFromMT5Screenshot(file, (progress) => {
        setExtractionProgress(progress);
      });

      // Apply extracted data to form
      applyExtractedData(extractedData);
    } catch (error) {
      console.error('Extraction failed:', error);
      setExtractionError('Failed to extract data from screenshot. Try a clearer image.');
    } finally {
      setIsExtracting(false);
      setExtractionProgress(0);
      // Reset file input
      if (ocrFileInputRef.current) {
        ocrFileInputRef.current.value = '';
      }
    }
  };

  const handleScreenshotsSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: Array<{ file: File; preview: string }> = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    // store previews in ref for cleanup
    previewsRef.current.push(...newFiles.map((f) => f.preview));

    setSelectedScreenshots((prev) => [...prev, ...newFiles]);

    // reset input so same file can be selected again if needed
    if (screenshotsInputRef.current) screenshotsInputRef.current.value = '';
  };

  const handleRemoveSelectedScreenshot = (index: number) => {
    setSelectedScreenshots((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      // remove preview from ref
      previewsRef.current = previewsRef.current.filter((p) => p !== removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((p) => URL.revokeObjectURL(p));
      previewsRef.current = [];
    };
  }, []);

  const applyExtractedData = (data: MT5ExtractedData) => {
    setFormData((prev) => ({
      ...prev,
      symbol: data.symbol || prev.symbol,
      direction: data.direction || prev.direction,
      lotSize: data.lotSize || prev.lotSize,
      entryPrice: data.entryPrice || prev.entryPrice,
      stopLoss: data.stopLoss || prev.stopLoss,
      takeProfit: data.takeProfit || prev.takeProfit,
      entryDate: data.entryDate || prev.entryDate,
    }));

    // If symbol is not in preset list, it's custom
    if (data.symbol && !SYMBOLS.includes(data.symbol)) {
      setShowCustomSymbol(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value,
    }));
  };

  const handleToggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()],
      }));
      setCustomTag('');
    }
  };

  const handleAddCustomSymbol = () => {
    if (customSymbol.trim()) {
      setFormData((prev) => ({
        ...prev,
        symbol: customSymbol.trim().toUpperCase(),
      }));
      setShowCustomSymbol(false);
      setCustomSymbol('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      exitPrice: formData.status === 'closed' ? formData.exitPrice : undefined,
      exitDate: formData.status === 'closed' ? formData.exitDate : undefined,
      pnl: formData.status === 'closed' ? formData.pnl : undefined,
    };
    
    const trade = await createTrade(dataToSubmit);
    if (trade) {
      // If user selected screenshots during creation, upload them now
      if (selectedScreenshots.length > 0 && uploadScreenshots) {
        // convert File[] -> FileList via DataTransfer
        const dt = new DataTransfer();
        selectedScreenshots.forEach((s) => dt.items.add(s.file));
        await uploadScreenshots(trade._id, dt.files);
      }
      navigate(`/trades/${trade._id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Add Trade
        </h1>
      </div>

      {/* Screenshot OCR Section */}
      <div className="card p-5 mb-6 bg-gradient-to-r from-amber-500/10 to-violet-500/10 dark:from-amber-500/5 dark:to-violet-500/5 border-amber-500/20 dark:border-violet-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-violet-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
              Auto-fill from MT5 Screenshot
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Upload a screenshot of your trade from MT5 and we'll extract the details automatically.
            </p>
            
            <input
              type="file"
              ref={ocrFileInputRef}
              onChange={handleScreenshotUpload}
              accept="image/*"
              className="hidden"
            />
            
            {isExtracting ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-violet-500 transition-all duration-300"
                    style={{ width: `${extractionProgress}%` }}
                  />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {extractionProgress}%
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => ocrFileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
              >
                <Camera className="w-4 h-4" />
                Upload Screenshot
              </button>
            )}
            
            {extractionError && (
              <p className="mt-2 text-sm text-red-500">{extractionError}</p>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Symbol Selection */}
        <div className="card p-5">
          <label className="label">Symbol / Pair</label>
          {!showCustomSymbol ? (
            <div className="flex flex-wrap gap-2">
              {SYMBOLS.map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, symbol }))}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    formData.symbol === symbol
                      ? 'accent-bg text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {symbol}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowCustomSymbol(true)}
                className="px-4 py-2 rounded-xl font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
              >
                + Other
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                placeholder="Enter symbol..."
                className="input flex-1"
                autoFocus
              />
              <Button type="button" onClick={handleAddCustomSymbol}>
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCustomSymbol(false)}
              >
                Cancel
              </Button>
            </div>
          )}
          {formData.symbol && !SYMBOLS.includes(formData.symbol) && (
            <p className="mt-2 text-sm accent-text">
              Custom symbol: {formData.symbol}
            </p>
          )}
        </div>

        {/* Direction */}
        <div className="card p-5">
          <label className="label">Direction</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, direction: 'long' }))}
              className={`flex items-center justify-center gap-2 py-4 rounded-xl font-medium transition-all ${
                formData.direction === 'long'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Long / Buy
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, direction: 'short' }))}
              className={`flex items-center justify-center gap-2 py-4 rounded-xl font-medium transition-all ${
                formData.direction === 'short'
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30'
              }`}
            >
              <TrendingDown className="w-5 h-5" />
              Short / Sell
            </button>
          </div>
        </div>

        {/* Entry Details */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Entry Details
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Entry Price</label>
              <input
                type="number"
                name="entryPrice"
                value={formData.entryPrice || ''}
                onChange={handleChange}
                step="any"
                required
                className="input"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="label">Lot Size</label>
              <input
                type="number"
                name="lotSize"
                value={formData.lotSize || ''}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                required
                className="input"
                placeholder="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Stop Loss (SL)</label>
              <input
                type="number"
                name="stopLoss"
                value={formData.stopLoss || ''}
                onChange={handleChange}
                step="any"
                className="input"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="label">Take Profit (TP)</label>
              <input
                type="number"
                name="takeProfit"
                value={formData.takeProfit || ''}
                onChange={handleChange}
                step="any"
                className="input"
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label className="label">Entry Date & Time</label>
            <input
              type="datetime-local"
              name="entryDate"
              value={formData.entryDate}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
        </div>

        {/* Status & Exit Details */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Trade Status
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, status: 'open' }))}
              className={`py-3 rounded-xl font-medium transition-all ${
                formData.status === 'open'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Open Trade
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, status: 'closed' }))}
              className={`py-3 rounded-xl font-medium transition-all ${
                formData.status === 'closed'
                  ? 'accent-bg text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Closed Trade
            </button>
          </div>

          {formData.status === 'closed' && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Exit Price</label>
                  <input
                    type="number"
                    name="exitPrice"
                    value={formData.exitPrice || ''}
                    onChange={handleChange}
                    step="any"
                    className="input"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="label">P&L ($)</label>
                  <input
                    type="number"
                    name="pnl"
                    value={formData.pnl || ''}
                    onChange={handleChange}
                    step="any"
                    className="input"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="label">Exit Date & Time</label>
                <input
                  type="datetime-local"
                  name="exitDate"
                  value={formData.exitDate || ''}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Journal Section */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            📝 Journal
          </h3>

          <div>
            <label className="label">Why did you enter this trade?</label>
            <textarea
              name="entryReason"
              value={formData.entryReason}
              onChange={handleChange}
              className="textarea"
              placeholder="Describe your entry reason, setup, confluences..."
              rows={4}
            />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="textarea"
              placeholder="Any additional notes, observations, emotions..."
              rows={3}
            />
          </div>

          <div>
            <label className="label">After Review - What should you have done?</label>
            <textarea
              name="afterReview"
              value={formData.afterReview}
              onChange={handleChange}
              className="textarea"
              placeholder="After analyzing, what could you have done better? Lessons learned..."
              rows={3}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="card p-5">
          <label className="label">Screenshots</label>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Add screenshots for this trade (you can add multiple).</p>

          <input
            type="file"
            ref={screenshotsInputRef}
            onChange={handleScreenshotsSelect}
            accept="image/*"
            multiple
            className="hidden"
          />

          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => screenshotsInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
            >
              <Camera className="w-4 h-4" />
              Add Screenshots
            </button>
            <span className="text-sm text-slate-500 dark:text-slate-400">{selectedScreenshots.length} selected</span>
          </div>

          {selectedScreenshots.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {selectedScreenshots.map((s, idx) => (
                <div key={s.preview} className="relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={s.preview} alt={`screenshot-${idx}`} className="w-full h-24 object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveSelectedScreenshot(idx); }}
                    className="absolute top-1 right-1 bg-white/80 dark:bg-slate-900/80 rounded-full p-1 hover:opacity-90"
                    aria-label="Remove screenshot"
                  >
                    <X className="w-3 h-3 text-slate-700 dark:text-slate-200" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Tags
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {PRESET_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleToggleTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  formData.tags.includes(tag)
                    ? 'accent-bg text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Custom Tags */}
          {formData.tags.filter((t) => !PRESET_TAGS.includes(t)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags
                .filter((t) => !PRESET_TAGS.includes(t))
                .map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium accent-bg text-white"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className="hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
            </div>
          )}

          {/* Add Custom Tag */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="Add custom tag..."
              className="input flex-1"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddCustomTag}
              disabled={!customTag.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Save Trade
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TradeForm;
