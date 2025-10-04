import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Download,
  FileText,
  Calendar,
  Filter,
  MoreVertical,
  Eye,
  Share,
  ChevronDown,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useDownloadExcel } from 'react-export-table-to-excel';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const tableRef = useRef(null);
  const exportButtonRef = useRef(null);

  // Sample reports data (simulating API response)
  const sampleReports = [
    {
      id: 1,
      name: 'Monthly Sales Report',
      type: 'Sales',
      createdDate: '2025-08-15',
      size: '2.4 MB',
      status: 'completed',
      description: 'Comprehensive sales analysis for July 2025',
    },
    {
      id: 2,
      name: 'Customer Analytics Dashboard',
      type: 'Analytics',
      createdDate: '2025-08-20',
      size: '1.8 MB',
      status: 'completed',
      description: 'Customer behavior and engagement metrics',
    },
    {
      id: 3,
      name: 'Inventory Status Report',
      type: 'Inventory',
      createdDate: '2025-08-25',
      size: '945 KB',
      status: 'processing',
      description: 'Current inventory levels and stock analysis',
    },
    {
      id: 4,
      name: 'Financial Summary Q3',
      type: 'Financial',
      createdDate: '2025-08-22',
      size: '3.1 MB',
      status: 'completed',
      description: 'Quarterly financial performance overview',
    },
    {
      id: 5,
      name: 'Employee Performance Review',
      type: 'HR',
      createdDate: '2025-08-18',
      size: '1.2 MB',
      status: 'completed',
      description: 'Team performance metrics and evaluations',
    },
  ];

  // Simulate async data fetching
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        // Simulate API call
        // const response = await fetchReports();
        // if (response.success) {
        //   setReports(response.data || []);
        // } else {
        //   showNotification(response.message || 'Error fetching reports', 'error');
        // }
        setReports(sampleReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
        showNotification('Network error. Please check your connection and try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportButtonRef.current && !exportButtonRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      (report.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.type || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || (report.type || '').toLowerCase() === selectedFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const { onDownload } = useDownloadExcel({
    currentTableRef: tableRef.current,
    filename: 'Reports',
    sheet: 'Reports',
  });

  // Export handler
  const handleExport = async (format) => {
    try {
      if (format === 'pdf') {
        const doc = new jsPDF();
        doc.text('Reports', 10, 10);
        autoTable(doc, {
          head: [['Name', 'Type', 'Created', 'Size', 'Status', 'Description']],
          body: reports.map((r) => [
            r.name || 'N/A',
            r.type || 'N/A',
            r.createdDate || 'N/A',
            r.size || 'N/A',
            r.status || 'N/A',
            r.description || 'N/A',
          ]),
        });
        doc.save('Reports.pdf');
        showNotification('PDF exported successfully');
      } else if (format === 'excel') {
        onDownload();
        showNotification('Excel exported successfully');
      } else if (format === 'csv') {
        const csvRows = [
          ['Name', 'Type', 'Created', 'Size', 'Status', 'Description'],
          ...reports.map((r) => [
            r.name || 'N/A',
            r.type || 'N/A',
            r.createdDate || 'N/A',
            r.size || 'N/A',
            r.status || 'N/A',
            r.description || 'N/A',
          ]),
        ];
        const csvString = csvRows
          .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
          .join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Reports.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('CSV exported successfully');
      }
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      showNotification(`Failed to export as ${format.toUpperCase()}`, 'error');
    }
    setShowExportMenu(false);
  };

  // Skeleton Loader Component
  const SkeletonReportRow = () => (
    <div className="px-6 py-4 border-b border-gray-200 animate-pulse">
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="col-span-2">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="col-span-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="col-span-1">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="col-span-2">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="col-span-1">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white text-xs font-medium flex items-center space-x-2`}
          >
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="text-xs text-gray-500 mt-1">Manage and export your business reports</p>
      </div>

      {/* Controls Bar */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 flex-1">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-9 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-300 text-xs"
                aria-label="Search reports"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                aria-label="Filter reports by type"
              >
                <option value="all">All Types</option>
                <option value="sales">Sales</option>
                <option value="analytics">Analytics</option>
                <option value="inventory">Inventory</option>
                <option value="financial">Financial</option>
                <option value="hr">HR</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Export Options */}
          <div className="flex space-x-3">
            <button
              className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
              aria-label="Generate new report"
            >
              <FileText className="w-4 h-4" />
              <span>Generate New</span>
            </button>

            <div className="relative" ref={exportButtonRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                aria-label="Export reports"
                aria-expanded={showExportMenu}
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
                <ChevronDown className="w-4 h-4" />
              </motion.button>

              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => handleExport('pdf')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-xs"
                        aria-label="Export reports as PDF"
                      >
                        Export as PDF
                      </button>
                      <button
                        onClick={() => handleExport('excel')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-xs"
                        aria-label="Export reports as Excel"
                      >
                        Export as Excel
                      </button>
                      <button
                        onClick={() => handleExport('csv')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-xs"
                        aria-label="Export reports as CSV"
                      >
                        Export as CSV
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-700">
            <div className="col-span-4">Report Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-1">Size</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>

        {/* Reports List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            [...Array(5)].map((_, index) => <SkeletonReportRow key={index} />)
          ) : filteredReports.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <FileText className="mx-auto w-12 h-12 text-gray-400 mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">No reports found</h3>
              <p className="text-xs text-gray-500">
                {searchTerm || selectedFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first report to get started.'}
              </p>
              {(searchTerm || selectedFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedFilter('all');
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-xs"
                  aria-label="Clear search and filters"
                >
                  Clear Search and Filters
                </button>
              )}
            </div>
          ) : (
            filteredReports.map((report) => (
              <motion.div
                key={report.id}
                className="px-4 py-3 hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Report Name & Description */}
                  <div className="col-span-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">{report.name || 'N/A'}</h3>
                    <p className="text-xs text-gray-500">{report.description || 'No description'}</p>
                  </div>

                  {/* Type */}
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {report.type || 'N/A'}
                    </span>
                  </div>

                  {/* Created Date */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {report.createdDate
                          ? new Date(report.createdDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Size */}
                  <div className="col-span-1">
                    <span className="text-xs text-gray-600">{report.size || 'N/A'}</span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {report.status || 'N/A'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1">
                    <div className="flex items-center space-x-1">
                      <button
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Report"
                        aria-label="View report"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Download Report"
                        aria-label="Download report"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Share Report"
                        aria-label="Share report"
                      >
                        <Share className="w-3 h-3" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="More Options"
                        aria-label="More report options"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          className="bg-white rounded-lg border border-gray-200 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Reports</p>
              <p className="text-lg font-bold text-gray-900">{reports.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg border border-gray-200 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Completed</p>
              <p className="text-lg font-bold text-green-600">
                {reports.filter((r) => r.status === 'completed').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg border border-gray-200 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Processing</p>
              <p className="text-lg font-bold text-yellow-600">
                {reports.filter((r) => r.status === 'processing').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hidden table for Excel export */}
      <table ref={tableRef} style={{ display: 'none' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Created</th>
            <th>Size</th>
            <th>Status</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id}>
              <td>{r.name || 'N/A'}</td>
              <td>{r.type || 'N/A'}</td>
              <td>{r.createdDate || 'N/A'}</td>
              <td>{r.size || 'N/A'}</td>
              <td>{r.status || 'N/A'}</td>
              <td>{r.description || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;