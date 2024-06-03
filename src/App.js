import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import MovieList from './components/MovieList';
import MovieListHeading from './components/MovieListHeading';
import SearchBox from './components/SearchBox';
import AddFavourites from './components/AddFavourites';
import RemoveFavourites from './components/RemoveFavourites';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Cart from './components/Cart';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './components/AuthContexts';

const App = () => {
	const [movies, setMovies] = useState([]);
	const [favourites, setFavourites] = useState([]);
	const [searchValue, setSearchValue] = useState('');
	const [cartItems, setCartItems] = useState([]);
  	const [user, setUser] = useState(null);

	const getMovieRequest = async (searchValue) => {
		const url = `http://www.omdbapi.com/?s=${searchValue}&apikey=263d22d8`;

		const response = await fetch(url);
		const responseJson = await response.json();

		if (responseJson.Search) {
			setMovies(responseJson.Search);
		}
	};

	useEffect(() => {
		getMovieRequest(searchValue);
	}, [searchValue]);

	useEffect(() => {
		const movieFavourites = JSON.parse(
			localStorage.getItem('react-movie-app-favourites')
		);

		if (movieFavourites) {
			setFavourites(movieFavourites);
		}
	}, []);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
		  setUser(currentUser);
		});
		return () => {
		  unsubscribe();
		};
	  }, []);

	const saveToLocalStorage = (items) => {
		localStorage.setItem('react-movie-app-favourites', JSON.stringify(items));
	};

	const addFavouriteMovie = (movie) => {
		const newFavouriteList = [...favourites, movie];
		setFavourites(newFavouriteList);
		saveToLocalStorage(newFavouriteList);
	};

	const removeFavouriteMovie = (movie) => {
		const newFavouriteList = favourites.filter(
			(favourite) => favourite.imdbID !== movie.imdbID
		);

		setFavourites(newFavouriteList);
		saveToLocalStorage(newFavouriteList);
	};
	const addToCart = (movie) => {
		if (!user) {
		  alert('You need to be logged in to add items to the cart');
		  return;
		}
		const newCartItems = [...cartItems, movie];
		setCartItems(newCartItems);
	  };
	
	  const removeFromCart = (movie) => {
		const newCartItems = cartItems.filter(
		  (item) => item.imdbID !== movie.imdbID
		);
		setCartItems(newCartItems);
	};
  
	const handleLogout = () => {
	  signOut(auth);
	  setUser(null);
	};

	return (
		<AuthProvider>
		<Router>
		<div className='container-fluid movie-app'>
			<div className='row d-flex align-items-center mt-4 mb-4'>
				<MovieListHeading heading='Movies' />
				<SearchBox searchValue={searchValue} setSearchValue={setSearchValue} />
				{user ? (
            <>
              <button onClick={handleLogout}>Logout</button>
              <button onClick={() => window.location.href = '/cart'}>Cart</button>
            </>
          ) : (
            <>
              <button onClick={() => window.location.href = '/login'}>Login</button>
              <button onClick={() => window.location.href = '/signup'}>Sign Up</button>

            </>
          )}
        </div>
			
			<div className='row'>
				<MovieList
					movies={movies}
					handleFavouritesClick={addFavouriteMovie}
					favouriteComponent={AddFavourites}
					handleCartClick={addToCart}
				/>
			</div>
			<div className='row d-flex align-items-center mt-4 mb-4'>
				<MovieListHeading heading='Favourites' />
			</div>
			<div className='row'>
				<MovieList
					movies={favourites}
					handleFavouritesClick={removeFavouriteMovie}
					favouriteComponent={RemoveFavourites}
					handleCartClick={removeFromCart}

				/>
			</div>
			<Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<PrivateRoute><Cart cartItems={cartItems} removeFromCart={removeFromCart} /></PrivateRoute>} />
        </Routes>
      </div>
		</Router>
		</AuthProvider>
	);
};

export default App;
