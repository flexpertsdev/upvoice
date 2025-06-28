import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/ui';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  SearchIcon,
  ArrowBackIcon,
} from '@components/icons';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center">
            {/* Animated 404 */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-8xl md:text-9xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-4">
                404
              </h1>
            </motion.div>

            {/* Error Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Oops! Page not found
              </h2>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                The page you're looking for doesn't exist. It might have been moved, 
                deleted, or you may have mistyped the URL.
              </p>
            </motion.div>

            {/* Floating Elements Animation */}
            <div className="relative h-24 w-full my-8">
              <motion.div
                className="absolute left-[20%] top-[20%]"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <SearchIcon className="w-10 h-10 text-primary-400 opacity-50" />
              </motion.div>

              <motion.div
                className="absolute right-[20%] top-[40%]"
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              >
                <HomeIcon className="w-9 h-9 text-primary-500 opacity-50" />
              </motion.div>

              <motion.div
                className="absolute left-1/2 top-[60%] -translate-x-1/2"
                animate={{
                  y: [0, -8, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 opacity-20" />
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="flex gap-4 justify-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleGoBack}
                  className="flex items-center gap-2"
                >
                  <ArrowBackIcon className="w-5 h-5" />
                  Go Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGoHome}
                  className="flex items-center gap-2"
                >
                  <HomeIcon className="w-5 h-5" />
                  Go Home
                </Button>
              </div>
            </motion.div>

            {/* Help Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div className="mt-12">
                <p className="text-sm text-gray-600 mb-4">
                  Need help? You can:
                </p>
                <div className="flex gap-6 justify-center flex-wrap">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/create')}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Create Session
                  </button>
                  <button
                    onClick={() => navigate('/join')}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Join Session
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;