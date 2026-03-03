
export const GENRE_OPTIONS = [
  { label: "Action", value: "action" },
  { label: "Adventure", value: "adventure" },
  { label: "Comedy", value: "comedy" },
  { label: "Drama", value: "drama" },
  { label: "Thriller", value: "thriller" },
  { label: "Horror", value: "horror" },
  { label: 'Romance', value: 'romance'},
  { label: "Science Fiction", value: "science fiction" },
  { label: "Fantasy", value: "fantasy" },
  { label: "Mystery", value: "mystery" },
  { label: "Crime", value: "crime" },
  { label: "Animation", value: "animation" },
  { label: "Family", value: "family" },
  { label: "Documentary", value: "documentary" },
  { label: "War", value: "war" },
  { label: "History", value: "history" },
  { label: "Western", value: "western" },
  { label: "Music", value: "music" },
  { label: "TV Movie", value: "tv movie" },
];

export const LANGUAGE_OPTIONS = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "Spanish", value: "es" },
  { label: "German", value: "de" },
  { label: "Italian", value: "it" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" },
  { label: "Hindi", value: "hi" },
  { label: "Russian", value: "ru" },
];

export const STREAMING_OPTIONS = [
  { label: "Netflix", value: "netflix" },
  { label: "Hulu", value: "hulu" },
  { label: "Max", value: "max" },
  { label: "Amazon Prime", value: "prime" },
  { label: "Apple TV", value: "apple" },
  { label: "Disney+", value: "disney" },
  { label: "Peacock", value: "peacock" },
  { label: "Paramount+", value: "paramount" },
];

export const PRICE_OPTIONS = [
  { label: "Free", value: "free" },
  { label: "Ads", value: "ads" },
  { label: "Subscription", value: "flatrate" },
  { label: "Rent", value: "rent" },
  { label: "Buy", value: "buy" },
];

export const VOTE_COUNT_OPTIONS = [
  {label: "> 1k", value:'1000'},
  {label: '> 10k', value:'10000'},
  {label: '> 100k', value: '100000'},
  {label: '> 1m', value: '1000000'}
];

export const SORT_BY_OPTIONS = [
  {label: 'Personal Rating', value: '-rating'},
  {label: 'Watched Date', value: '-watched_date'},
  {label: 'Public Rating', value: '-movie__vote_average'},
  {label: 'Popularity', value: '-movie__popularity'},
  {label: 'Release Year', value: '-movie__release_date'}
]

export const DISCOVER_SORT_BY_OPTIONS = [
  {label: 'IMDb Rating', value: 'imdb_rating'},
  {label: 'TMDB Rating', value: 'vote_average'},
  {label: 'Popularity', value: 'popularity'},
  {label: 'Release Date', value: 'release_date'},
  {label: 'Vote Count', value: 'imdb_votes'},
]