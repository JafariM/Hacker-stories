import * as React from 'react';

const App = () => {
  const stories = [
    {
      title: 'React',
      url: 'https://reactjs.org/',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: 'Redux',
      url: 'https://redux.js.org/',
      author: 'Dan Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: 1,
    },
  ];
  //set a custom hook that syn value of search and local storage 
  const useSemiPersistentState = (key, initialState) => {
    const [value, setValue] = React.useState(
      //the initial value is either the one from search history or 'React' word
      localStorage.getItem(key) || initialState
    );

    //set use effect hook to keep history of last search
    React.useEffect(() => {
      localStorage.setItem(key, value);  //use a flexible key to do not overwrite the value of local storage
    }, [key, value]);

    return [value, setValue];
  }
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');



  //received the value of search input and update the setSearchTerm function
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // filter stories array by value reciving from search input 
  const searchedStories = stories.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>My Hacker Stories</h1>
      <Search search={searchTerm} onSearch={handleSearch} />
      <hr />
      <List list={searchedStories} />
    </div>
  );
};

const Search = ({ onSearch, search }) => (
  //wrap the elements in a react fragment
  <>
    <label htmlFor="search">Search: </label>
    <input id="search" type="text" value={search} onChange={onSearch} />
    <p>Value you typed is : <strong>{search}</strong></p>
  </>

);

const List = ({ list }) => (
  <ul>
    {list.map(({ objectID, ...item }) => (
      // sending item as spread operator to item component
      <Item key={objectID} {...item} />
    ))}
  </ul>
);

const Item = ({ title, url, author, num_comments, points }) => (
  <li>
    <span>
      <a href={url}>{title}</a>
    </span>
    <span>{author}</span>
    <span>{num_comments}</span>
    <span>{points}</span>
  </li>
);

export default App;
