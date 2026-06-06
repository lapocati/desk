import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Download, Users, Share2, Heart } from 'lucide-react';
import { useAppStore } from '@/store';
import { SPIRITS } from '@/constants';
import SpiritAvatar from '@/components/SpiritAvatar';

const ResultPage = () => {
  const navigate = useNavigate();

  const finalResult = useAppStore((state) => state.finalResult);
  const clearFriendPk = useAppStore((state) => state.clearFriendPk);
  const setStage = useAppStore((state) => state.setStage);

  if (!finalResult) {
    navigate('/observation');
    return null;
  }

  const primarySpirit = SPIRITS[finalResult.primarySpirit];

  const handleDownload = () => {
    // 模拟下载功能
    alert('卡片已保存到本地');
  };

  const handleShare = () => {
    // 模拟分享功能
    if (navigator.share) {
      navigator.share({
        title: '灵瑞集·桌灵档案馆',
        text: `我的守护灵是${primarySpirit.name}，共鸣度${finalResult.primaryResonance}%！`,
        url: window.location.href,
      });
    } else {
      alert('分享链接已复制');
    }
  };

  const handleCompare = () => {
    clearFriendPk();
    setStage('compare');
    navigate('/compare');
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 守护灵大图 */}
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
      >
        <motion.div
          className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center text-5xl md:text-6xl"
          style={{
            backgroundColor: `${primarySpirit.color}20`,
            border: `4px solid ${primarySpirit.color}`,
            boxShadow: `0 0 40px ${primarySpirit.color}50, 0 0 80px ${primarySpirit.color}30`,
          }}
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <SpiritAvatar spirit={primarySpirit} size="large" className="w-full h-full" />
        </motion.div>

        {/* 共鸣度环形进度 */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: `4px solid transparent`,
            borderTopColor: primarySpirit.color,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>

      {/* 灵宠名称和共鸣度 */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2
          className="text-4xl md:text-5xl font-song font-bold mb-2"
          style={{ color: primarySpirit.color }}
        >
          {primarySpirit.name}
        </h2>
        <motion.p
          className="text-2xl md:text-3xl font-song text-amber-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          共鸣度 {finalResult.primaryResonance}%
        </motion.p>
      </motion.div>

      {/* Top3排名 */}
      <motion.div
        className="flex gap-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {finalResult.top3Spirits.map((item, index) => {
          const spirit = SPIRITS[item.spirit];
          return (
            <motion.div
              key={item.spirit}
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-xl ${
                  index === 0 ? 'glow-spirit' : ''
                }`}
                style={{
                  backgroundColor: `${spirit.color}20`,
                  border: `2px solid ${spirit.color}`,
                }}
              >
                <SpiritAvatar spirit={spirit} size="small" className="w-14 h-14" />
              </div>
              <span className="text-xs text-amber-light/70 mt-1">
                {item.resonance}%
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 人格标签 */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <motion.div
          className="inline-block px-6 py-3 rounded-full bg-amber-gold/20 border border-amber-gold"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <span className="text-xl md:text-2xl font-song font-bold text-amber-gold">
            {finalResult.personalityTag}
          </span>
        </motion.div>
        <p className="mt-3 text-sm text-amber-light/60 font-hei italic">
          {finalResult.personalityTagline}
        </p>
      </motion.div>

      {/* 动态副人格 */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-lg text-amber-light/80 font-hei italic">
          "{finalResult.dynamicPersonality}"
        </p>
      </motion.div>

      {/* 共鸣原因 */}
      <motion.div
        className="card max-w-md mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <h4 className="text-base font-song font-bold text-amber-light mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4 text-amber-gold" />
          共鸣原因
        </h4>
        <ul className="space-y-2">
          {finalResult.resonanceReasons.map((reason, index) => (
            <motion.li
              key={index}
              className="flex items-start gap-2 text-sm text-amber-light/70 font-hei"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
            >
              <span className="w-4 h-4 rounded-full bg-amber-gold/20 flex items-center justify-center text-xs text-amber-gold">
                ✓
              </span>
              {reason}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* 操作按钮 */}
      <motion.div
        className="flex flex-col md:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        <motion.button
          onClick={handleDownload}
          className="btn-primary flex items-center gap-2 glow-amber"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download className="w-4 h-4" />
          <span>下载卡片</span>
        </motion.button>

        <motion.button
          onClick={handleShare}
          className="btn-secondary flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Share2 className="w-4 h-4" />
          <span>分享结果</span>
        </motion.button>

        <motion.button
          onClick={handleCompare}
          className="btn-secondary flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Users className="w-4 h-4" />
          <span>好友PK</span>
        </motion.button>
      </motion.div>

      {/* 返回首页 */}
      <motion.button
        onClick={() => navigate('/')}
        className="mt-8 text-sm text-amber-light/50 hover:text-amber-light transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        返回首页
      </motion.button>
    </motion.div>
  );
};

export default ResultPage;