import React, { Fragment, useState } from 'react';
import axios from 'axios';

const FileUpload = ({ showMonthlyExpenses, setMessage }) => {
  const [file, setFile] = useState('');
  const [fileName, setFileName] = useState('Choose CSV File');
  const [uploadedFile, setUploadedFile] = useState({});

  const onChange = e => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file); //file is the variable with the CSV data
    try {
      const res = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      /* const { fileName, filePath } = res.data;
      setUploadedFile({ fileName, filePath });
      showMonthlyExpenses(file); //callback to display csv to table*/
      const { expenses } = res.data;
      showMonthlyExpenses(expenses);

      setMessage('Upload Success');
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
      <form onSubmit={onSubmit}>
        <div className='custom-file mb-4'>
          <input
            type='file'
            accept='.csv'
            className='custom-file-input'
            id='customFile'
            onChange={onChange}
          />
          <label className='custom-file-label' htmlFor='customFile'>
            {fileName}
          </label>
        </div>

        <input
          type='submit'
          value='Upload'
          className='btn btn-primary btn-block mt-4'
        />
      </form>
    </Fragment>
  );
};

export default FileUpload;
