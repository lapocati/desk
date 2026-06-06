import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Share2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { getSpiritBeastName } from '@/constants';
import PageShell from '@/components/PageShell';
import MemoryArchiveCard from '@/components/MemoryArchiveCard';

const ResultPage = () => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  const finalResult = useAppStore((state) => state.finalResult);
  const clearFriendPk = useAppStore((state) => state.clearFriendPk);
  const setStage = useAppStore((state) => state.setStage);

  if (!finalResult) {
    navigate('/observation');
    return null;
  }

  const handleLoadTimeline = () => {
    setStage('timeline');
    navigate('/timeline');
  };

  const handleShare = () => {
    const beastName = getSpiritBeastName(finalResult.primarySpirit);
    if (navigator.share) {
      navigator.share({
        title: '灵瑞集·桌灵档案馆',
        text: `我的灵兽是${beastName}，共鸣度${finalResult.primaryResonance}%！`,
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
    <PageShell ambience="celebration" ambienceProfile="archive-showcase">
      <motion.div
        className="min-h-screen flex flex-col items-center px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-song font-bold text-gradient-warm mb-1">
            你的回忆档案
          </h2>
          <p className="text-sm text-journal-muted font-hei">
            灵宠们为你整理的专属档案卡
          </p>
        </motion.div>

        <div ref={cardRef}>
          <MemoryArchiveCard
            finalResult={finalResult}
          />
        </div>

        <motion.div
          className="flex flex-col md:flex-row gap-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={handleLoadTimeline}
            className="btn-primary flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Clock className="w-4 h-4" />
            <span>载入时间轴</span>
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

        <motion.button
          onClick={() => navigate('/')}
          className="mt-8 text-sm text-journal-muted hover:text-journal-text transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          返回首页
        </motion.button>
      </motion.div>
    </PageShell>
  );
};

export default ResultPage;
