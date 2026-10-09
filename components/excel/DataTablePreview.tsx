'use client';

import React, { useState, useMemo } from 'react';
import { ColumnMapping } from '../../lib/excelParser';
import {
  Search,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  CheckCircle2,
  Filter,
  Sparkles,
} from 'lucide-react';

interface DataTablePreviewProps {
  headers: string[];
  rows: Record<string, any>[];
  mapping: ColumnMapping;
  fileName?: string;
  selectedRow?: Record<string, any> | null;
  onSelectRow: (row: Record<string, any>) => void;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTablePreview({
  headers,
  rows,
  mapping,
  fileName,
  selectedRow,
  onSelectRow,
}: DataTablePreviewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [caseTypeFilter, setCaseTypeFilter] = useState('ALL');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Determine available case types from rows if case_type is mapped
  const caseTypes = useMemo(() => {
    if (!mapping.case_type) return [];
    const set = new Set<string>();
    rows.forEach((r) => {
      const val = r[mapping.case_type];
      if (val && String(val).trim()) {
        set.add(String(val).trim());
      }
    });
    return Array.from(set);
  }, [rows, mapping.case_type]);

  // Handle Sort column click
  const handleSort = (header: string) => {
    if (sortField === header) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(header);
      setSortDirection('asc');
    }
    setPage(1);
  };

  // 1. Filter rows
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      // Case type filter
      if (caseTypeFilter !== 'ALL' && mapping.case_type) {
        const val = String(r[mapping.case_type] || '').trim();
        if (val !== caseTypeFilter) return false;
      }

      // Search term filter across all fields
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return Object.values(r).some((v) =>
        String(v ?? '').toLowerCase().includes(term)
      );
    });
  }, [rows, mapping.case_type, caseTypeFilter, searchTerm]);

  // 2. Sort rows
  const sortedRows = useMemo(() => {
    if (!sortField || !sortDirection) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const aVal = a[sortField] ?? '';
      const bVal = b[sortField] ?? '';

      // Try numeric comparison if both are numbers
      const numA = Number(aVal);
      const numB = Number(bVal);
      if (!isNaN(numA) && !isNaN(numB) && aVal !== '' && bVal !== '') {
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      // Thai string locale comparison
      const cmp = String(aVal).localeCompare(String(bVal), 'th');
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [filteredRows, sortField, sortDirection]);

  // 3. Paginate
  const totalRows = sortedRows.length;
  const totalPages = Math.ceil(totalRows / pageSize) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRows);
  const currentRows = sortedRows.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden flex flex-col space-y-0">
      {/* Table Toolbar & Filters */}
      <div className="p-5 bg-gradient-to-r from-purple-50/60 via-slate-50 to-indigo-50/40 border-b border-purple-100/80 flex flex-col gap-4">
        {/* Top Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">
                  {fileName ? `ไฟล์: ${fileName}` : 'ตารางข้อมูลคดีความ'}
                </span>
                <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full">
                  ทั้งหมด {rows.length} คดี
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                เลือกคดีที่ต้องการเพื่อนำข้อมูลไปตรวจสอบและสร้างเอกสารศาล
              </p>
            </div>
          </div>

          {/* Quick instructions badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-purple-200 text-purple-700 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>คลิกปุ่ม &quot;เลือกข้อมูลคดีนี้&quot; ที่แถวเพื่อเริ่มทำงาน</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="ค้นหาเลขคดีดำ, คดีแดง, ชื่อโจทก์, จำเลย, นัดมาทำไม..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none shadow-2xs"
            />
          </div>

          {/* Case Type Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {caseTypes.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-purple-600" />
                  <span>ประเภทคดี:</span>
                </span>
                <select
                  value={caseTypeFilter}
                  onChange={(e) => {
                    setCaseTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-2xs"
                >
                  <option value="ALL">ทั้งหมด ({rows.length})</option>
                  {caseTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span>แสดง:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-2xs"
              >
                <option value={10}>10 รายการ</option>
                <option value={25}>25 รายการ</option>
                <option value={50}>50 รายการ</option>
                <option value={100}>100 รายการ</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Data Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider select-none">
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th className="py-3 px-4 w-36 text-center sticky left-0 bg-slate-100 z-10">การกระทำ</th>
              {headers.map((h) => {
                const isMapped = Object.values(mapping).includes(h);
                const isSorted = sortField === h;

                return (
                  <th
                    key={h}
                    onClick={() => handleSort(h)}
                    className={`py-3 px-4 whitespace-nowrap cursor-pointer transition-colors hover:bg-purple-100/70 ${
                      isMapped ? 'bg-purple-50 text-purple-950 font-extrabold' : ''
                    } ${isSorted ? 'bg-purple-100 text-purple-900 border-b-2 border-purple-700' : ''}`}
                    title="คลิกเพื่อเรียงลำดับคอลัมน์นี้"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{h}</span>
                      {isSorted ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-purple-700" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-purple-700" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 hover:opacity-100" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 2} className="py-12 text-center text-slate-400">
                  <div className="space-y-2">
                    <Search className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-semibold">ไม่พบข้อมูลคดีที่ตรงกับคำค้นหาหรือตัวกรอง</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setCaseTypeFilter('ALL');
                      }}
                      className="text-xs text-purple-700 font-bold hover:underline"
                    >
                      ล้างตัวกรองทั้งหมด
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              currentRows.map((row, idx) => {
                const rowIndex = startIndex + idx + 1;
                const isSelected = selectedRow && selectedRow === row;

                return (
                  <tr
                    key={rowIndex}
                    className={`transition-colors hover:bg-purple-50/60 ${
                      isSelected ? 'bg-purple-100/70 font-semibold' : idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                    }`}
                  >
                    <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {rowIndex}
                    </td>
                    <td className="py-3 px-4 text-center sticky left-0 bg-inherit z-10">
                      <button
                        type="button"
                        onClick={() => onSelectRow(row)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          isSelected
                            ? 'bg-purple-900 text-white'
                            : 'bg-purple-700 hover:bg-purple-800 text-white hover:scale-105'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>เลือกข้อมูลคดีนี้</span>
                      </button>
                    </td>
                    {headers.map((h) => {
                      const val = row[h];
                      const isMapped = Object.values(mapping).includes(h);

                      return (
                        <td
                          key={h}
                          className={`py-3 px-4 whitespace-nowrap text-slate-700 font-sans ${
                            isMapped ? 'text-slate-900 font-medium' : ''
                          }`}
                        >
                          {val !== undefined && val !== null ? String(val) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          {totalRows > 0 ? (
            <span>
              แสดงรายการที่ <strong className="text-slate-900">{startIndex + 1}</strong> ถึง{' '}
              <strong className="text-slate-900">{endIndex}</strong> จากทั้งหมด{' '}
              <strong className="text-purple-700">{totalRows}</strong> รายการ
            </span>
          ) : (
            <span>0 รายการ</span>
          )}
        </div>

        {/* Page Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage(1)}
            disabled={safePage <= 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-purple-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="หน้าแรก"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-purple-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="หน้าก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-bold text-purple-900 bg-purple-100 rounded-lg">
            หน้า {safePage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-purple-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="หน้าถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPage(totalPages)}
            disabled={safePage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-purple-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="หน้าสุดท้าย"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
