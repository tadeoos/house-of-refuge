import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Header from '../components/header.js';

const ResourceList = () => {


  return (
    <div>
      <Header />
      DUPA 2
    </div>

  );

};




ReactDOM.render(
  React.createElement(ResourceList, window.props),    // gets the props that are passed in the template
  window.react_mount,                                // a reference to the #react div that we render to
);
