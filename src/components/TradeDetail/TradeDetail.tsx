import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Edit3,
  Trash2,
  Camera,
  X,
  Save,
  Image,
  Calendar,
  DollarSign,
  Layers,
  FileText,
  MessageSquare,
  Target,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTrade, useTradeActions } from '../../hooks/useTrades';
import { LoadingSpinner, Button, Modal, Card } from '../UI';

const TradeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trade, loading, error, setTrade, refetch } = useTrade(id);
  const { updateTrade, deleteTrade, uploadScreenshots, deleteScreenshot, loading: actionLoading } = useTradeActions();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    entry: true,
    notes: true,
    review: true,
    screenshots: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const handleSave = async () => {
    if (!trade || !editingField) return;
    
    const updated = await updateTrade(trade._id, { [editingField]: editValue });
    if (updated) {
      setTrade(updated);
      setEditingField(null);
      setEditValue('');
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleDelete = async () => {
    if (!trade) return;
    const success = await deleteTrade(trade._id);
    if (success) {
      navigate('/trades');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!trade || !e.target.files || e.target.files.length === 0) return;
    const updated = await uploadScreenshots(trade._id, e.target.files);
    if (updated) {
      setTrade(updated);
    }
    e.target.value = '';
  };

  const handleDeleteScreenshot = async (path: string) => {
    if (!trade) return;
    const updated = await deleteScreenshot(trade._id, path);
    if (updated) {
      setTrade(updated);
    }
  };

  const handleQuickUpdate = async (field: string, value: any) => {
    if (!trade) return;
    const updated = await updateTrade(trade._id, { [field]: value });
    if (updated) {
      setTrade(updated);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading trade..." />;
  }

  if (error || !trade) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || 'Trade not found'}</p>
        <Button onClick={() => navigate('/trades')}>Back to Trades</Button>
      </div>
    );
  }

  const isWin = (trade.pnl || 0) > 0;
  const isLoss = (trade.pnl || 0) < 0;

  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? '+$' : '-$';
    return `${prefix}${Math.abs(value).toFixed(2)}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {trade.symbol}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  trade.direction === 'long'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {trade.direction === 'long' ? 'Long' : 'Short'}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  trade.status === 'open'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                }`}
              >
                {trade.status === 'open' ? 'Open' : 'Closed'}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {format(new Date(trade.entryDate), 'MMMM d, yyyy • h:mm a')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* P&L Card (for closed trades) */}
      {trade.status === 'closed' && trade.pnl !== undefined && (
        <Card
          className={`p-6 ${
            isWin
              ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border-emerald-500/20'
              : isLoss
              ? 'bg-gradient-to-r from-red-500/10 to-red-500/5 border-red-500/20'
              : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  isWin
                    ? 'bg-emerald-500'
                    : isLoss
                    ? 'bg-red-500'
                    : 'bg-slate-500'
                }`}
              >
                {isWin ? (
                  <TrendingUp className="w-7 h-7 text-white" />
                ) : (
                  <TrendingDown className="w-7 h-7 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Profit / Loss
                </p>
                <p
                  className={`text-3xl font-bold ${
                    isWin
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isLoss
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-600'
                  }`}
                >
                  {formatCurrency(trade.pnl)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isWin ? 'Winner' : isLoss ? 'Lesson learned' : 'Break even'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Trade Status Quick Toggle */}
      {trade.status === 'open' && (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                This trade is still open
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Close it when you exit the position
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => handleQuickUpdate('status', 'closed')}
            >
              Close Trade
            </Button>
          </div>
        </Card>
      )}

      {/* Trade Details */}
      <Card className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <DollarSign className="w-5 h-5 mx-auto text-slate-400 mb-1" />
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {trade.entryPrice}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Entry Price</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <DollarSign className="w-5 h-5 mx-auto text-slate-400 mb-1" />
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {trade.exitPrice || '--'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Exit Price</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <Layers className="w-5 h-5 mx-auto text-slate-400 mb-1" />
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {trade.lotSize}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Lot Size</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <Calendar className="w-5 h-5 mx-auto text-slate-400 mb-1" />
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {trade.exitDate
                ? format(new Date(trade.exitDate), 'MMM d')
                : '--'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Exit Date</p>
          </div>
        </div>
      </Card>

      {/* Tags */}
      {trade.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {trade.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Entry Reason Section */}
      <Card className="overflow-hidden">
        <button
          onClick={() => toggleSection('entry')}
          className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Target className="w-5 h-5 text-amber-600 dark:text-violet-400" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Entry Reason
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Why did you take this trade?
              </p>
            </div>
          </div>
          {expandedSections.entry ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        
        {expandedSections.entry && (
          <div className="px-5 pb-5">
            {editingField === 'entryReason' ? (
              <div className="space-y-3">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="textarea"
                  rows={5}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} loading={actionLoading}>
                    <Save className="w-4 h-4 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => handleEdit('entryReason', trade.entryReason)}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group min-h-[100px]"
              >
                {trade.entryReason ? (
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {trade.entryReason}
                  </p>
                ) : (
                  <p className="text-slate-400 italic flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Click to add entry reason...
                  </p>
                )}
                <Edit3 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4" />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Notes Section */}
      <Card className="overflow-hidden">
        <button
          onClick={() => toggleSection('notes')}
          className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Notes
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Additional observations and thoughts
              </p>
            </div>
          </div>
          {expandedSections.notes ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        
        {expandedSections.notes && (
          <div className="px-5 pb-5">
            {editingField === 'notes' ? (
              <div className="space-y-3">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="textarea"
                  rows={5}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} loading={actionLoading}>
                    <Save className="w-4 h-4 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => handleEdit('notes', trade.notes)}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group min-h-[100px] relative"
              >
                {trade.notes ? (
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {trade.notes}
                  </p>
                ) : (
                  <p className="text-slate-400 italic flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Click to add notes...
                  </p>
                )}
                <Edit3 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4" />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* After Review Section */}
      <Card className="overflow-hidden">
        <button
          onClick={() => toggleSection('review')}
          className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                After Review
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                What should you have done?
              </p>
            </div>
          </div>
          {expandedSections.review ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        
        {expandedSections.review && (
          <div className="px-5 pb-5">
            {editingField === 'afterReview' ? (
              <div className="space-y-3">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="textarea"
                  rows={5}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} loading={actionLoading}>
                    <Save className="w-4 h-4 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => handleEdit('afterReview', trade.afterReview)}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group min-h-[100px] relative"
              >
                {trade.afterReview ? (
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {trade.afterReview}
                  </p>
                ) : (
                  <p className="text-slate-400 italic flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Click to add your review...
                  </p>
                )}
                <Edit3 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4" />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Screenshots Section */}
      <Card className="overflow-hidden">
        <button
          onClick={() => toggleSection('screenshots')}
          className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Image className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Screenshots
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {trade.screenshots.length} image{trade.screenshots.length !== 1 ? 's' : ''} attached
              </p>
            </div>
          </div>
          {expandedSections.screenshots ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        
        {expandedSections.screenshots && (
          <div className="px-5 pb-5">
            {/* Screenshot Grid */}
            {trade.screenshots.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {trade.screenshots.map((screenshot, index) => (
                  <div key={index} className="relative group aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <img
                      src={screenshot}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleDeleteScreenshot(screenshot)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="hidden"
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              className="w-full gap-2"
              loading={actionLoading}
            >
              <Camera className="w-5 h-5" />
              Add Screenshots
            </Button>
          </div>
        )}
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Trade"
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            Are you sure you want to delete this trade? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={actionLoading}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TradeDetail;
