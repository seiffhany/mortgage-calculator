import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { set } from "mongoose";

function App() {
  const radios = ["Repayment", "Interest Only"];
  const [selectedRadio, setSelectedRadio] = useState<string>();
  const [mortgageAmount, setMortgageAmount] = useState<number | "">("");
  const [mortgageTerm, setMortgageTerm] = useState<number | "">("");
  const [interestRate, setInterestRate] = useState<number | "">("");
  const [errors, setErrors] = useState({
    mortgageAmount: "",
    mortgageTerm: "",
    interestRate: "",
    mortgageType: "",
  });

  const [calculation, setCalculation] = useState({
    monthlyPayment: -1,
    totalPaid: -1,
  });

  const [hasError, setHasError] = useState(false);

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number | "">>
  ) => {
    const value = e.target.value.replace(/,/g, ""); // Remove commas before parsing
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setter(value === "" ? "" : Number(value));
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validateInputs = () => {
    let isValid = true;
    const newErrors: any = {};

    if (mortgageAmount === "" || isNaN(mortgageAmount)) {
      newErrors.mortgageAmount = "This field is required";
      setHasError(true);
      isValid = false;
    }

    if (mortgageTerm === "" || isNaN(mortgageTerm)) {
      newErrors.mortgageTerm = "This field is required";
      setHasError(true);
      isValid = false;
    }

    if (interestRate === "" || isNaN(interestRate)) {
      newErrors.interestRate = "This field is required";
      setHasError(true);
      isValid = false;
    }

    if (!selectedRadio) {
      newErrors.mortgageType = "This field is required";
      setHasError(true);
      isValid = false;
    }

    if (isValid) setHasError(false);
    setErrors(newErrors);
    return isValid;
  };

  const handleCalculateClick = () => {
    if (validateInputs()) {
      const mortgageAmountNumber = Number(mortgageAmount);
      const mortgageTermNumber = Number(mortgageTerm);
      const interestRateNumber = Number(interestRate);

      if (selectedRadio === "Repayment") {
        const { monthlyPayment, totalPaid } = calculateRepaymentMortgage(
          mortgageAmountNumber,
          interestRateNumber,
          mortgageTermNumber
        );
        setCalculation({ monthlyPayment, totalPaid });
        console.log({ monthlyPayment, totalPaid });
      } else {
        const { monthlyPayment, totalPaid } = calculateInterestOnlyMortgage(
          mortgageAmountNumber,
          interestRateNumber,
          mortgageTermNumber
        );
        setCalculation({ monthlyPayment, totalPaid });
        console.log({ monthlyPayment, totalPaid });
      }
    }
  };

  function calculateRepaymentMortgage(
    mortgageAmount: number,
    annualInterestRate: number,
    mortgageTermYears: number
  ): { monthlyPayment: number; totalPaid: number } {
    const r = annualInterestRate / 12 / 100; // Monthly interest rate
    const n = mortgageTermYears * 12; // Total number of payments
    const monthlyPayment =
      (mortgageAmount * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    const totalPaid = monthlyPayment * n;

    return { monthlyPayment, totalPaid };
  }

  function calculateInterestOnlyMortgage(
    mortgageAmount: number,
    annualInterestRate: number,
    mortgageTermYears: number
  ): { monthlyPayment: number; totalPaid: number } {
    const r = annualInterestRate / 12 / 100; // Monthly interest rate
    const n = mortgageTermYears * 12; // Total number of payments
    const monthlyPayment = mortgageAmount * r;
    const totalPaid = monthlyPayment * n;

    return { monthlyPayment, totalPaid };
  }

  useEffect(() => {
    if (selectedRadio) {
      setErrors((prev) => ({ ...prev, mortgageType: "" }));
    }
  }, [selectedRadio]);

  return (
    <div className="main-wrapper">
      <div className={`container ${hasError && "has-error"}`}>
        <div className="fields">
          <div className="header">
            <h1 className="fields-header">Mortgage Calculator</h1>
            <p
              onClick={() => {
                setMortgageAmount("");
                setMortgageTerm("");
                setInterestRate("");
                setErrors({
                  mortgageAmount: "",
                  mortgageTerm: "",
                  interestRate: "",
                  mortgageType: "",
                });
                setSelectedRadio(undefined);
                setHasError(false);
              }}
            >
              Clear All
            </p>
          </div>
          <div className="field-section">
            <div className="top-section">
              <div className="field">
                <label>Mortgage Amount</label>
                <div className="input">
                  <input
                    name="mortgageAmount"
                    className={`input-right ${
                      errors.mortgageAmount && "error-input"
                    }`}
                    type="text"
                    value={
                      mortgageAmount === ""
                        ? ""
                        : mortgageAmount.toLocaleString()
                    }
                    onChange={(e) => handleNumberChange(e, setMortgageAmount)}
                  />
                  <p className="symbol">£</p>
                </div>
                <p
                  className={`error-message ${errors.mortgageAmount && "show"}`}
                >
                  {errors.mortgageAmount}
                </p>
              </div>
            </div>

            <div className="mid-fields">
              <div className="field">
                <label>Mortgage Term</label>
                <div className="input">
                  <input
                    name="mortgageTerm"
                    className={`input-left ${
                      errors.mortgageTerm && "error-input"
                    }`}
                    type="number"
                    value={mortgageTerm}
                    onChange={(e) => handleNumberChange(e, setMortgageTerm)}
                  />
                  <p className="symbol-mid">years</p>
                </div>
                <p className={`error-message ${errors.mortgageTerm && "show"}`}>
                  {errors.mortgageTerm}
                </p>
              </div>
              <div className="field">
                <label>Interest Rate</label>
                <div className="input">
                  <input
                    name="interestRate"
                    className={`input-left ${
                      errors.interestRate && "error-input"
                    }`}
                    type="number"
                    value={interestRate}
                    onChange={(e) => handleNumberChange(e, setInterestRate)}
                  />
                  <p className="symbol-mid">%</p>
                </div>
                <p className={`error-message ${errors.interestRate && "show"}`}>
                  {errors.interestRate}
                </p>
              </div>
            </div>

            <div className="radio-buttons">
              <div className="field">
                <label>Mortgage Type</label>
                {radios.map((radio) => {
                  const isActive = selectedRadio === radio;
                  return (
                    <div
                      key={radio}
                      className={`radio-field radio-${isActive && "active"}`}
                      onClick={() => setSelectedRadio(radio)}
                    >
                      <div className="radio-large">
                        {isActive && <div className="radio-small" />}
                      </div>
                      <p>{radio}</p>
                    </div>
                  );
                })}
                <p className={`error-message ${errors.mortgageType && "show"}`}>
                  {errors.mortgageType}
                </p>
              </div>
            </div>
          </div>
          <button className="calculate" onClick={handleCalculateClick}>
            <img src="assets/images/icon-calculator.svg" alt="" />
            <p>Calculate Repayments</p>
          </button>
        </div>
        <div className="preview">
          {calculation.monthlyPayment === -1 ? (
            <div className="waiting">
              <img src="assets/images/illustration-empty.svg" alt="" />
              <div className="waiting-msg">
                <h2>Results shown here</h2>
                <p>
                  Complete the form and click "calculate payments" to see what
                  your monthly repayments would be
                </p>
              </div>
            </div>
          ) : (
            <div className="results">
              <h2>Your results</h2>
              <p className="description">
                Your results are shown below on the information you provided. To
                adjust the results, edit the form and click "calculate
                repayments" again.
              </p>
              <div className="results-main">
                <div className="results-preview-1">
                  <div className="results-1">
                    <p>Your monthly repayments</p>
                    <p className="value">
                      £
                      {Number(
                        calculation.monthlyPayment.toFixed(2)
                      ).toLocaleString()}
                    </p>
                    {/* <p className="value">£1,797.74</p> */}
                  </div>
                  <div className="divider"></div>
                  <div className="results-2">
                    <p>Total you'll repay over the term</p>
                    <p className="value">
                      £
                      {Number(
                        calculation.totalPaid.toFixed(2)
                      ).toLocaleString()}
                    </p>
                    {/* <p className="value">£539,322.94</p> */}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
