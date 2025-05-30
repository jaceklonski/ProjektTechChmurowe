'use client';

import { ChangeEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchText, setSearchText] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchText(query);
    onSearch(query);
  };

  return (
    <div className='searchbar'>
      <input
        type="text"
        value={searchText}
        onChange={handleChange}
        placeholder="Search phrase..."
      />
    </div>
  );
}
