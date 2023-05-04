import * as React from 'react';

const initialStories = [
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

// instead of getting stories form array, we will get if from an API
const getAsyncStories = () =>
  new Promise((resolve) =>
    setTimeout(
      () => resolve({ data: { stories: initialStories } }),
      2000
    )
  );

const App = () => {

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

  //use a reducer function to better manage the state of stories
  const storiesReducer = (state, action) => {
    switch (action.type) {
      case 'STORIES_FETCH_INIT':
        return {
          ...state,
          isLoading: true,
          isError: false,
        }
      case 'STORIES_FETCH_SUCCESS':
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        }
      case 'STORIES_FETCH_FAILURE':
        return {
          ...state,
          isLoading: false,
          isError: true,
        }

      case 'REMOVE_STORY':
        return {
          ...state,
          data: state.data.filter(
            (story) => action.payload.objectID !== story.objectID
          ),
        };

      default:
        throw new Error();
    }
  }

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');
  //use a reducer hook instead of state hook for stories state
  const [stories, dispatchStories] = React.useReducer(storiesReducer,
    { data: [], isLoading: false, isError: false }
  );

  // use a side effect to display stories from promise
  React.useEffect(() => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    getAsyncStories()
      .then((result) => {
        dispatchStories({
          type: 'STORIES_FETCH_SUCCESS',
          payload: result.data.stories,
        });
      })
      .catch(() => dispatchStories({ type: 'STORIES_FETCH_FAILURE' }));
  }, []);

  //filter stories and remove the ones that does not meet the condition
  const handleRemoveStory = (item) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  };

  //received the value of search input and update the setSearchTerm function
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // filter stories array by value reciving from search input 
  const searchedStories = stories.data.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>My Hacker Stories</h1>
      <InputWithLabel
        id="search"
        label="search"
        value={searchTerm}
        onInputChange={handleSearch}
      >
        <strong>Search: </strong>  {/* a component composition that can be accessed as children in InputWithLabel */}
      </InputWithLabel>
      <hr />
      {stories.isError && <p>Something went wrong ...</p>}
      {stories.isLoading ? <p>IS loading..</p> :
        <List
          list={searchedStories}
          onRemoveItem={handleRemoveStory}
        />
      }

    </div>
  );
};

//define a reusable component for input and label, we replace it with search component
const InputWithLabel = ({ id, value, onInputChange, type = 'text', children }) => (
  <>
    <label htmlFor={id}>{children}</label>
    &nbsp;
    <input id={id} type={type} value={value} onChange={onInputChange}></input>
  </>
)
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
      <Item
        key={item.objectID}
        item={item}
        onRemoveItem={onRemoveItem}
      />
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
