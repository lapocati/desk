import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Camera } from 'lucide-react';
import { useAppStore } from '@/store';
import { SPIRITS } from '@/constants';
import PageShell from '@/components/PageShell';
import SpiritAvatar from '@/components/SpiritAvatar';

const HomePage = () => {
  const navigate = useNavigate();
  const setStage = useAppStore((state) => state.setStage);

  const handleStart = () => {
    setStage('upload');
    navigate('/upload');
  };

  const spiritList = Object.values(SPIRITS);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <PageShell ambience="entrance">
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0 }}
        variants={containerVariants}
      >
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <motion.h1
            className="text-5xl md:text-7xl font-song font-bold mb-4 text-gradient-warm"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            桌说
          </motion.h1>
          <motion.p
            className="text-2xl md:text-3xl font-song text-journal-muted"
            variants={itemVariants}
          >
            桌灵档案馆
          </motion.p>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12 max-w-4xl"
          variants={itemVariants}
        >
          {spiritList.map((spirit, index) => (
            <motion.div
              key={spirit.type}
              className="relative group"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.1, y: -5 }}
            >
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center journal-card rotate-[-3deg] group-hover:rotate-0 transition-transform"
                style={{
                  backgroundColor: `${spirit.color}12`,
                  border: `2px solid ${spirit.color}`,
                }}
              >
                <SpiritAvatar spirit={spirit} size="small" className="w-[60px] h-[60px] md:w-[74px] md:h-[74px]" />
              </div>
              <motion.div
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-center"
              >
                <span className="text-sm font-song block" style={{ color: spirit.color }}>
                  {spirit.name}
                </span>
                <span className="text-xs text-journal-muted">{spirit.title}</span>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="text-center max-w-2xl mb-12 px-4" variants={itemVariants}>
          <p className="text-lg text-journal-muted font-hei leading-relaxed">
            五位来自灵瑞集的守护灵宠，通过观察你的桌面空间与生活痕迹，
            <br />
            陪伴你完成一次关于习惯、情绪与成长的灵居探索之旅。
          </p>
        </motion.div>

        <motion.button
          onClick={handleStart}
          className="btn-primary flex items-center gap-3"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Camera className="w-5 h-5" />
          <span className="font-song">开始探索</span>
          <Sparkles className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </PageShell>
  );
};

export default HomePage;
