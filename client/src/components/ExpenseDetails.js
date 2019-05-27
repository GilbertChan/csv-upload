import React, { Fragment } from 'react';
import axios from 'axios';

const ExpenseDetails = ({ showDetailedExpenses, setMessage }) => {
  const getExpenseDetails = async () => {
    console.log('button pressed');
    setMessage('button pressed');
    try {
      const res = await axios.get('/api/expenseDetails');

      const { expenseDetails } = res.data;
      showDetailedExpenses(expenseDetails);

      setMessage('Expense Details Found');
    } catch (err) {
      console.log(err);
      if (err.response.status === 500) {
        setMessage('There was a server issue');
      } else {
        setMessage(err.response.data.msg);
      }
    }
  };

  return (
    <Fragment>
      <button
        type='button'
        className='btn btn-primary btn-block mt-4 mb-4'
        onClick={getExpenseDetails}
      >
        View Expense Details
      </button>
    </Fragment>
  );
};

export default ExpenseDetails;
