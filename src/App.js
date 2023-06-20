import * as React from "react";
import axios from "axios";
import styled from "styled-components";
import { ReactComponent as Check } from "./check.svg";

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";

const StyledContainer = styled.div`
  height: 100vw;
  padding: 20px;
  background: #83a4d4;
  background: linear-gradient(to left, #b6fbff, #83a4d4);
  color: #171212;
`;

const StyledHeadlinePrimary = styled.h1`
  font-size: 48px;
  font-weight: 300;
  letter-spacing: 2px;
`;

const StyledItem = styled.li`
  display: flex;
  align-items: center;
  padding-bottom: 5px;
`;
const StyledColumn = styled.span`
  padding: 0 5px;
  white-space: nowrap;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  a {
    color: inherit;
  }
  width: ${(props) => props.width};
`;
const StyledButton = styled.button`
background: transparent;
border: 1px solid #171212;
padding: 5px;
cursor: pointer;
transition: all 0.1s ease-in;
&:hover {
background: #171212;
color: #ffffff;`;
const StyledButtonSmall = styled(StyledButton)`
  padding: 5px;
`;
const StyledButtonLarge = styled(StyledButton)`
  padding: 10px;
`;
const StyledSearchForm = styled.form`
  padding: 10px 0 20px 0;
  display: flex;
  align-items: baseline;
`;
const StyledLabel = styled.label`
  border-top: 1px solid #171212;
  border-left: 1px solid #171212;
  padding-left: 5px;
  font-size: 24px;
`;
const StyledInput = styled.input`
  border: none;
  border-bottom: 1px solid #171212;
  background-color: transparent;
  font-size: 24px;
`;

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

const getSumComments = (stories) => {
  console.log("C");
  return stories.data.reduce((result, value) => result + value.num_comments, 0);
};

const App = () => {
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
  const handleSearchSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
    event.preventDefault();
  };

  // create a memoized function using useCallback hook to run only when search term is updated
  const handleFetchStories = React.useCallback(async () => {
    if (searchTerm === "") return;
    dispatchStories({ type: "STORIES_FETCH_INIT" });
    try {
      //fetch stories form server according to search term state
      const result = await axios.get(url);

      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: result.data.hits,
      });
    } catch {
      dispatchStories({ type: "STORIES_FETCH_FAILURE" });
    }
  }, [url]);

  // use a side effect to display stories from promise
  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  //filter stories and remove the ones that does not meet the condition
  const handleRemoveStory = React.useCallback((item) => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    });
  }, []);

  //received the value of search input and update the setSearchTerm function
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  console.log("B:App");

  //used useMemo hook to prevent the function to redefine and calculate in every rerendering of App component
  const sumComments = React.useMemo(() => getSumComments(stories), [stories]);
  return (
    <StyledContainer>
      <StyledHeadlinePrimary>My Hacker Stories</StyledHeadlinePrimary>
      <h1>My Hacker Stories with {sumComments} comments.</h1>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      {stories.isError && <p>Something went wrong ...</p>}
      {stories.isLoading ? (
        <p>IS loading..</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </StyledContainer>
  );
};

const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit,
  className,
}) => (
  <StyledSearchForm onSubmit={onSearchSubmit}>
    <InputWithLabel
      id="search"
      label="search"
      value={searchTerm}
      isFocused
      onInputChange={onSearchInput}
    >
      <strong>Search: </strong>{" "}
      {/* a component composition that can be accessed as children in InputWithLabel */}
    </InputWithLabel>
    <StyledButtonLarge type="submit" disabled={!searchTerm}>
      Submit
    </StyledButtonLarge>
  </StyledSearchForm>
);

//define a reusable component for input and label, we replace it with search component
const InputWithLabel = ({
  id,
  value,
  onInputChange,
  type = "text",
  children,
}) => (
  <>
    <StyledLabel htmlFor={id}>{children}</StyledLabel>
    &nbsp;
    <StyledInput
      id={id}
      type={type}
      value={value}
      onChange={onInputChange}
    ></StyledInput>
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

const List = React.memo(
  ({ list, onRemoveItem }) =>
    console.log("B:list") || (
      <ul>
        {list.map((item) => (
          <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
        ))}
      </ul>
    )
);

const Item = ({ item, onRemoveItem }) => (
  <StyledItem>
    <StyledColumn width="40%">
      <a href={item.url}>{item.title}</a>
    </StyledColumn>
    <StyledColumn width="30%">{item.author}</StyledColumn>
    <StyledColumn width="10%">{item.num_comments}</StyledColumn>
    <StyledColumn width="10%">{item.points}</StyledColumn>
    <StyledColumn width="10%">
      <StyledButtonSmall type="button" onClick={() => onRemoveItem(item)}>
        <Check width="18px" height="18px" />
      </StyledButtonSmall>
    </StyledColumn>
  </StyledItem>
);

export default App;
