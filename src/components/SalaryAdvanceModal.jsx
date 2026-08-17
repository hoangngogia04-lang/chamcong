import React, { useState, useEffect } from 'react';
import { X, DollarSign, Plus, Trash2, Calendar, FileText, User, CheckCircle, AlertCircle } from 'lucide-react';
import { translations } from '../utils/language';

export default function SalaryAdvanceModal({
  isOpen,
  onClose,
  employees = [],
  branches = [],
  activeBranchId = 'ALL',
  year,
  month,
  salaryAdvances = [],
  onSaveAdvance,
  onDeleteAdvance,
  lang = 'vi'
}) {
  const t = translations[lang] || translations.vi;

  const [filterBranchId, setFilterBranchId] = useState(activeBranchId);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [advanceDate, setAdvanceDate] = useState(() => {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(month).padStart(2, '0');
    return `${year}-${m}-${d}`;
  });
  const [amount, setAmount] = useState('500000');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'history'

  // Update filter branch when activeBranchId or modal opens
  useEffect(() => {
    if (isOpen) {
      setFilterBranchId(activeBranchId);
    }
  }, [activeBranchId, isOpen]);

  // Filter employees by branch
  const filteredEmployees = employees.filter(emp => {
    if (filterBranchId && filterBranchId !== 'ALL') {
      return emp.branchId === filterBranchId;
    }
    return true;
  });

  useEffect(() => {
    if (filteredEmployees.length > 0) {
      if (!filteredEmployees.some(e => e.id === selectedEmpId)) {
        setSelectedEmpId(filteredEmployees[0].id);
      }
    } else {
      setSelectedEmpId('');
    }
  }, [filterBranchId, isOpen, employees]);

  if (!isOpen) return null;

  const formattedMonthStr = String(month).padStart(2, '0');

  // Filter advances for current month & year
  const currentMonthAdvances = salaryAdvances.filter(adv => {
    if (adv.year && adv.month) {
      return Number(adv.year) === Number(year) && Number(adv.month) === Number(month);
    }
    if (adv.date) {
      return adv.date.startsWith(`${year}-${formattedMonthStr}`);
    }
    return false;
  });

  const totalAdvanceAmount = currentMonthAdvances.reduce((sum, adv) => sum + (Number(adv.amount) || 0), 0);

  const handleQuickAmount = (val) => {
    setAmount(String(val));
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const numAmount = Number(amount);
    if (!selectedEmpId) {
      setErrorMsg('Vui lòng chọn nhân viên!');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Vui lòng nhập số tiền hợp lệ (> 0)!');
      return;
    }

    const empObj = employees.find(e => e.id === selectedEmpId);
    const newAdvance = {
      id: `adv_${Date.now()}`,
      empId: selectedEmpId,
      empName: empObj?.name || 'Nhân viên',
      branchId: empObj?.branchId || 'CN1',
      date: advanceDate,
      amount: numAmount,
      note: note.trim() || 'Ứng lương giữa tháng',
      year: Number(year),
      month: Number(month),
      createdAt: new Date().toISOString()
    };

    onSaveAdvance(newAdvance);

    setSuccessMsg(`✅ Đã tạo phiếu ứng lương ${numAmount.toLocaleString('vi-VN')}đ cho ${empObj?.name}!`);
    setNote('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', width: '92%' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center'
            }}>
              <DollarSign size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                💸 Quản Lý Ứng Lương Nhân Viên
              </h3>
              <small style={{ color: 'var(--text-muted)' }}>
                Tháng {month}/{year} | Tổng đã ứng: <strong style={{ color: 'var(--accent-amber)' }}>{totalAdvanceAmount.toLocaleString('vi-VN')}đ</strong>
              </small>
            </div>
          </div>

          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderBottom: '1px solid var(--border-color)', pb: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('add')}
            className={`btn ${activeTab === 'add' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.88rem', padding: '0.45rem 0.85rem' }}
          >
            <Plus size={16} />
            <span>Tạo Phiếu Ứng Mới</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.88rem', padding: '0.45rem 0.85rem' }}
          >
            <FileText size={16} />
            <span>Lịch Sử Ứng Lương ({currentMonthAdvances.length})</span>
          </button>
        </div>

        {/* Tab 1: Add New Advance */}
        {activeTab === 'add' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {errorMsg && (
              <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', padding: '0.65rem', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', padding: '0.65rem', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Filter Branch (if viewing ALL branches) */}
            {activeBranchId === 'ALL' && (
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>
                  🏢 Lọc Chi Nhánh:
                </label>
                <select
                  className="input"
                  value={filterBranchId}
                  onChange={e => setFilterBranchId(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', fontSize: '0.9rem' }}
                >
                  <option value="ALL">-- Tất Cả Chi Nhánh --</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Select Employee */}
            <div className="form-group">
              <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>
                👤 Chọn Nhân Viên Ứng Tiền:
              </label>
              <select
                className="input"
                value={selectedEmpId}
                onChange={e => setSelectedEmpId(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.95rem' }}
              >
                {filteredEmployees.length === 0 ? (
                  <option value="">(Không có nhân viên thuộc chi nhánh này)</option>
                ) : (
                  filteredEmployees.map(emp => {
                    const bObj = branches.find(b => b.id === emp.branchId);
                    return (
                      <option key={emp.id} value={emp.id}>
                        #{emp.stt || 1} - {emp.name} ({bObj?.name || 'CN'})
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            {/* Date & Amount */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>
                  📅 Ngày Ứng:
                </label>
                <input
                  type="date"
                  className="input"
                  value={advanceDate}
                  onChange={e => setAdvanceDate(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>
                  💵 Số Tiền Ứng (VNĐ):
                </label>
                <input
                  type="number"
                  step="50000"
                  className="input"
                  placeholder="500000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', fontWeight: 700, color: 'var(--accent-amber)' }}
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Chọn nhanh:</span>
              {[200000, 500000, 1000000, 2000000, 3000000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.2rem 0.5rem', fontWeight: Number(amount) === val ? 700 : 400 }}
                >
                  {(val / 1000).toLocaleString()}k
                </button>
              ))}
            </div>

            {/* Note */}
            <div className="form-group">
              <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>
                📝 Ghi Chú / Lý Do:
              </label>
              <input
                type="text"
                className="input"
                placeholder="Ví dụ: Ứng giữa tháng, Ứng mua đồ..."
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{ width: '100%', padding: '0.55rem' }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-amber)', color: '#000', fontWeight: 700 }}>
                💾 Lưu Phiếu Ứng Lương
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Advance History */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
            {currentMonthAdvances.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Chưa có lượt ứng lương nào trong tháng {month}/{year}
              </div>
            ) : (
              <table className="attendance-table" style={{ width: '100%', fontSize: '0.88rem' }}>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Nhân Viên</th>
                    <th>Chi Nhánh</th>
                    <th>Ngày Ứng</th>
                    <th>Số Tiền</th>
                    <th>Ghi Chú</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonthAdvances.map((adv, idx) => {
                    const empObj = employees.find(e => e.id === adv.empId);
                    const bObj = branches.find(b => b.id === (empObj?.branchId || adv.branchId));
                    return (
                      <tr key={adv.id || idx}>
                        <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700 }}>{adv.empName || empObj?.name}</td>
                        <td style={{ textAlign: 'center' }}>{bObj?.name || 'CN'}</td>
                        <td style={{ textAlign: 'center' }}>{adv.date}</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-amber)', textAlign: 'right' }}>
                          {(Number(adv.amount) || 0).toLocaleString('vi-VN')}đ
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{adv.note || '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => onDeleteAdvance(adv.id)}
                            className="btn btn-secondary"
                            style={{ padding: '0.25rem 0.45rem', color: 'var(--accent-rose)' }}
                            title="Xóa phiếu ứng này"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
