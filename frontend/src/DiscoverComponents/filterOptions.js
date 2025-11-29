
export const GENRE_OPTIONS = [
  { label: "Action", value: "action" },
  { label: "Comedy", value: "comedy" },
  { label: "Thriller", value: "thriller" },
  { label: "Documentary", value: "documentary" },
  { label: "Horror", value: "horror" },
];

export const LANGUAGE_OPTIONS = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "Spanish", value: "es" },
  { label: "German", value: "de" },
];

export const STREAMING_OPTIONS = [
  { label: "Netflix", value: "netflix" },
  { label: "Hulu", value: "hulu" },
  { label: "Max", value: "max" },
  { label: "Amazon Prime", value: "prime" },
  { label: "Apple TV", value: "apple" },
];

export const PRICE_OPTIONS = [
  { label: "Free", value: "free" },
  { label: "Ads", value: "ads" },
  { label: "Subscription", value: "flatrate" },
  { label: "Rent", value: "rent" },
  { label: "Buy", value: "buy" },
];

export const VOTE_COUNT_OPTIONS = [
  {label: "> 100", value:'100'},
  {label: '> 500', value:'500'},
  {label: '> 1000', value: '1000'},
  {label: '> 5000', value: '5000'}
];

export const SORT_BY_OPTIONS = [
  {label: 'Personal Rating', value: '-rating'},
  {label: 'Public Rating', value: '-movie__vote_average'},
  {label: 'Popularity', value: '-movie__popularity'},
  {label: 'Release Year', value: '-movie__release_date'}
]