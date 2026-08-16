import React, { useState } from 'react';
import { UserPlus, Search, Edit2, Trash2, Check, Users, Store, Building, Tag } from 'lucide-react';
import { translations } from '../utils/language';

export default function EmployeesPage({
  employees,
  branches,
  currentUser,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  lang = 'vi'
}) {
  const t = translations[lang] || translations.vi;
  const isAdmin = currentUser?.role === 'admin';

  const [name, setName] = useState('');
  const [branchId, setBranchId] = useState(currentUser?.branchId !== 'ALL' && currentUser?.branchId ? currentUser.branchId : branches[0]?.id || 'CN1');
  const [type, setType] = useState('fulltime');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('ALL');

  const [editingEmpId, setEditingEmpId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editBranchId, setEditBranchId] = useState('CN1');
  const [editType, setEditType] = useState('fulltime');

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    // Permission check for Branch Managers
    if (!isAdmin && currentUser?.branchId && emp.branchId !== currentUser.branchId) {
      return false;
    }

    const matchesBranch = selectedBranchFilter === 'ALL' || emp.branchId === selectedBranchFilter;
    const matchesSearch = !searchQuery || emp.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddEmployee({ name: name.trim(), branchId, type });
    setName('');
  };

  const handleStartEdit = (emp) => {
    setEditingEmpId(emp.id);
    setEditName(emp.name);
    setEditBranchId(emp.branchId);
    setEditType(emp.type || 'fulltime');
  };

  const handleSaveEdit = (empId) => {
    if (!editName.trim()) return;
    onUpdateEmployee(empId, { name: editName.trim(), branchId: editBranchId, type: editType });
    setEditingEmpId(null);
  };

  return (
    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Users size={26} className="text-cyan" />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              {t.empListTitle}
            </h2>
            <small style={{ color: 'var(--text-muted)' }}>
              {lang === 'zh' ? '管理與新增各門市員工 (正職 & 兼職)' : 'Quản lý danh sách & thêm mới nhân viên các chi nhánh (Full-Time & Part-Time)'}
            </small>
          </div>
        </div>

        {/* Search */}
        <div className="search-box" style={{ width: '280px' }}>
          <Search size={18} className="text-dim" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Form Add New Employee */}
      <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={18} className="text-emerald" />
          <span>{t.addNewEmp}</span>
        </h4>

        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', alignItems: 'end' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.employeeName}:</label>
            <input
              type="text"
              className="form-control"
              placeholder={lang === 'zh' ? '請輸入姓名...' : 'Nhập họ và tên...'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.branch}:</label>
            <select
              className="form-control"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              disabled={!isAdmin && currentUser?.branchId}
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.empTypeLabel}</label>
            <select
              className="form-control"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="fulltime">👔 Full-Time ({t.fullTime})</option>
              <option value="parttime">⏱️ Part-Time ({t.partTime})</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.2rem', height: '42px' }}>
            <UserPlus size={16} />
            <span>{t.add}</span>
          </button>
        </form>
      </div>

      {/* Filter Tabs by Branch */}
      {isAdmin && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={`btn ${selectedBranchFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedBranchFilter('ALL')}
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
          >
            {t.allBranches} ({employees.length})
          </button>
          {branches.map(b => {
            const count = employees.filter(e => e.branchId === b.id).length;
            return (
              <button
                key={b.id}
                className={`btn ${selectedBranchFilter === b.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedBranchFilter(b.id)}
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
              >
                {b.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Table of Employees */}
      <div className="table-responsive" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <table className="roster-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '0.85rem', width: '70px', textAlign: 'center' }}>{t.stt}</th>
              <th style={{ padding: '0.85rem', textAlign: 'left' }}>{t.employeeName}</th>
              <th style={{ padding: '0.85rem', textAlign: 'left' }}>{t.branch}</th>
              <th style={{ padding: '0.85rem', textAlign: 'left' }}>{t.empTypeLabel}</th>
              <th style={{ padding: '0.85rem', textAlign: 'center', width: '120px' }}>{t.edit} / {t.delete}</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {lang === 'zh' ? '查無員工' : 'Chưa có nhân viên nào!'}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp, index) => {
                const branchObj = branches.find(b => b.id === emp.branchId);
                const isEditing = editingEmpId === emp.id;
                const isPT = (emp.type || 'fulltime') === 'parttime';

                return (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                      #{emp.stt || (index + 1)}
                    </td>

                    <td style={{ padding: '0.75rem' }}>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      ) : (
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{emp.name}</span>
                      )}
                    </td>

                    <td style={{ padding: '0.75rem' }}>
                      {isEditing ? (
                        <select
                          className="form-control"
                          value={editBranchId}
                          onChange={(e) => setEditBranchId(e.target.value)}
                          disabled={!isAdmin}
                        >
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {branchObj?.name || emp.branchId}
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.75rem' }}>
                      {isEditing ? (
                        <select
                          className="form-control"
                          value={editType}
                          onChange={(e) => setEditType(e.target.value)}
                        >
                          <option value="fulltime">👔 Full-Time ({t.fullTime})</option>
                          <option value="parttime">⏱️ Part-Time ({t.partTime})</option>
                        </select>
                      ) : (
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)', background: isPT ? 'rgba(139, 92, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: isPT ? 'var(--accent-purple)' : 'var(--accent-emerald)' }}>
                          {isPT ? `⏱️ Part-Time (${t.partTime})` : `👔 Full-Time (${t.fullTime})`}
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {isEditing ? (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleSaveEdit(emp.id)}
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                        >
                          <Check size={14} />
                          <span>{t.save}</span>
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleStartEdit(emp)}
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}
                            title={t.edit}
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              if (window.confirm(`${lang === 'zh' ? '確定要刪除員工' : 'Bạn có chắc muốn xóa nhân viên'} "${emp.name}"?`)) {
                                onDeleteEmployee(emp.id);
                              }
                            }}
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', color: 'var(--accent-rose)' }}
                            title={t.delete}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
