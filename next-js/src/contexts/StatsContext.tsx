'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { useTaskContext } from '@/contexts/TaskManagementContext'
import { useCategoryContext } from '@/contexts/CategoryManagement'

interface StatsContextType {
  tasksCompleted: number
  productivityScore: number
  taskDistribution: { [category: string]: number }
}

const StatsContext = createContext<StatsContextType | undefined>(undefined)

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { tasks } = useTaskContext()
  const { categories } = useCategoryContext()

  const tasksCompleted = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  )

  const productivityScore = useMemo(() => {
    if (tasks.length === 0) return 0
    return Math.round((tasksCompleted / tasks.length) * 100)
  }, [tasks, tasksCompleted])

  const taskDistribution = useMemo(() => {
    if (tasks.length === 0) return {}
    const distribution: { [category: string]: number } = {}
    tasks.forEach((task) => {
      const categoryName =
        categories.find((cat) => cat.id === task.category)?.name ||
        'Uncategorized'
      distribution[categoryName] = (distribution[categoryName] || 0) + 1
    })
    Object.keys(distribution).forEach((key) => {
      distribution[key] = Math.round((distribution[key] / tasks.length) * 100)
    })
    return distribution
  }, [tasks, categories])

  const value = { tasksCompleted, productivityScore, taskDistribution }

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
}

export const useStatsContext = (): StatsContextType => {
  const context = useContext(StatsContext)
  if (!context) {
    throw new Error('useStatsContext must be used within a StatsProvider')
  }
  return context
}
