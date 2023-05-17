import * as React from "react";

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";

const App = () => {
  //set a custom hook that syn value of search and local storage
  const useSemiPersistentState = (key, initialState) => {
    const [value, setValue] = React.useState(
      //the initial value is either the one from search history or 'React' word
      localStorage.getItem(key) || initialState
    );
    //set use effect hook to keep history of last search
    React.useEffect(() => {
      localStorage.setItem(key, value); //use a flexible key to do not overwrite the value of local storage
    }, [key, value]);

    return [value, setValue];
  };

  //use a reducer function to better manage the state of stories
  const storiesReducer = (state, action) => {
    switch (action.type) {
      case "STORIES_FETCH_INIT":
        return {
          ...state,
          isLoading: true,
          isError: false,
        };
      case "STORIES_FETCH_SUCCESS":
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        };
      case "STORIES_FETCH_FAILURE":
        return {
          ...state,
          isLoading: false,
          isError: true,
        };

      case "REMOVE_STORY":
        return {
          ...state,
          data: state.data.filter(
            (story) => action.payload.objectID !== story.objectID
          ),
        };

      default:
        throw new Error();
    }
  };

  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "React");

  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);

  //use a reducer hook instead of state hook for stories state
  const [stories, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false,
  });

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };

  //update the state of url after pressing the submit button
  const handleSearchSubmit = () => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
  };

  // create a memoized function using useCallback hook to run only when search term is updated
  const handleFetchStories = React.useCallback(() => {
    if (searchTerm === "") return;
    dispatchStories({ type: "STORIES_FETCH_INIT" });

    //fetch stories form server according to search term state
    fetch(url)
      .then((response) => response.json())
      .then((result) => {
        dispatchStories({
          type: "STORIES_FETCH_SUCCESS",
          payload: result.hits,
        });
      })
      .catch(() => dispatchStories({ type: "STORIES_FETCH_FAILURE" }));
  }, [url]);

  // use a side effect to display stories from promise
  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  //filter stories and remove the ones that does not meet the condition
  const handleRemoveStory = (item) => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    });
  };

  //received the value of search input and update the setSearchTerm function
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div>
      <h1>My Hacker Stories</h1>
      <InputWithLabel
        id="search"
        label="search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearchInput}
      >
        <strong>Search: </strong>{" "}
        {/* a component composition that can be accessed as children in InputWithLabel */}
      </InputWithLabel>
      <button type="button" disabled={!searchTerm} onClick={handleSearchSubmit}>
        Submit
      </button>
      <hr />
      {stories.isError && <p>Something went wrong ...</p>}
      {stories.isLoading ? (
        <p>IS loading..</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  );
};

//define a reusable component for input and label, we replace it with search component
const InputWithLabel = ({
  id,
  value,
  onInputChange,
  type = "text",
  children,
}) => (
  <>
    <label htmlFor={id}>{children}</label>
    &nbsp;
    <input id={id} type={type} value={value} onChange={onInputChange}></input>
  </>
);
//No more use, replaced with InputWithLabel
// const Search = ({ onSearch, search }) => (
//   //wrap the elements in a react fragment
//   <>
//     <label htmlFor="search">Search: </label>
//     <input id="search" type="text" value={search} onChange={onSearch} />
//     <p>Value you typed is : <strong>{search}</strong></p>
//   </>

// );

const List = ({ list, onRemoveItem }) => (
  <ul>
    {list.map((item) => (
      <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
    ))}
  </ul>
);

const Item = ({ item, onRemoveItem }) => (
  <li>
    <span>
      <a href={item.url}>{item.title}</a>
    </span>
    <span>{item.author}</span>
    <span>{item.num_comments}</span>
    <span>{item.points}</span>
    <span>
      <button type="button" onClick={() => onRemoveItem(item)}>
        Dismiss
      </button>
    </span>
  </li>
);

export default App;
