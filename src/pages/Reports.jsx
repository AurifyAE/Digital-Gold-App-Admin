import React, { useState, useRef } from 'react';
import { 
  Search, 
  Download, 
  FileText, 
  Calendar, 
  Filter, 
  MoreVertical,
  Eye,
  Share,
  ChevronDown
} from 'lucide-react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useDownloadExcel } from 'react-export-table-to-excel';

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const tableRef = useRef(null);

  // Sample reports data
  const reports = [
    {
      id: 1,
      name: "Monthly Sales Report",
      type: "Sales",
      createdDate: "2025-08-15",
      size: "2.4 MB",
      status: "completed",
      description: "Comprehensive sales analysis for July 2025"
    },
    {
      id: 2,
      name: "Customer Analytics Dashboard",
      type: "Analytics",
      createdDate: "2025-08-20",
      size: "1.8 MB",
      status: "completed",
      description: "Customer behavior and engagement metrics"
    },
    {
      id: 3,
      name: "Inventory Status Report",
      type: "Inventory",
      createdDate: "2025-08-25",
      size: "945 KB",
      status: "processing",
      description: "Current inventory levels and stock analysis"
    },
    {
      id: 4,
      name: "Financial Summary Q3",
      type: "Financial",
      createdDate: "2025-08-22",
      size: "3.1 MB",
      status: "completed",
      description: "Quarterly financial performance overview"
    },
    {
      id: 5,
      name: "Employee Performance Review",
      type: "HR",
      createdDate: "2025-08-18",
      size: "1.2 MB",
      status: "completed",
      description: "Team performance metrics and evaluations"
    }
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || report.type.toLowerCase() === selectedFilter.toLowerCase();
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

  const { onDownload } = useDownloadExcel({
    currentTableRef: tableRef.current,
    filename: 'Reports',
    sheet: 'Reports'
  });

  // Export handler
  const handleExport = (format) => {
    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text('Reports', 10, 10);
      autoTable(doc, {
        head: [['Name', 'Type', 'Created', 'Size', 'Status', 'Description']],
        body: reports.map(r => [
          r.name, r.type, r.createdDate, r.size, r.status, r.description
        ])
      });
      doc.save('Reports.pdf');
    } else if (format === 'excel') {
      onDownload();
    } else if (format === 'csv') {
      const csvRows = [
        ['Name', 'Type', 'Created', 'Size', 'Status', 'Description'],
        ...reports.map(r => [
          r.name, r.type, r.createdDate, r.size, r.status, r.description
        ])
      ];
      const csvString = csvRows.map(row =>
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Reports.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    setShowExportMenu(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">Manage and export your business reports</p>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <FileText className="w-4 h-4" />
              <span>Generate New</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      Export as PDF
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      Export as Excel
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      Export as CSV
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
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
          {filteredReports.map((report) => (
            <div key={report.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Report Name & Description */}
                <div className="col-span-4">
                  <h3 className="font-medium text-gray-900 mb-1">{report.name}</h3>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </div>

                {/* Type */}
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {report.type}
                  </span>
                </div>

                {/* Created Date */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(report.createdDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Size */}
                <div className="col-span-1">
                  <span className="text-sm text-gray-600">{report.size}</span>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="flex items-center space-x-1">
                    <button
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Report"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Share"
                    >
                      <Share className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="More Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <div className="px-6 py-12 text-center">
            <FileText className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search or filter criteria.' : 'Create your first report to get started.'}
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === 'completed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-yellow-600">
                {reports.filter(r => r.status === 'processing').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
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
          {reports.map(r => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.type}</td>
              <td>{r.createdDate}</td>
              <td>{r.size}</td>
              <td>{r.status}</td>
              <td>{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;