'use client'

import React, { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface NotificationProps {
  id: string
  type: NotificationType
  message: string
  duration?: number
  onClose: (id: string) => void
}

const iconMap: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
  warning: <AlertCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
}

const bgColorMap: Record<NotificationType, string> = {
  success: 'bg-green-100 dark:bg-green-800',
  error: 'bg-red-100 dark:bg-red-800',
  warning: 'bg-yellow-100 dark:bg-yellow-800',
  info: 'bg-blue-100 dark:bg-blue-800',
}

const textColorMap: Record<NotificationType, string> = {
  success: 'text-green-800 dark:text-green-100',
  error: 'text-red-800 dark:text-red-100',
  warning: 'text-yellow-800 dark:text-yellow-100',
  info: 'text-blue-800 dark:text-blue-100',
}

const iconAnimationMap: Record<NotificationType, React.ReactNode> = {
  success: (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, repeat: Infinity, repeatType: 'reverse' }}
      className="absolute inset-0 bg-green-400 rounded-full opacity-30"
    />
  ),
  error: (
    <motion.div
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-0 border-2 border-red-500 rounded-full border-t-transparent"
    />
  ),
  warning: (
    <motion.div
      animate={{ x: [-2, 2, -2] }}
      transition={{ duration: 0.5, repeat: Infinity }}
      className="absolute inset-0"
    />
  ),
  info: (
    <motion.div
      animate={{ y: [-2, 2, -2] }}
      transition={{ duration: 0.5, repeat: Infinity }}
      className="absolute inset-0"
    />
  ),
}

export const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: 50 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className={`flex items-center p-3 mb-2 rounded-lg shadow-md ${bgColorMap[type]} ${textColorMap[type]} transition-all duration-300 ease-in-out max-w-sm`}
          role="alert"
        >
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 mr-3 relative">
            {iconAnimationMap[type]}
            {iconMap[type]}
          </div>
          <p className="text-sm font-medium">{message}</p>
          <button
            type="button"
            className={`ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 ${textColorMap[type]} hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-white`}
            onClick={() => {
              setIsVisible(false)
              onClose(id)
            }}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const NotificationContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2 max-w-sm">
      {children}
    </div>
  )
}

