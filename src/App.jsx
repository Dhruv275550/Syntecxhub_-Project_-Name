import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Food",
    customCategory: "",
  });
  const [expenses, setExpenses] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const titleInputRef = useRef(null);
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const savedExpenses = localStorage.getItem("expenses");

        if (savedExpenses) {
          setExpenses(JSON.parse(savedExpenses));
        } else {
          const response = await fetch("/expenses.json");
          const data = await response.json();

          setExpenses(data);
          localStorage.setItem("expenses", JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("expenses", JSON.stringify(expenses));
    }
  }, [expenses, loading]);
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const addExpense = useCallback(
    (e) => {
      e.preventDefault();
      if (!formData.title.trim() || !formData.amount) {
        alert("Please fill all required fields");
        return;
      }
      if (
        formData.category === "Other" &&
        !formData.customCategory.trim()
      ) {
        alert("Please enter a custom category");
        return;
      }

      const newExpense = {
        id: Date.now(),
        title: formData.title,
        amount: Number(formData.amount),
        category:
          formData.category === "Other"
            ? formData.customCategory
            : formData.category,

        date: new Date().toLocaleDateString(),
      };

      setExpenses((prev) => [newExpense, ...prev]);
      setFormData({
        title: "",
        amount: "",
        category: "Food",
        customCategory: "",
      });
      titleInputRef.current.focus();
    },
    [formData]
  );
  const deleteExpense = useCallback((id) => {
    setExpenses((prev) =>
      prev.filter((expense) => expense.id !== id)
    );
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) =>
      expense.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [expenses, search]);
  const totalExpense = useMemo(() => {
    return expenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );
  }, [expenses]);

  return (
    <div className="app">
      <header className="header">
        <h1>Expense Tracker</h1>
        <p>Manage your daily expenses easily</p>
      </header>

      <main className="container">
        {/* Summary */}
        <section className="summary-card">
          <div>
            <p>Total Expenses</p>
            <h2>₹{totalExpense.toLocaleString()}</h2>
          </div>

          <div className="summary-icon">₹</div>
        </section>

        {/* Add Expense Form */}
        <section className="card">
          <h2>Add New Expense</h2>

          <form onSubmit={addExpense} className="expense-form">
            {/* Expense Title */}
            <div className="form-group">
              <label>Expense Title</label>

              <input
                ref={titleInputRef}
                type="text"
                name="title"
                placeholder="e.g. Groceries"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Amount */}
            <div className="form-group">
              <label>Amount</label>

              <input
                type="number"
                name="amount"
                placeholder="e.g. 500"
                value={formData.amount}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Category</label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option>Food</option>
                <option>Travel</option>
                <option>Shopping</option>
                <option>Bills</option>
                <option>Other</option>
              </select>

              {/* Show custom category input */}
              {formData.category === "Other" && (
                <input
                  type="text"
                  name="customCategory"
                  placeholder="Enter new category"
                  value={formData.customCategory}
                  onChange={handleChange}
                  required
                />
              )}
            </div>

            <button type="submit" className="add-btn">
              + Add Expense
            </button>
          </form>
        </section>

        {/* Expense List */}
        <section className="card">
          <div className="list-header">
            <h2>All Expenses</h2>

            <input
              type="text"
              className="search-input"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="message">Loading expenses...</p>
          ) : filteredExpenses.length === 0 ? (
            <p className="message">No expenses found.</p>
          ) : (
            <div className="expense-list">
              {filteredExpenses.map((expense) => (
                <div className="expense-item" key={expense.id}>
                  <div className="expense-info">
                    <div className="expense-category">
                      {expense.category.charAt(0)}
                    </div>

                    <div>
                      <h3>{expense.title}</h3>
                      <p>
                        {expense.category} • {expense.date}
                      </p>
                    </div>
                  </div>

                  <div className="expense-right">
                    <strong>
                      ₹{expense.amount.toLocaleString()}
                    </strong>

                    <button
                      className="delete-btn"
                      onClick={() => deleteExpense(expense.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;