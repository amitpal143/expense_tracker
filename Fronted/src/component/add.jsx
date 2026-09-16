import React from "react";
import { modalStyles } from "../assets/dummystyle";

const AddTransactionModal = ({
  showModal,
  setShowModal,
  newTransaction,
  setNewTransaction,
  handleAddTransaction,
  title = "Add Transaction",
}) => {
  if (!showModal) {
    return null;
  }

  // Input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setNewTransaction((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newTransaction.description.trim()) {
      alert("Please enter description");
      return;
    }

    if (!newTransaction.amount || Number(newTransaction.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!newTransaction.category) {
      alert("Please select category");
      return;
    }

    await handleAddTransaction();
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modalContainer}>

        {/* Header */}
        <div className={modalStyles.modalHeader}>
          <h3 className={modalStyles.modalTitle}>
            {title}
          </h3>

          <button
            type="button"
            onClick={() => setShowModal(false)}
            className={modalStyles.closeButton}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* Transaction Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>

            <select
              name="type"
              value={newTransaction.type || "expense"}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>

            <input
              type="text"
              name="description"
              value={newTransaction.description || ""}
              onChange={handleChange}
              placeholder="Enter description"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
            />
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>

            <input
              type="number"
              name="amount"
              value={newTransaction.amount || ""}
              onChange={handleChange}
              placeholder="Enter amount"
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>

            <select
              name="category"
              value={newTransaction.category || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
            >
              {newTransaction.type === "income" ? (
                <>
                  <option value="Salary">Salary</option>
                  <option value="Business">Business</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Investment">Investment</option>
                  <option value="Other">Other</option>
                </>
              ) : (
                <>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Bills">Bills</option>
                  <option value="Health">Health</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </>
              )}
            </select>
          </div>

          {/* Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>

            <input
              type="date"
              name="date"
              value={newTransaction.date || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Add Transaction
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;