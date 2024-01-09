import { useState, useEffect } from "react";
import Debts from "../Debts";
import Month from "../Month";
import DebtSummary from "../DebtSummary";

const DebtCalculator = ({ disposableIncome }) => {
  const [debts, setDebts] = useState([]);
  const [title, setTitle] = useState("");
  const [totalDebts, setTotalDebts] = useState(0);
  const [monthsUntilPayoff, setMonthsUntilPayoff] = useState(0);
  const [payoffMethod, setPayoffMethod] = useState("");

  const handleMethodChange = (e) => {
    setPayoffMethod(e.target.value);
    localStorage.setItem("payoffMethod", JSON.stringify(e.target.value));
  };

  const loadPayoffMethod = () => {
    const saved = localStorage.getItem("payoffMethod");
    if (saved) {
      setPayoffMethod(JSON.parse(saved));
    }
  };

  const sortedDebts =
    payoffMethod === "snowball"
      ? debts.sort((a, b) => a.balance - b.balance)
      : debts.sort((a, b) => b.interestRate - a.interestRate);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    loadSavedDebts();
    loadSavedTotalDebts();
    loadPayoffMethod();
    loadLastMonthNumber();
    loadMonthsUntilPayoff();
  }, []);

  // DEBT HEADER
  const onChangeTitle = (event) => {
    setTitle(event.target.value);
  };

  const submitDebt = (debtTitle, event) => {
    event.preventDefault();
    if (debtTitle !== "") {
      setAndSaveDebts([
        ...debts,
        {
          id: crypto.randomUUID(),
          title: debtTitle,
          balance: 0,
          interestRate: 0,
        },
      ]);
    }
    setTitle("");
  };

  // DEBT CONTAINER
  const setAndSaveDebts = (newDebts) => {
    setDebts(newDebts);
    localStorage.setItem("debts", JSON.stringify(newDebts));
  };

  const loadSavedDebts = () => {
    const saved = localStorage.getItem("debts");
    if (saved) {
      setDebts(JSON.parse(saved));
    }
  };

  const loadSavedTotalDebts = () => {
    const saved = localStorage.getItem("totalDebts");
    if (saved) {
      setTotalDebts(JSON.parse(saved));
    }
  };

  const setAndSaveTotalDebts = (newDebts) => {
    const newDebtTotal = newDebts
      .map((debt) => debt.balance)
      .reduce((a, c) => +a + +c);
    setTotalDebts(newDebtTotal);
    localStorage.setItem("totalDebt", JSON.stringify(newDebtTotal));
  };

  const setAndSaveMonthsUntilPayoff = (totalDebts, disposableIncome) => {
    const newMonths = (totalDebts / disposableIncome).toFixed(2);
    setMonthsUntilPayoff(newMonths);
    localStorage.setItem("monthsUntilPayoff", JSON.stringify(newMonths));
  };

  const loadMonthsUntilPayoff = () => {
    const saved = localStorage.getItem("monthsUntilPayoff");
    if (saved) {
      setMonthsUntilPayoff(JSON.parse(saved));
    }
  };

  // INDIVIDUAL DEBTS
  const deleteDebt = (debtId) => {
    const newDebts = debts.filter((debt) => debt.id !== debtId);
    setAndSaveDebts(newDebts);
  };

  const updateDebt = (
    debtId,
    balance,
    interestRate,
    event,
    monthsUntilPayoff
  ) => {
    event.preventDefault();
    const newDebts = debts.map((debt) => {
      if (debtId === debt.id) {
        return {
          ...debt,
          balance: balance,
          interestRate: interestRate,
          monthsUntilPayoff: monthsUntilPayoff,
        };
      }
      return debt;
    });
    setAndSaveDebts(newDebts);
    setAndSaveTotalDebts(newDebts);
    setAndSaveLastMonthNumber(
      Math.floor(
        newDebts.reduce((a, c) => +a.monthsUntilPayoff + +c.monthsUntilPayoff)
      )
    );
  };

  // MONTH CONTAINER
  const [lastMonthNumber, setLastMonthNumber] = useState(
    Math.floor(monthsUntilPayoff)
  );

  const setAndSaveLastMonthNumber = (newMonth) => {
    setLastMonthNumber(newMonth);
    localStorage.setItem("lastMonthNumber", JSON.stringify(newMonth));
  };

  const loadLastMonthNumber = () => {
    const saved = localStorage.getItem("lastMonthNumber");
    if (saved) {
      setLastMonthNumber(JSON.parse(saved));
    }
  };

  const drawMonths = (months) => {
    return months.map((month, i) => (
      <Month
        key={crypto.randomUUID()}
        month={month}
        monthNumber={i + 1}
        lastMonthNumber={lastMonthNumber}
        monthsUntilPayoff={monthsUntilPayoff}
      />
    ));
  };

  return (
    <div className="nes-container is-dark with-title debts-container">
      <p className="title">Debt Calculator</p>

      <header className="nes-container is-rounded is-dark header">
        <form
          onSubmit={(event) => submitDebt(title, event)}
          className="header-form"
        >
          <input
            className="nes-input header-input"
            type="text"
            placeholder="Add debt.."
            value={title}
            onChange={onChangeTitle}
          />
          <button
            onClick={(event) => submitDebt(title, event)}
            type="button"
            className="nes-btn is-success"
          >
            Add
          </button>
        </form>
      </header>
      <div className="debts-header">
        <p className="debt-title">Debt</p>
        <div className="debt-form">
          <span>Balance</span>
          <span>Interest</span>
        </div>
        <button
          onClick={(event) => event.preventDefault()}
          className="nes-btn is-error invisible"
          readOnly
          tabIndex="-1"
        >
          DELETE
        </button>
      </div>
      <Debts
        deleteDebt={deleteDebt}
        updateDebt={updateDebt}
        disposableIncome={disposableIncome}
        debts={debts}
      />
      <div className="months-container">{drawMonths(months)}</div>
      <DebtSummary
        disposableIncome={disposableIncome}
        totalDebts={totalDebts}
        setAndSaveMonthsUntilPayoff={setAndSaveMonthsUntilPayoff}
        monthsUntilPayoff={monthsUntilPayoff}
        sortedDebts={sortedDebts}
        handleMethodChange={handleMethodChange}
        payoffMethod={payoffMethod}
      />
    </div>
  );
};

export default DebtCalculator;
