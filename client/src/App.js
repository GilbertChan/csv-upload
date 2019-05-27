//import React from 'react';
import React, { Component } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import ExpenseDetails from './components/ExpenseDetails';
import Message from './components/Message';
import { CsvToHtmlTable } from 'react-csv-to-table';
import Papa from 'papaparse';

/* const App = () => {
  const renderCSV = csvFile => {
    console.log(csvFile);
  };

  return (
    <div className='container mt-4'>
      <h4 className='display-3 text-center mb-4'>CSV File Upload</h4>
      <FileUpload csvFile={renderCSV} />
    </div>
  );
};
export default App; */

class App extends Component {
  state = {
    detailedExpenses: '',
    displayDetailed: false,
    monthlyExpenses: '',
    displayMonthly: false,
    message: ''
  };

  setMessage = msg => {
    this.setState({
      message: msg
    });
  };

  showDetailedExpenses = detailedExpenses => {
    this.setState({
      detailedExpenses: detailedExpenses,
      displayDetailed: true,
      displayMonthly: false
    });
  };

  showMonthlyExpenses = monthlyExpenses => {
    this.setState({
      monthlyExpenses: monthlyExpenses,
      displayMonthly: true,
      displayDetailed: false
    });
    /* let reader = new FileReader();
    reader.readAsText(csvFile);
    reader.onload = text => {
      console.log(text.target.result);
      this.setState({
        csvFile: text.target.result
      });
    }; */

    /* this.setState({
      csvFile: csvFile
    }); */
    /* Papa.parse(csvFile, {
      complete: results => {
        console.log(results);
        this.setState({
          csvFile: results.data
        });
      }
    }); */
  };

  render() {
    return (
      <div className='container mt-4'>
        <h4 className='display-3 text-center mb-4'>CSV Expenses Upload</h4>
        {this.state.message ? <Message msg={this.state.message} /> : null}
        <FileUpload
          showMonthlyExpenses={this.showMonthlyExpenses}
          setMessage={this.setMessage}
        />
        <ExpenseDetails
          showDetailedExpenses={this.showDetailedExpenses}
          setMessage={this.setMessage}
        />
        {this.state.displayMonthly ? (
          <CsvToHtmlTable
            className='mt-4'
            data={this.state.monthlyExpenses}
            csvDelimiter='^'
          />
        ) : null}
        {this.state.displayDetailed ? (
          <CsvToHtmlTable
            className='mt-4'
            data={this.state.detailedExpenses}
            csvDelimiter='^'
          />
        ) : null}
      </div>
    );
  }
}

export default App;
