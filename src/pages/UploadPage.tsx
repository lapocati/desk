import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, Image, ArrowRight, Lightbulb, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store';
import PageShell from '@/components/PageShell';
import { WashiTape } from '@/components/ScrapbookDecor';
import { prepareImageForAnalysis } from '@/utils/prepareImageForAnalysis';

const UploadPage = () => {
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preparedPhotoUrl, setPreparedPhotoUrl] = useState<string | null>(null);
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const preparePromiseRef = useRef<Promise<string> | null>(null);
  const prepareGenerationRef = useRef(0);

  const setPhotoUrl = useAppStore((state) => state.setPhotoUrl);
  const setStage = useAppStore((state) => state.setStage);
  const setLoading = useAppStore((state) => state.setLoading);
  const resetInitialDialoguePrefetch = useAppStore((state) => state.resetInitialDialoguePrefetch);

  const handleFileSelect = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;

    const currentGeneration = ++prepareGenerationRef.current;
    setPrepareError(null);
    setPreparedPhotoUrl(null);
    setIsPreparingPhoto(true);

    const preparePromise = new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const url = e.target?.result as string;
          if (prepareGenerationRef.current !== currentGeneration) {
            resolve('');
            return;
          }
          setPreviewUrl(url);
          const preparedUrl = await prepareImageForAnalysis(url);
          resolve(preparedUrl);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error('图片读取失败，请重试'));
      reader.readAsDataURL(file);
    });

    preparePromiseRef.current = preparePromise;

    void preparePromise
      .then((preparedUrl) => {
        if (prepareGenerationRef.current !== currentGeneration) return;
        setPreparedPhotoUrl(preparedUrl);
        setIsPreparingPhoto(false);
      })
      .catch((err) => {
        if (prepareGenerationRef.current !== currentGeneration) return;
        setPrepareError(err instanceof Error ? err.message : '图片准备失败，请重试');
        setIsPreparingPhoto(false);
      });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleConfirm = async () => {
    if (!previewUrl || isConfirming) return;

    setIsConfirming(true);
    setPrepareError(null);

    try {
      const analysisPhotoUrl =
        preparedPhotoUrl ?? (preparePromiseRef.current ? await preparePromiseRef.current : null);

      if (!analysisPhotoUrl) {
        throw new Error('图片准备失败，请重试');
      }

      resetInitialDialoguePrefetch();
      setPhotoUrl(analysisPhotoUrl);
      setStage('loading');
      setLoading(true, '智慧灵正在整理空间线索...');
      navigate('/loading');
    } catch (err) {
      setPrepareError(err instanceof Error ? err.message : '图片准备失败，请重试');
    } finally {
      setIsConfirming(false);
    }
  };

  const tips = [
    { icon: Camera, text: '建议从正上方拍摄，保持桌面完整可见' },
    { icon: Lightbulb, text: '确保光线充足，避免阴影遮挡细节' },
    { icon: Image, text: '照片清晰度越高，灵宠观察越准确' },
  ];

  return (
    <PageShell ambience="entrance">
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-song font-bold text-gradient-warm mb-2">
            上传桌面照片
          </h2>
          <p className="text-journal-muted font-hei">
            将照片粘贴进档案手账，让灵宠们观察你的生活空间
          </p>
        </motion.div>

        <motion.div
          className={`w-full max-w-xl aspect-video rounded-2xl border-2 border-dashed transition-all duration-300 relative ${
            isDragging
              ? 'border-journal-accent bg-journal-secondary'
              : 'border-journal-border bg-journal-card'
          } flex flex-col items-center justify-center cursor-pointer overflow-hidden`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <WashiTape className="-top-2 left-6" color="#E7B96A" />
          <WashiTape className="-top-2 right-6 rotate-[5deg]" color="#D4A574" />
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="桌面预览"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Upload className="w-12 h-12 text-journal-accent" />
              </motion.div>
              <p className="text-journal-muted font-hei">
                点击上传或拖拽图片到这里
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
        </motion.div>

        <motion.div
          className="w-full max-w-xl mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              className="journal-card flex items-center gap-3 p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <tip.icon className="w-5 h-5 text-journal-accent" />
              <span className="text-sm text-journal-muted font-hei">
                {tip.text}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="w-full max-w-xl mt-4 text-center min-h-[24px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {prepareError ? (
            <p className="text-sm text-red-500/80 font-hei">{prepareError}</p>
          ) : previewUrl && isPreparingPhoto ? (
            <p className="text-sm text-journal-muted font-hei">正在提前整理图片，确认后会更快开始对话…</p>
          ) : null}
        </motion.div>

        <motion.div
          className="flex gap-4 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button onClick={() => navigate('/')} className="btn-secondary">
            返回首页
          </button>
          <motion.button
            onClick={handleConfirm}
            disabled={!previewUrl || isConfirming}
            className={`btn-primary flex items-center gap-2 ${
              !previewUrl || isConfirming ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            whileHover={previewUrl && !isConfirming ? { scale: 1.05 } : {}}
            whileTap={previewUrl && !isConfirming ? { scale: 0.95 } : {}}
          >
            {isConfirming ? (
              <>
                <span>正在准备</span>
                <Loader2 className="w-5 h-5 animate-spin" />
              </>
            ) : (
              <>
                <span>开始分析</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </PageShell>
  );
};

export default UploadPage;
