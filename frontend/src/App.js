import Header from './Header';
import Nav from './Nav';
import './App.css';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Discover from './DiscoverComponents/Discover';
import Movie from './MovieComponents/Movie';
import LoginPage from './AuthenticationPages/LoginPage';
import PrivateRoute from './utils/PrivateRoute';
import Watched from './WatchedComponents/Watched';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
        <Header/>
        <Nav/>
          <Routes>
            <Route path='/discover' element={<Discover/>}/>
            <Route path='/watched' element={<PrivateRoute><Watched/></PrivateRoute>}/>
            <Route path='/movie/:id' element={<Movie/>}/>
            <Route path='/login' element={<LoginPage/>}/>
            <Route path='*' element={<Navigate to='/discover'/>}/>
          </Routes>
          </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
