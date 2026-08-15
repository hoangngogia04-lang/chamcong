import React, { useState } from 'react';
import { UserPlus, Search, Edit2, Trash2, Check, Users, Store, Building, Tag } from 'lucide-react';

export default function EmployeesPage({
  employees,
  branches,
  currentUser,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee
}) {
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
    setType('fulltime');
  };

  const startEdit = (emp) => {
    setEditingEmpId(emp.id);
    setEditName(emp.name);
    setEditBranchId(emp.branchId);
    setEditType(emp.type || 'fulltime');
  };

  const saveEdit = (empId) => {
    if (!editName.trim()) return;
    onUpdateEmployee(empId, { name: editName.trim(), branchId: editBranchId, type: editType });
    setEditingEmpId(null);
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users size={28} className="text-cyan" />
            <span>Trang Quản Lý Danh Sách Nhân Viên</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {isAdmin ? 'Quản lý toàn bộ danh sách nhân viên thuộc 5 chi nhánh' : `Danh sách nhân viên thuộc Chi nhánh ${currentUser?.branchId}`}
          </p>
        </div>

        {/* Branch Filter Tabs */}
        {isAdmin && (
          <div className="branch-bar" style={{ padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            <button
              className={`branch-tab ${selectedBranchFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedBranchFilter('ALL')}
            >
              <span>Tất Cả</span>
              <span className="count-badge">{employees.length}</span>
            </button>
            {branches.map(b => (
              <button
                key={b.id}
                className={`branch-tab ${selectedBranchFilter === b.id ? 'active' : ''}`}
                onClick={() => setSelectedBranchFilter(b.id)}
              >
                <span>{b.code}</span>
                <span className="count-badge">{employees.filter(e => e.branchId === b.id).length}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="admin-page-grid">
        {/* Form Add Employee */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} />
            <span>Thêm Nhân Viên Mới</span>
          </h3>

          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Tên Nhân Viên:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập tên nhân viên..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Chi Nhánh Phân Công:</label>
              <select
                className="form-control"
                value={branchId}
                disabled={!isAdmin && Boolean(currentUser?.branchId)}
                onChange={(e) => setBranchId(e.target.value)}
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Loại Hợp Đồng / Ca Làm:</label>
              <select
                className="form-control"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="fulltime">👔 Chính Thức (Full-Time / Gộp Ca)</option>
                <option value="parttime">⏱️ Part-Time (Ca Gãy 2 Ca)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              <UserPlus size={18} />
              <span>Thêm Nhân Viên</span>
            </button>
          </form>
        </div>

        {/* Employees Table List */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--shadow-md)' }}>
          <div className="table-toolbar" style={{ padding: 0, border: 'none', background: 'transparent' }}>
            <div className="search-box">
              <Search size={18} className="text-dim" />
              <input
                type="text"
                placeholder="Tìm tên nhân viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Hiển thị <strong>{filteredEmployees.length}</strong> nhân viên
            </div>
          </div>

          <div className="table-responsive">
            <table className="attendance-table" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>STT</th>
                  <th style={{ textAlign: 'left', paddingLeft: '1rem' }}>TÊN NHÂN VIÊN</th>
                  <th style={{ width: '150px' }}>LOẠI CA</th>
                  <th style={{ width: '160px' }}>CHI NHÁNH</th>
                  <th style={{ width: '130px' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '3rem', color: 'var(--text-dim)' }}>
                      Không có nhân viên nào trong danh sách!
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, index) => {
                    const branchObj = branches.find(b => b.id === emp.branchId);
                    const isEditing = editingEmpId === emp.id;
                    const isPartTime = (emp.type || 'fulltime') === 'parttime';

                    return (
                      <tr key={emp.id} style={{ background: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)' }}>
                        <td style={{ fontWeight: 700, color: 'var(--text-dim)' }}>
                          {emp.stt || (index + 1)}
                        </td>

                        <td style={{ textAlign: 'left', paddingLeft: '1rem' }}>
                          {isEditing ? (
                            <input
                              type="text"
                              className="form-control"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          ) : (
                            <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                              {emp.name}
                            </span>
                          )}
                        </td>

                        <td>
                          {isEditing ? (
                            <select
                              className="form-control"
                              value={editType}
                              onChange={(e) => setEditType(e.target.value)}
                            >
                              <option value="fulltime">Full-Time</option>
                              <option value="parttime">Part-Time (Gãy)</option>
                            </select>
                          ) : (
                            <span className={`shift-tag ${isPartTime ? 'shift-afternoon' : 'shift-morning'}`}>
                              {isPartTime ? '⏱️ Part-Time' : '👔 Full-Time'}
                            </span>
                          )}
                        </td>

                        <td>
                          {isEditing ? (
                            <select
                              className="form-control"
                              value={editBranchId}
                              disabled={!isAdmin}
                              onChange={(e) => setEditBranchId(e.target.value)}
                            >
                              {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="shift-tag shift-full">
                              {branchObj?.name || emp.branchId}
                            </span>
                          )}
                        </td>

                        <td>
                          {isEditing ? (
                            <button className="btn btn-primary" onClick={() => saveEdit(emp.id)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                              <Check size={16} />
                              <span>Lưu</span>
                            </button>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                                onClick={() => startEdit(emp)}
                                title="Sửa nhân viên"
                              >
                                <Edit2 size={14} />
                                <span>Sửa</span>
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.35rem', color: 'var(--accent-rose)' }}
                                onClick={() => onDeleteEmployee(emp.id)}
                                title="Xóa nhân viên"
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
      </div>
    </div>
  );
}
