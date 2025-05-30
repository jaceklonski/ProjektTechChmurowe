import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    
    const day = startOfToday.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() + diffToMonday);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    const tasksToday = await prisma.task.count({
      where: { createdAt: { gte: startOfToday } },
    });
    
    const tasksWeek = await prisma.task.count({
      where: { createdAt: { gte: startOfWeek } },
    });
    
    const tasksMonth = await prisma.task.count({
      where: { createdAt: { gte: startOfMonth } },
    });
    
    const tasksYear = await prisma.task.count({
      where: { createdAt: { gte: startOfYear } },
    });
    
    const usersCount = await prisma.user.count();
    
    const totalTasks = await prisma.task.count();
    
    const avgTasksPerUser = usersCount > 0 ? totalTasks / usersCount : 0;
    
    const activeUsersWeek = await prisma.user.count({
      where: {
        tasks: {
          some: {
            createdAt: { gte: startOfWeek },
          },
        },
      },
    });
    
    return NextResponse.json(
      {
        tasksToday,
        tasksWeek,
        tasksMonth,
        tasksYear,
        usersCount,
        avgTasksPerUser,
        activeUsersWeek,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/statistics error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
