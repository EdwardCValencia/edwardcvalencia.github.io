import {useState,useEffect,useCallback} from 'react'
import noImage from './assets/no-image.png'

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `${import.meta.env.VITE_TMDB_TOKEN}`
  }
};

export default function App(){
  const [ movies, setMovies ] = useState([]);
  const [tmdbConfig, setTmdbConfig] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [apiEndpoint, setApiEndpoint] = useState("https://api.themoviedb.org/3/movie/popular?language=en-US");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://api.themoviedb.org/3/configuration',options)
      .then(res => res.json())
      .then(data => setTmdbConfig(data))
      .catch(err => console.log(err))
  },[]);

  const fetchMovies = useCallback(async () => {
    const pageUrl = `${apiEndpoint}&page=${currentPage}`;
    setError(null)

    try{
      const res = await fetch(pageUrl, options)
      if(!res.ok){
        throw new Error(`Http status: ${res.status}. Check API Key`)
      }
      const data = await res.json()

      setMovies(data.results);
      setTotalPages(data.total_pages);

      if (data.results.length === 0){
        setError("No Movies Found That Match Your Criteria")
      }

    } catch (err) {
      console.error('Error Fetching Movies', err)
      setError(`Failed To Load Movies. ${err.message}`);
    }
  }, [apiEndpoint, currentPage])

  useEffect(() => {
    fetchMovies()
  }, [fetchMovies])

  const handleSearch = (e) => {
    const search = e.target.value.trim();
    setCurrentPage(1);

    if(search) {
      setApiEndpoint(`https://api.themoviedb.org/3/search/movie?query=${search}&include_adult=false&language=en-US`);
    } else{
      setApiEndpoint("https://api.themoviedb.org/3/movie/popular?language=en-US");
    }
  };

  const handleSort = (e) => {
    const sort = e.target.value;

    setCurrentPage(1);

    if(sort){
      setApiEndpoint(`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&sort_by=${sort}`);
    } else{
      setApiEndpoint("https://api.themoviedb.org/3/movie/popular?language=en-US");
    }
  };

  const handlePage = (page) => {
    if(page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0,0);
    }
  };


  return(
    <>
      <header>
        <h1>Movie Explorer</h1>
        <div className='searchBar'>
          <input
            name='movieSearch'
            id='searchField'
            placeholder='Search for a movie...'
            onChange={handleSearch}
          />
          <select name='sort' id='sort' onChange={handleSort}>
            <option value="">Sort By (Popular)</option>
            <option value="primary_release_date.asc">Release Date (Asc)</option>
            <option value="primary_release_date.desc">Release Date (Desc)</option>
            <option value="vote_average.asc">Rating (Asc)</option>
            <option value="vote_average.desc">Rating (Desc)</option>
          </select>
        </div>
      </header>

      <div className='card-background' id='card-frame'>
        {error && <p style={{ color: 'red', textAlign: 'center'}}>{error}</p>}

        {!error && tmdbConfig && movies.map(movie => {
          const imageUrl = movie.poster_path
            ? `${tmdbConfig.images.base_url}${tmdbConfig.images.poster_sizes[2]}${movie.poster_path}`
            : noImage;

            return(
              <div className='card' key={movie.id}>
                <img src={imageUrl} alt={movie.title} />
                <div className='details'>
                  <p className='movie-title'>{movie.title}</p>
                  <p className='release-date'>Release Date: {movie.release_date}</p>
                  <p className='movie-rating'>Rating: {movie.vote_average.toFixed(1)}</p>
                </div>
              </div>
            );
        })}
      </div>

      <div className='nav'>
        <button
          className='nav-button'
          onClick={() => handlePage(currentPage - 1)}
          disabled={currentPage <= 1}
          >
            Previous
          </button>
          <p id='pages'>Page {currentPage} of {totalPages}</p>
          <button
            className='nav-button'
            onClick={() => handlePage(currentPage + 1)}
            disabled={currentPage >= totalPages}>Next</button>
      </div>
    </>
  )
}