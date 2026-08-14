import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, UserCheck } from 'lucide-react';

export default function EmployeeModal({
  isOpen,
  onClose,
  employees,
  branches,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee
}) {
  const [name, setName] = useState('');
  const [branchId, setBranchId] = useState(branches[0]?.id || 'CN1');

  const [editingEmpId, setEditingEmpId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editBranchId, setEditBranchId] = useState('CN1');

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddEmployee({ name: name.trim(), branchId });
    setName('');
  };

  const startEdit = (emp) => {
    setEditingEmpId(emp.id);
    setEditName(emp.name);
    setEditBranchId(emp.branchId);
  };

  const saveEdit = (empId) => {
    if (!editName.trim()) return;
    onUpdateEmployee(empId, { name: editName.trim(), branchId: editBranchId });
    setEditingEmpId(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={20} className="text-cyan" />
            <span>Quản Lý Danh Sách Nhân Viên</span>
          </div>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Add New Employee Form */}
          <form onSubmit={handleAdd} style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
              ➕ Thêm Nhân Viên Mới
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
              <div className="form-group">
                <label>Tên nhân viên:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập tên nhân viên..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Chi nhánh:</label>
                <select
                  className="form-control"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                <Plus size={16} />
                <span>Thêm</span>
              </button>
            </div>
          </form>

          {/* Employee List */}
          <div className="form-group">
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              📋 Danh Sách Nhân Viên Hiện Tại ({employees.length}):
            </label>

            <div className="emp-list" style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {employees.map((emp, index) => {
                const branchObj = branches.find(b => b.id === emp.branchId);
                const isEditing = editingEmpId === emp.id;

                return (
                  <div key={emp.id} className="emp-item">
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '0.5rem', flex: 1, alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-control"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <select
                          className="form-control"
                          value={editBranchId}
                          onChange={(e) => setEditBranchId(e.target.value)}
                        >
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                        <button className="btn btn-primary" onClick={() => saveEdit(emp.id)} style={{ padding: '0.4rem 0.6rem' }}>
                          <Check size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="emp-item-info">
                          <span style={{ fontWeight: 700, color: 'var(--text-dim)', minWidth: '24px' }}>
                            {index + 1}.
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {emp.name}
                          </span>
                          <span className="shift-tag shift-full">
                            {branchObj?.name || emp.branchId}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem' }}
                            onClick={() => startEdit(emp)}
                            title="Sửa nhân viên"
                          >
                            <Edit2 size={14} />
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
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Hoàn Tất</button>
        </div>
      </div>
    </div>
  );
}
