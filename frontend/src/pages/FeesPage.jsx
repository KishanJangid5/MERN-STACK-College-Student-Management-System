import { useState, useEffect, useCallback } from 'react';
import { feeAPI } from '../services/api';
import { Icons } from '../components/Icons';

export default function FeesPage({
  selectedStudentId,
  studentsList = [],
  onSelectStudent,
  isAuthenticated,
  user
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment Modal state
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [payNotes, setPayNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // New Fee Invoice Modal state (for admin)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invFeeType, setInvFeeType] = useState('Consolidated Semester Fee');
  const [invTotal, setInvTotal] = useState('');
  const [invPaid, setInvPaid] = useState('');
  const [invDueDate, setInvDueDate] = useState('');
  const [submittingInvoice, setSubmittingInvoice] = useState(false);

  const fetchFees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedStudentId) params.studentId = selectedStudentId;

      const res = await feeAPI.get(params);
      if (res.success) {
        setData(res);
      } else {
        setError(res.message || 'Failed to load fee records');
      }
    } catch (err) {
      console.error('Fees fetch error:', err);
      setError(err.response?.data?.message || 'Error fetching fee records');
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const handleOpenPayment = (fee) => {
    setSelectedFeeForPayment(fee);
    setPayAmount(fee.balanceAmount > 0 ? fee.balanceAmount : '');
    setIsPayModalOpen(true);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0 || !selectedFeeForPayment) return;

    setSubmittingPayment(true);
    try {
      const res = await feeAPI.pay(selectedFeeForPayment._id, {
        amount: Number(payAmount),
        paymentMethod: payMethod,
        notes: payNotes || 'Online student fee payment'
      });

      if (res.success) {
        setIsPayModalOpen(false);
        setSelectedFeeForPayment(null);
        setPayNotes('');
        alert(`Payment successful! Receipt generated: ${res.receiptNo}`);
        fetchFees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!invTotal || !invDueDate) return;

    setSubmittingInvoice(true);
    try {
      const res = await feeAPI.create({
        studentId: selectedStudentId || data?.student?._id,
        feeType: invFeeType,
        totalAmount: Number(invTotal),
        amountPaid: invPaid ? Number(invPaid) : 0,
        dueDate: invDueDate
      });

      if (res.success) {
        setIsInvoiceModalOpen(false);
        setInvTotal('');
        setInvPaid('');
        fetchFees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create fee invoice');
    } finally {
      setSubmittingInvoice(false);
    }
  };

  const student = data?.student;
  const summary = data?.summary || { totalFees: 0, amountPaid: 0, balanceAmount: 0 };
  const fees = data?.fees || [];

  return (
    <div className="portal-page">
      {/* Header */}
      <div className="page-header justify-between">
        <div>
          <h1 className="page-title flex-center gap-2">
            <Icons.CreditCard className="icon-md text-primary" />
            <span>Fees & Finance Portal</span>
          </h1>
          <p className="page-subtitle">
            Review institution fee structure, payment deadlines, cleared installments, and official receipts.
          </p>
        </div>

        <div className="flex-center gap-2">
          {isAuthenticated && user?.role !== 'student' && (
            <button
              type="button"
              className="btn btn-primary btn-sm flex-center gap-1"
              onClick={() => setIsInvoiceModalOpen(true)}
            >
              <Icons.Plus className="icon-xs" />
              <span>Generate Fee Invoice</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline btn-sm flex-center gap-1"
            onClick={fetchFees}
            title="Refresh fee status"
          >
            <Icons.Refresh className="icon-xs" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Student Banner */}
      {student && (
        <div className="student-context-banner">
          <div className="student-context-info">
            <div className="student-context-avatar">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="student-context-name">{student.name}</div>
              <div className="student-context-meta">
                <span>ID: {student.rollNumber}</span> &bull;{' '}
                <span>{student.course}</span> &bull;{' '}
                <span>Semester {student.semester}</span>
              </div>
            </div>
          </div>

          {user?.role !== 'student' && studentsList.length > 0 && (
            <div className="banner-student-switch">
              <span className="text-xs text-muted">Viewing student:</span>
              <select
                className="form-select form-select-sm"
                value={selectedStudentId || student._id}
                onChange={(e) => onSelectStudent && onSelectStudent(e.target.value)}
              >
                {studentsList.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.name} ({st.rollNumber})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading fee ledger and transactions...</p>
        </div>
      ) : error ? (
        <div className="error-banner">
          <Icons.AlertTriangle className="icon-md" />
          <span>{error}</span>
        </div>
      ) : (
        <>
          {/* Summary Financial Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper bg-info-light">
                <Icons.Rupee className="icon-md text-info" />
              </div>
              <div className="stat-data">
                <span className="stat-label">Total Prescribed Fees</span>
                <span className="stat-value">
                  ₹{summary.totalFees.toLocaleString('en-IN')}
                </span>
                <span className="stat-sub">Academic session 2025-2026</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper bg-success-light">
                <Icons.CheckCircle className="icon-md text-success" />
              </div>
              <div className="stat-data">
                <span className="stat-label">Total Amount Paid</span>
                <span className="stat-value text-success">
                  ₹{summary.amountPaid.toLocaleString('en-IN')}
                </span>
                <span className="stat-sub">Cleared transactions</span>
              </div>
            </div>

            <div className="stat-card">
              <div
                className={`stat-icon-wrapper ${
                  summary.balanceAmount > 0 ? 'bg-danger-light' : 'bg-success-light'
                }`}
              >
                <Icons.AlertTriangle
                  className={`icon-md ${
                    summary.balanceAmount > 0 ? 'text-danger' : 'text-success'
                  }`}
                />
              </div>
              <div className="stat-data">
                <span className="stat-label">Outstanding Balance</span>
                <span
                  className={`stat-value ${
                    summary.balanceAmount > 0 ? 'text-danger' : 'text-success'
                  }`}
                >
                  ₹{summary.balanceAmount.toLocaleString('en-IN')}
                </span>
                <span className="stat-sub font-medium">
                  {summary.balanceAmount === 0 ? 'All Dues Cleared' : 'Pending Payment'}
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper bg-primary-light">
                <Icons.CreditCard className="icon-md text-primary" />
              </div>
              <div className="stat-data">
                <span className="stat-label">Ledger Clearance Status</span>
                <span
                  className={`stat-value ${
                    summary.balanceAmount === 0
                      ? 'text-success'
                      : summary.overallStatus === 'Overdue'
                      ? 'text-danger'
                      : 'text-warning'
                  }`}
                >
                  {summary.balanceAmount === 0 ? 'Fully Paid' : summary.overallStatus}
                </span>
                <span className="stat-sub">
                  {summary.totalInvoices} Invoiced heads
                </span>
              </div>
            </div>
          </div>

          {/* Fee Structure Invoices Table */}
          <div className="card mt-6">
            <div className="card-header justify-between">
              <div>
                <h3 className="card-title">Institutional Fee Heads & Invoices</h3>
                <span className="text-xs text-muted">
                  Itemized breakdown of semester tuition, lab amenities, and exam fees
                </span>
              </div>
            </div>

            <div className="card-body p-0">
              {fees.length === 0 ? (
                <div className="empty-state p-6">
                  <Icons.CreditCard className="icon-xl text-muted" />
                  <h4>No Fee Invoices Found</h4>
                  <p>There are no current fee charges on record for this student.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Fee Head</th>
                        <th>Semester</th>
                        <th>Total Amount</th>
                        <th>Amount Paid</th>
                        <th>Balance</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.map((fee) => (
                        <tr key={fee._id}>
                          <td className="font-medium text-main">
                            {fee.feeType}
                          </td>
                          <td>Semester {fee.semester}</td>
                          <td>₹{fee.totalAmount.toLocaleString('en-IN')}</td>
                          <td className="text-success font-medium">
                            ₹{fee.amountPaid.toLocaleString('en-IN')}
                          </td>
                          <td
                            className={`font-medium ${
                              fee.balanceAmount > 0 ? 'text-danger' : 'text-muted'
                            }`}
                          >
                            ₹{fee.balanceAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="text-sm">
                            {new Date(fee.dueDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                fee.paymentStatus === 'Paid'
                                  ? 'badge-success'
                                  : fee.paymentStatus === 'Partial'
                                  ? 'badge-warning'
                                  : 'badge-danger'
                              }`}
                            >
                              {fee.paymentStatus}
                            </span>
                          </td>
                          <td>
                            {fee.balanceAmount > 0 ? (
                              <button
                                type="button"
                                className="btn btn-primary btn-xs flex-center gap-1"
                                onClick={() => handleOpenPayment(fee)}
                              >
                                <span>Pay Now</span>
                              </button>
                            ) : (
                              <span className="text-xs text-success font-medium flex-center gap-1">
                                <Icons.Check className="icon-xs" />
                                <span>Cleared</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Payment Receipts & Transaction History */}
          <div className="card mt-6">
            <div className="card-header">
              <h3 className="card-title">Official Payment Receipts & History</h3>
              <span className="text-xs text-muted">
                Transaction records authenticated with university receipt numbers
              </span>
            </div>
            <div className="card-body p-0">
              {fees.every((f) => !f.paymentHistory || f.paymentHistory.length === 0) ? (
                <div className="empty-state p-6">
                  <p>No payment receipts recorded yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Receipt No</th>
                        <th>Fee Category</th>
                        <th>Payment Date</th>
                        <th>Payment Mode</th>
                        <th>Amount Paid</th>
                        <th>Transaction ID</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.flatMap((f) =>
                        (f.paymentHistory || []).map((p) => (
                          <tr key={p._id || p.receiptNo}>
                            <td className="font-mono text-primary font-medium">
                              {p.receiptNo}
                            </td>
                            <td>{f.feeType}</td>
                            <td>
                              {new Date(p.paymentDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td>
                              <span className="badge badge-info">
                                {p.paymentMethod || 'Online'}
                              </span>
                            </td>
                            <td className="font-medium text-success">
                              ₹{p.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="font-mono text-xs text-muted">
                              {p.transactionId || 'N/A'}
                            </td>
                            <td>
                              <span className="badge badge-success">Verified</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Pay Modal */}
      {isPayModalOpen && selectedFeeForPayment && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title flex-center gap-1">
                <Icons.CreditCard className="icon-sm text-primary" />
                <span>Process Fee Payment</span>
              </h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setIsPayModalOpen(false)}
              >
                <Icons.Close className="icon-sm" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment}>
              <div className="modal-body">
                <div className="payment-summary-box mb-4">
                  <div className="text-sm text-muted">Head of Account:</div>
                  <div className="font-medium text-main">
                    {selectedFeeForPayment.feeType} &bull; Semester {selectedFeeForPayment.semester}
                  </div>
                  <div className="justify-between text-sm mt-2">
                    <span>Remaining Balance:</span>
                    <strong className="text-danger">
                      ₹{selectedFeeForPayment.balanceAmount.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="pay-amt">Payment Amount (₹)</label>
                  <input
                    id="pay-amt"
                    type="number"
                    min="1"
                    max={selectedFeeForPayment.balanceAmount}
                    className="form-input"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    required
                  />
                  <span className="text-xs text-muted">
                    You can pay the full balance or an installment.
                  </span>
                </div>

                <div className="form-group">
                  <label htmlFor="pay-method">Payment Mode</label>
                  <select
                    id="pay-method"
                    className="form-select"
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Net Banking">Internet Banking</option>
                    <option value="Demand Draft">Demand Draft (DD)</option>
                    <option value="Cheque">Bank Cheque</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="pay-notes">Transaction Reference / Remarks</label>
                  <input
                    id="pay-notes"
                    type="text"
                    className="form-input"
                    placeholder="e.g. UTR / Ref Number"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsPayModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingPayment}
                >
                  {submittingPayment ? 'Processing...' : 'Confirm & Generate Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Fee Invoice Modal (Admin) */}
      {isInvoiceModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title flex-center gap-1">
                <Icons.CreditCard className="icon-sm text-primary" />
                <span>Issue Fee Invoice</span>
              </h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setIsInvoiceModalOpen(false)}
              >
                <Icons.Close className="icon-sm" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="inv-type">Fee Category</label>
                  <select
                    id="inv-type"
                    className="form-select"
                    value={invFeeType}
                    onChange={(e) => setInvFeeType(e.target.value)}
                  >
                    <option value="Consolidated Semester Fee">
                      Consolidated Semester Fee
                    </option>
                    <option value="Tuition Fee">Tuition Fee</option>
                    <option value="Academic & Laboratory Fee">
                      Academic & Laboratory Fee
                    </option>
                    <option value="Examination Fee">Examination Fee</option>
                    <option value="Library & Digital Resources Fee">
                      Library & Digital Resources Fee
                    </option>
                    <option value="Development & Amenities Fee">
                      Development & Amenities Fee
                    </option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="inv-total">Total Amount (₹)</label>
                    <input
                      id="inv-total"
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="e.g. 50000"
                      value={invTotal}
                      onChange={(e) => setInvTotal(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inv-paid">Initial Paid Amount (₹)</label>
                    <input
                      id="inv-paid"
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="0"
                      value={invPaid}
                      onChange={(e) => setInvPaid(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="inv-due">Payment Due Date</label>
                  <input
                    id="inv-due"
                    type="date"
                    className="form-input"
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsInvoiceModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingInvoice}
                >
                  {submittingInvoice ? 'Creating...' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
