import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

// Animation variants cho container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: 'beforeChildren',
      staggerChildren: 0.2,
    },
  },
};

// Animation variants cho các phần tử con
const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// Animation cho icon
const iconVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      repeat: 3,
      repeatType: 'reverse' as const,
    },
  },
};

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <motion.div
        className="text-center space-y-6 p-6 max-w-md w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={iconVariants}>
          <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500" />
        </motion.div>
        <motion.h1
          className="text-4xl font-bold text-gray-800"
          variants={childVariants}
        >
          404 - Page Not Found
        </motion.h1>
        <motion.p className="text-lg text-gray-600" variants={childVariants}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </motion.p>
        <motion.div variants={childVariants}>
          <Button asChild size="lg" className="mt-4 bg-blue-600 hover:bg-blue-700">
            <Link to="/">Back to Home</Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}