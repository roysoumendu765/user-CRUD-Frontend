import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Main from './components/Main/Main';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Auth from './components/Auth/Auth';
import './App.css';

function App() {
  return (
    <div className="App">
       <Router>
        <Header />
        <Routes>
           <Route path="/" element={<Auth />}/>
           <Route path="/main" element={<Main />}/>
        </Routes>
        <Footer />
       </Router>
    </div>
  );
}

export default App;
