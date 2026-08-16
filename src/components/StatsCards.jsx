import React from 'react';
import { Users, Building } from 'lucide-react';
import { translations } from '../utils/language';

export default function StatsCards({
  employees,
  activeBranchId,
  branches,
  lang = 'vi'
}) {
  const t = translations[lang] || translations.vi;
  const activeBranch = branches.find(b => b.id === activeBranchId);

  return (
    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
      <div className="stat-card">
        <div className="stat-icon cyan">
          <Users size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{employees.length}</span>
          <span className="stat-label">{t.totalEmployees}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon amber">
          <Building size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-value">
            {activeBranchId === 'ALL' ? (lang === 'zh' ? '所有 5 家門市' : 'Tất cả 5 Chi Nhánh') : activeBranch?.name || activeBranchId}
          </span>
          <span className="stat-label">{lang === 'zh' ? '當前選擇門市' : 'Chi Nhánh Đang Chọn'}</span>
        </div>
      </div>
    </div>
  );
}
