import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, Image, ArrowRight, Lightbulb } from 'lucide-react';
import { useAppStore } from '@/store';

const UploadPage = () => {
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setPhotoUrl = useAppStore((state) => state.setPhotoUrl);
  const setStage = useAppStore((state) => state.setStage);
  const setLoading = useAppStore((state) => state.setLoading);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreviewUrl(url);
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

  const handleConfirm = () => {
    if (previewUrl) {
      setPhotoUrl(previewUrl);
      setStage('loading');
      setLoading(true, '智慧灵正在整理空间线索...');
      navigate('/loading');
    }
  };

  const tips = [
    { icon: Camera, text: '建议从正上方拍摄，保持桌面完整可见' },
    { icon: Lightbulb, text: '确保光线充足，避免阴影遮挡细节' },
    { icon: Image, text: '照片清晰度越高，灵宠观察越准确' },
  ];

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {/* 标题 */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl font-song font-bold text-gradient mb-2">
          上传桌面照片
        </h2>
        <p className="text-amber-light/70 font-hei">
          让灵宠们观察你的生活空间
        </p>
      </motion.div>

      {/* 上传区域 */}
      <motion.div
        className={`w-full max-w-xl aspect-video rounded-3xl border-2 transition-all duration-300 ${
          isDragging
            ? 'border-amber-gold bg-amber-gold/10'
            : 'border-amber-gold/30 bg-ink-light/30'
        } backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer relative overflow-hidden`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="桌面预览"
            className="w-full h-full object-cover rounded-3xl"
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Upload className="w-12 h-12 text-amber-gold" />
            </motion.div>
            <p className="text-amber-light/70 font-hei">
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

      {/* 拍摄提示 */}
      <motion.div
        className="w-full max-w-xl mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {tips.map((tip, index) => (
          <motion.div
            key={index}
            className="card flex items-center gap-3 p-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <tip.icon className="w-5 h-5 text-amber-gold" />
            <span className="text-sm text-amber-light/70 font-hei">
              {tip.text}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* 操作按钮 */}
      <motion.div
        className="flex gap-4 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <button
          onClick={() => navigate('/')}
          className="btn-secondary"
        >
          返回首页
        </button>
        <motion.button
          onClick={handleConfirm}
          disabled={!previewUrl}
          className={`btn-primary flex items-center gap-2 ${
            !previewUrl ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          whileHover={previewUrl ? { scale: 1.05 } : {}}
          whileTap={previewUrl ? { scale: 0.95 } : {}}
        >
          <span>开始分析</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default UploadPage;