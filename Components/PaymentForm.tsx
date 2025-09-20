"use client";
import React, { useState, FormEvent, useEffect } from "react";
import {
  insertPaymentRecord,
  getPatients,
  getPaymentTerms,
  testDatabaseConnection,
} from "@/lib/supabase-db";
import { PaymentRecord, Patient, PaymentTerm } from "@/lib/types";

interface FormData {
  patient_id: string;
  full_name: string;
  address: string;
  bank_name: string;
  bank_account_number: string;
  paying_for: string;
  insurance_provider: string;
  insurance_tier_availed: string;
  medication_used: string;
  quantity: string;
  total_price_php: string;
  terms_accepted: string;
}

const PaymentForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    patient_id: "",
    full_name: "",
    address: "",
    bank_name: "",
    bank_account_number: "",
    paying_for: "",
    insurance_provider: "",
    insurance_tier_availed: "",
    medication_used: "",
    quantity: "",
    total_price_php: "",
    terms_accepted: "",
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log("Loading form data...");
      const [patientsData, termsData] = await Promise.all([
        getPatients(),
        getPaymentTerms(),
      ]);
      console.log("Patients loaded:", patientsData.length);
      console.log("Payment terms loaded:", termsData.length);
      setPatients(patientsData);
      setPaymentTerms(termsData);
    } catch (error) {
      console.error("Error loading data:", error);
      setSubmitMessage("Error loading form data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    console.log("Testing database connection...");
    const result = await testDatabaseConnection();
    console.log("Connection test result:", result);
    setSubmitMessage(`Database test: ${JSON.stringify(result, null, 2)}`);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Autofill patient data when patient_id changes
    if (name === "patient_id" && value) {
      const selectedPatient = patients.find((p) => p.patient_id === value);
      if (selectedPatient) {
        setFormData((prev) => ({
          ...prev,
          full_name: selectedPatient.full_name,
          address: selectedPatient.address,
        }));
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      console.log("Submitting payment record...");
      const record: Omit<PaymentRecord, "id" | "created_at" | "updated_at"> = {
        patient_id: formData.patient_id,
        full_name: formData.full_name,
        address: formData.address,
        bank_name: formData.bank_name,
        bank_account_number: parseInt(formData.bank_account_number),
        paying_for: formData.paying_for,
        insurance_provider: formData.insurance_provider,
        insurance_tier_availed: formData.insurance_tier_availed,
        medication_used: formData.medication_used,
        quantity: parseInt(formData.quantity) || 0,
        total_price_php: parseFloat(formData.total_price_php),
        terms_accepted: formData.terms_accepted,
        payment_status: "pending",
      };

      console.log("Record data:", record);
      await insertPaymentRecord(record);
      console.log("Payment record submitted successfully!");
      setSubmitMessage("Payment record submitted successfully!");
      setFormData({
        patient_id: "",
        full_name: "",
        address: "",
        bank_name: "",
        bank_account_number: "",
        paying_for: "",
        insurance_provider: "",
        insurance_tier_availed: "",
        medication_used: "",
        quantity: "",
        total_price_php: "",
        terms_accepted: "",
      });
    } catch (error: any) {
      console.error("Error submitting payment record:", error);
      setSubmitMessage(
        error.message || "Error submitting payment record. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {submitMessage && (
        <div
          className={`p-4 rounded-lg text-center ${
            submitMessage.includes("Error") ||
            submitMessage.includes("Please try again")
              ? "bg-red-100 text-red-700 border border-red-200"
              : "bg-green-100 text-green-700 border border-green-200"
          }`}
        >
          {submitMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Patient Selection
          </h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="patient_id"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Select Patient *
              </label>
              <select
                id="patient_id"
                name="patient_id"
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm"
                value={formData.patient_id}
                onChange={handleInputChange}
              >
                <option value="">Select a patient...</option>
                {patients.map((patient) => (
                  <option key={patient.patient_id} value={patient.patient_id}>
                    {patient.patient_id} - {patient.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Patient Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Patient Information
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Full Name *
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Address *
              </label>
              <textarea
                id="address"
                name="address"
                required
                rows={3}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm resize-vertical"
                placeholder="123 Main St, City, State, ZIP"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Banking Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Banking Information
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="bank_name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Bank Name *
              </label>
              <input
                id="bank_name"
                name="bank_name"
                type="text"
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm"
                placeholder="Bank of America"
                value={formData.bank_name}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="bank_account_number"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Bank Account Number *
              </label>
              <input
                id="bank_account_number"
                name="bank_account_number"
                type="number"
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm"
                placeholder="1234567890"
                value={formData.bank_account_number}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Payment Details Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Payment Details
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="paying_for"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Paying For *
              </label>
              <input
                id="paying_for"
                name="paying_for"
                type="text"
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm"
                placeholder="Medical Consultation"
                value={formData.paying_for}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="total_price_php"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Total Price (PHP) *
              </label>
              <input
                id="total_price_php"
                name="total_price_php"
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm"
                placeholder="1500.00"
                value={formData.total_price_php}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="terms_accepted"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Payment Terms *
              </label>
              <select
                id="terms_accepted"
                name="terms_accepted"
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm"
                value={formData.terms_accepted}
                onChange={handleInputChange}
              >
                <option value="">Select payment terms...</option>
                {paymentTerms.map((term) => (
                  <option key={term.id} value={term.term_name}>
                    {term.term_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Insurance & Medication Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Insurance & Medication (Optional)
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="insurance_provider"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Insurance Provider
              </label>
              <input
                id="insurance_provider"
                name="insurance_provider"
                type="text"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm"
                placeholder="Blue Cross Blue Shield"
                value={formData.insurance_provider}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="insurance_tier_availed"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Insurance Tier Availed
              </label>
              <input
                id="insurance_tier_availed"
                name="insurance_tier_availed"
                type="text"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm"
                placeholder="Gold"
                value={formData.insurance_tier_availed}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="medication_used"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Medication Used
              </label>
              <input
                id="medication_used"
                name="medication_used"
                type="text"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm"
                placeholder="Aspirin 100mg"
                value={formData.medication_used}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Quantity
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm"
                placeholder="30"
                value={formData.quantity}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <div className="flex space-x-4 mb-4">
            <button
              type="button"
              onClick={testConnection}
              className="flex-1 flex justify-center py-2 px-4 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Test Database Connection
            </button>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </div>
            ) : (
              "Submit Payment Record"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
