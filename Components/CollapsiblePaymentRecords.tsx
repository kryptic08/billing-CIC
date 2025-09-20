"use client";

import React, { useState } from "react";
import { PaymentRecord } from "@/lib/types";

interface CollapsiblePaymentRecordsProps {
  paymentRecords: PaymentRecord[];
}

export default function CollapsiblePaymentRecords({
  paymentRecords,
}: CollapsiblePaymentRecordsProps) {
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(
    new Set()
  );
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleRecord = (recordId: string) => {
    const newExpanded = new Set(expandedRecords);
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId);
    } else {
      newExpanded.add(recordId);
    }
    setExpandedRecords(newExpanded);
  };

  const toggleAllRecords = () => {
    if (expandedRecords.size > 0) {
      setExpandedRecords(new Set());
    } else {
      setExpandedRecords(
        new Set(paymentRecords.map((record) => record.patient_id))
      );
    }
  };

  const toggleSection = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Recent Payment Records
        </h2>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {paymentRecords.length} records
          </span>
          <button
            onClick={toggleSection}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isCollapsed ? (
              <>
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                Expand
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
                Collapse
              </>
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Control Buttons */}
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={toggleAllRecords}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {expandedRecords.size > 0 ? "Collapse All" : "Expand All"}
            </button>
          </div>

          <div className="space-y-4 max-h-[800px] overflow-y-auto">
            {paymentRecords.length > 0 ? (
              paymentRecords.map((record) => {
                const isExpanded = expandedRecords.has(record.patient_id);

                return (
                  <div
                    key={record.patient_id}
                    className="bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    {/* Collapsible Header */}
                    <button
                      onClick={() => toggleRecord(record.patient_id)}
                      className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {record.patient_id.slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-lg font-medium text-gray-900 truncate">
                                {record.full_name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {record.paying_for}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(
                                  record.created_at || ""
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              ₱{record.total_price_php.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {record.terms_accepted}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <svg
                              className={`w-6 h-6 text-gray-400 transform transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Collapsible Content */}
                    {isExpanded && (
                      <div className="px-6 pb-6 border-t border-gray-200">
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Left Column - Patient & Service Info */}
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                Patient ID
                              </p>
                              <p className="text-base font-semibold text-gray-900">
                                {record.patient_id}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                Service
                              </p>
                              <p className="text-base text-gray-900">
                                {record.paying_for}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                Address
                              </p>
                              <p className="text-base text-gray-900">
                                {record.address}
                              </p>
                            </div>
                          </div>

                          {/* Right Column - Banking & Additional Info */}
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                Bank Details
                              </p>
                              <p className="text-base text-gray-900">
                                {record.bank_name}
                              </p>
                              <p className="text-sm text-gray-600 font-mono">
                                ****
                                {record.bank_account_number
                                  .toString()
                                  .slice(-4)}
                              </p>
                            </div>

                            {/* Medication & Quantity */}
                            {(record.medication_used ||
                              record.quantity > 0) && (
                              <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                  Medication
                                </p>
                                <p className="text-base text-gray-900">
                                  {record.medication_used || "N/A"}
                                </p>
                                {record.quantity > 0 && (
                                  <p className="text-sm text-gray-600">
                                    Quantity: {record.quantity}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Insurance Information - Full Width */}
                        {(record.insurance_provider ||
                          record.insurance_tier_availed) && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {record.insurance_provider && (
                                <div>
                                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                    Insurance:{" "}
                                  </span>
                                  <span className="text-base text-gray-900">
                                    {record.insurance_provider}
                                  </span>
                                </div>
                              )}
                              {record.insurance_tier_availed && (
                                <div>
                                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                    Tier:{" "}
                                  </span>
                                  <span className="text-base text-gray-900">
                                    {record.insurance_tier_availed}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Payment Status */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                              Payment Status
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                record.payment_status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : record.payment_status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {record.payment_status || "pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  No payment records found
                </h3>
                <p className="text-gray-500 text-lg">
                  Add your first payment record using the form on the left.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
