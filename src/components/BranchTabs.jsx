import React from 'react';
import { Layers, Store, Lock } from 'lucide-react';
import { translations } from '../utils/language';

export default function BranchTabs({
  branches,
  activeBranchId,
  setActiveBranchId,
  employeeCounts,
  currentUser,
  lang = 'vi'
}) {
  const t = translations[lang] || translations.vi;
  const isAdmin = currentUser?.role === 'admin';
  const userBranchId = currentUser?.branchId;

  return (
    <div className="branch-bar">
      {isAdmin && (
        <button
          className={`branch-tab ${activeBranchId === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveBranchId('ALL')}
        >
          <Layers size={16} />
          <span>{lang === 'zh' ? '所有門市 (5 家分店)' : 'Tất Cả (5 Chi Nhánh)'}</span>
          <span className="count-badge">
            {Object.values(employeeCounts).reduce((a, b) => a + b, 0)}
          </span>
        </button>
      )}

      {branches.map((b) => {
        const isUserBranch = b.id === userBranchId;
        const isDisabled = !isAdmin && !isUserBranch;

        return (
          <button
            key={b.id}
            className={`branch-tab ${activeBranchId === b.id ? 'active' : ''}`}
            disabled={isDisabled}
            onClick={() => !isDisabled && setActiveBranchId(b.id)}
            style={{ opacity: isDisabled ? 0.4 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
            title={isDisabled ? `Tài khoản của bạn chỉ có quyền quản lý ${userBranchId}` : `Xem ${b.name}`}
          >
            <Store size={16} />
            <span>{b.name}</span>
            {isDisabled && <Lock size={12} className="text-dim" />}
            <span className="count-badge">{employeeCounts[b.id] || 0}</span>
          </button>
        );
      })}
    </div>
  );
}
