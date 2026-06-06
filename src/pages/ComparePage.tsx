import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Upload,
  ArrowRight,
  Loader2,
  RefreshCw,
  Camera,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { SPIRITS } from '@/constants';
import PageShell from '@/components/PageShell';
import MemoryArchiveCard from '@/components/MemoryArchiveCard';
import { PaperClip, WashiTape } from '@/components/ScrapbookDecor';
import { analyzeFriendForPk } from '@/utils/analyzeFriendForPk';
import { mapFinalResultToPkInput } from '@/utils/mapFinalResultToPkInput';
import { getPkRelationship } from '@/services/pkRelationshipApi';

const PK_LOADING_MESSAGES = [
  '奇想灵正在观察好友的桌面…',
  '智慧灵正在解读共鸣…',
  '灵宠们正在描绘你们的相处画面…',
];

const ComparePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const finalResult = useAppStore((state) => state.finalResult);
  const friendResult = useAppStore((state) => state.friendResult);
  const pkRelationship = useAppStore((state) => state.pkRelationship);
  const isAnalyzingFriend = useAppStore((state) => state.isAnalyzingFriend);
  const friendAnalysisError = useAppStore((state) => state.friendAnalysisError);
  const isGeneratingPk = useAppStore((state) => state.isGeneratingPk);
  const pkError = useAppStore((state) => state.pkError);

  const setFriendResult = useAppStore((state) => state.setFriendResult);
  const setPkRelationship = useAppStore((state) => state.setPkRelationship);
  const setIsAnalyzingFriend = useAppStore((state) => state.setIsAnalyzingFriend);
  const setFriendAnalysisError = useAppStore((state) => state.setFriendAnalysisError);
  const setIsGeneratingPk = useAppStore((state) => state.setIsGeneratingPk);
  const setPkError = useAppStore((state) => state.setPkError);
  const clearFriendPk = useAppStore((state) => state.clearFriendPk);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  const runAnalysis = useCallback(
    async (photoDataUrl: string) => {
      setFriendAnalysisError(null);
      setPkError(null);
      setFriendResult(null);
      setPkRelationship(null);
      setIsAnalyzingFriend(true);

      let friend;
      try {
        friend = await analyzeFriendForPk(photoDataUrl);
        setFriendResult(friend);
      } catch (err) {
        setFriendAnalysisError(err instanceof Error ? err.message : '好友桌面分析失败，请重试');
        return;
      } finally {
        setIsAnalyzingFriend(false);
      }

      setIsGeneratingPk(true);
      try {
        const pk = await getPkRelationship(
          mapFinalResultToPkInput(finalResult!),
          mapFinalResultToPkInput(friend)
        );
        setPkRelationship(pk);
      } catch {
        setPkError('pk_retry');
      } finally {
        setIsGeneratingPk(false);
      }
    },
    [
      finalResult,
      setFriendResult,
      setPkRelationship,
      setIsAnalyzingFriend,
      setFriendAnalysisError,
      setIsGeneratingPk,
      setPkError,
    ]
  );

  useEffect(() => {
    if (!isAnalyzingFriend && !isGeneratingPk) {
      setLoadingMsgIndex(0);
      return;
    }
    const timers = [
      setTimeout(() => setLoadingMsgIndex(1), 3000),
      setTimeout(() => setLoadingMsgIndex(2), 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isAnalyzingFriend, isGeneratingPk]);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleConfirmUpload = () => {
    if (previewUrl) {
      runAnalysis(previewUrl);
    }
  };

  const handleRetryPkOnly = async () => {
    if (!finalResult || !friendResult) return;
    setPkError(null);
    setIsGeneratingPk(true);
    try {
      const pk = await getPkRelationship(
        mapFinalResultToPkInput(finalResult),
        mapFinalResultToPkInput(friendResult)
      );
      setPkRelationship(pk);
    } catch {
      setPkError('pk_retry');
    } finally {
      setIsGeneratingPk(false);
    }
  };

  const handleChangeFriendPhoto = () => {
    clearFriendPk();
    setPreviewUrl(null);
  };

  if (!finalResult) {
    navigate('/observation');
    return null;
  }

  const isLoading = isAnalyzingFriend || isGeneratingPk;
  const showResult = !!(friendResult && pkRelationship && !isLoading);
  const showPkRetry = !!(friendResult && !pkRelationship && pkError && !isLoading);
  const showUpload = !showResult && !showPkRetry && !isLoading;
  const showAnalyzing = isLoading;
  const loadingMsg = PK_LOADING_MESSAGES[loadingMsgIndex % PK_LOADING_MESSAGES.length];

  const primarySpirit = SPIRITS[finalResult.primarySpirit];
  const friendSpirit = friendResult ? SPIRITS[friendResult.primarySpirit] : null;

  return (
    <PageShell ambience="celebration" bgClass="from-archive-bg to-journal-secondary">
      <motion.div
        className="min-h-screen flex flex-col items-center px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-song font-bold text-gradient-warm mb-2">
            守护灵PK
          </h2>
          <p className="text-journal-muted font-hei">
            {showUpload ? '上传好友的桌面照片，看看守护灵们的相处预测' : '看看你们的守护灵相处预测'}
          </p>
        </motion.div>

        {showUpload && (
          <>
            <motion.div
              className={`w-full max-w-xl aspect-video rounded-2xl border-2 border-dashed transition-all duration-300 relative ${
                isDragging
                  ? 'border-journal-accent bg-journal-secondary'
                  : 'border-journal-border bg-journal-card'
              } flex flex-col items-center justify-center cursor-pointer overflow-hidden`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <WashiTape className="-top-2 left-6" />
              {previewUrl ? (
                <img src={previewUrl} alt="好友桌面预览" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Upload className="w-12 h-12 text-journal-accent" />
                  <p className="text-journal-muted font-hei">点击上传或拖拽图片到这里</p>
                  <p className="text-xs text-journal-muted/70 font-hei flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    手机端可直接拍摄
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />
            </motion.div>

            {friendAnalysisError && (
              <p className="mt-4 text-sm text-red-500 font-hei">{friendAnalysisError}</p>
            )}

            <motion.div className="flex gap-4 mt-8">
              <button onClick={() => navigate('/result')} className="btn-secondary">
                返回结果
              </button>
              <motion.button
                onClick={handleConfirmUpload}
                disabled={!previewUrl}
                className={`btn-primary flex items-center gap-2 ${!previewUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={previewUrl ? { scale: 1.05 } : {}}
                whileTap={previewUrl ? { scale: 0.95 } : {}}
              >
                <span>开始分析</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </>
        )}

        {showAnalyzing && (
          <motion.div className="flex flex-col items-center gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Loader2 className="w-12 h-12 text-journal-accent animate-spin" />
            <p className="text-journal-text font-hei">{loadingMsg}</p>
          </motion.div>
        )}

        {showPkRetry && friendSpirit && (
          <motion.div className="flex flex-col items-center gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-journal-text font-hei text-sm">灵宠走神了，再试一次吧</p>
            <p className="text-journal-muted font-hei text-sm">
              好友守护灵已识别：{friendSpirit.name}（共鸣度 {friendResult!.primaryResonance}%）
            </p>
            <div className="flex gap-4">
              <motion.button onClick={handleRetryPkOnly} className="btn-primary flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                <span>再试一次</span>
              </motion.button>
              <motion.button onClick={handleChangeFriendPhoto} className="btn-secondary">
                换一张好友照片
              </motion.button>
            </div>
          </motion.div>
        )}

        {showResult && friendSpirit && pkRelationship && (
          <>
            <motion.div
              className="w-full max-w-3xl flex items-start justify-center gap-4 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="flex-1 max-w-xs"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <MemoryArchiveCard
                  compact
                  finalResult={finalResult}
                  spirit={primarySpirit}
                  resonance={finalResult.primaryResonance}
                  personalityTag={finalResult.personalityTag}
                  label="你"
                />
              </motion.div>

              <motion.div
                className="flex shrink-0 items-center justify-center mt-14"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <PaperClip />
                <span className="text-lg font-song text-journal-muted mx-1">VS</span>
                <PaperClip />
              </motion.div>

              <motion.div
                className="flex-1 max-w-xs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <MemoryArchiveCard
                  compact
                  finalResult={friendResult}
                  spirit={friendSpirit}
                  resonance={friendResult.primaryResonance}
                  personalityTag={friendResult.personalityTag}
                  label="好友"
                />
              </motion.div>
            </motion.div>

            <motion.div
              className="journal-card max-w-md text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h4 className="text-lg font-song font-bold text-journal-text mb-4">共鸣纽带</h4>
              <p className="text-lg font-song text-journal-accent italic">「{pkRelationship.bond}」</p>
            </motion.div>

            <motion.div
              className="journal-card max-w-md text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="text-lg font-song font-bold text-journal-text mb-4">相处预测</h4>
              <div className="space-y-3">
                {pkRelationship.scenarios.map((scenario, index) => (
                  <motion.p
                    key={index}
                    className="text-base font-song text-journal-text/90"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    {scenario}
                  </motion.p>
                ))}
              </div>
            </motion.div>

            <motion.div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                onClick={handleChangeFriendPhoto}
                className="btn-secondary flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="w-4 h-4" />
                <span>换一张好友照片</span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/result')}
                className="btn-secondary flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回结果</span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/')}
                className="btn-primary flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-4 h-4" />
                <span>重新开始</span>
              </motion.button>
            </motion.div>
          </>
        )}
      </motion.div>
    </PageShell>
  );
};

export default ComparePage;
