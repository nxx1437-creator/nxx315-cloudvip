import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Coins, Target, Loader2 } from 'lucide-react';
import useSession from '../hooks/useSession.js';
import useTasks from '../hooks/useTasks.js';
import BottomNav from '../components/BottomNav.jsx';

export default function Tasks() {
  const { session } = useSession();
  const { tasks, loading } = useTasks(session?.user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white pb-24">
      <div className="mx-auto max-w-md px-4 py-5">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900">🎯 Nhiệm vụ</h1>
          <p className="text-slate-500">Hoàn thành nhiệm vụ để nhận Coin</p>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 size={32} className="animate-spin text-sky-500 mx-auto" />
            <p className="mt-2 text-slate-400">Đang tải...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-12 text-center text-slate-400">Chưa có nhiệm vụ</div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-slate-100">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900">{task.provider}</h3>
                  <p className="text-sm text-slate-500">{task.remainingToday || 0} lượt còn</p>
                </div>
                <div className="flex items-center gap-2">
                  <Coins size={16} className="text-amber-500" />
                  <span className="font-bold text-amber-500">{task.reward_coins}</span>
                </div>
              </div>
              <button className="mt-3 w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-2 text-white font-semibold">
                Làm nhiệm vụ
              </button>
            </div>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
}
