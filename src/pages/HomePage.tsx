import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Camera } from 'lucide-react';
import { useAppStore } from '@/store';
import { SPIRITS } from '@/constants';
import ParticleBackground from '@/components/ParticleBackground';

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
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      variants={containerVariants}
    >
      <ParticleBackground />

      {/* 主内容区 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo和标题 */}
        <motion.div
          className="text-center mb-12"
          variants={itemVariants}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-song font-bold mb-4 text-gradient"
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            灵瑞集
          </motion.h1>
          <motion.p
            className="text-2xl md:text-3xl font-song text-amber-light/80"
            variants={itemVariants}
          >
            桌灵档案馆
          </motion.p>
        </motion.div>

        {/* 五灵宠展示 */}
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
              transition={{
                delay: index * 0.1,
                duration: 0.5,
              }}
              whileHover={{
                scale: 1.1,
                y: -5,
              }}
            >
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl md:text-3xl shadow-lg glow-amber"
                style={{
                  backgroundColor: `${spirit.color}20`,
                  border: `2px solid ${spirit.color}`,
                }}
              >
                {spirit.emoji}
              </div>
              <motion.div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                style={{ color: spirit.color }}
              >
                <span className="text-sm font-song">{spirit.name}</span>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* 描述文字 */}
        <motion.div
          className="text-center max-w-2xl mb-12 px-4"
          variants={itemVariants}
        >
          <p className="text-lg text-amber-light/70 font-hei leading-relaxed">
            五位来自灵瑞集的守护灵宠，通过观察你的桌面空间与生活痕迹，
            <br />
            陪伴你完成一次关于习惯、情绪与成长的灵居探索之旅。
          </p>
        </motion.div>

        {/* 开始按钮 */}
        <motion.button
          onClick={handleStart}
          className="btn-primary flex items-center gap-3 glow-amber"
          variants={itemVariants}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 30px rgba(212, 165, 116, 0.5)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Camera className="w-5 h-5" />
          <span className="font-song">开始探索</span>
          <Sparkles className="w-5 h-5" />
        </motion.button>

        {/* 底部说明 */}
        <motion.div
          className="mt-16 text-center text-sm text-amber-light/50"
          variants={itemVariants}
        >
          <p>数据仅存Session，关闭浏览器即清除，保障绝对隐私</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomePage;