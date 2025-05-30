"use client";

import { useEffect, useReducer } from 'react';
import SearchBar from '@/components/SearchBar';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: boolean;
  due_to: string;
  status: string;
  users: { id: string; email: string }[];
  comments: any[];
  createdAt: string;
  updatedAt: string;
}

interface AdvancedSearchFormProps {
  onResults: (tasks: Task[]) => void;
  onLoadingChange: (loading: boolean) => void;
  onError: (error: string | null) => void;
}

interface SearchState {
  search: string;
  dueTo: string;
  dueTime: string;
  status: string;
  priority: boolean;
  orderBy: string;
  orderDirection: string;
}

type Action =
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_DUETO'; payload: string }
  | { type: 'SET_DUETIME'; payload: string }
  | { type: 'SET_STATUS'; payload: string }
  | { type: 'SET_PRIORITY'; payload: boolean }
  | { type: 'SET_ORDERBY'; payload: string }
  | { type: 'SET_ORDERDIRECTION'; payload: string };

const initialState: SearchState = {
  search: '',
  dueTo: '',
  dueTime: '',
  status: '',
  priority: false,
  orderBy: 'createdAt',
  orderDirection: 'desc',
};

function reducer(state: SearchState, action: Action): SearchState {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'SET_DUETO':
      return { ...state, dueTo: action.payload };
    case 'SET_DUETIME':
      return { ...state, dueTime: action.payload };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_PRIORITY':
      return { ...state, priority: action.payload };
    case 'SET_ORDERBY':
      return { ...state, orderBy: action.payload };
    case 'SET_ORDERDIRECTION':
      return { ...state, orderDirection: action.payload };
    default:
      return state;
  }
}

export default function AdvancedSearchForm({
  onResults,
  onLoadingChange,
  onError,
}: AdvancedSearchFormProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchTasks = async () => {
    onLoadingChange(true);
    onError(null);

    const params = new URLSearchParams();
    if (state.search) params.append('search', state.search);
    if (state.dueTo) {
      const dueDateTime = state.dueTime
        ? `${state.dueTo}T${state.dueTime}:00`
        : `${state.dueTo}T00:00:00`;
      params.append('due_to', dueDateTime);
    }
    if (state.status) params.append('status', state.status);
    if (state.priority) params.append('priority', 'true');
    if (state.orderBy) params.append('orderBy', state.orderBy);
    if (state.orderDirection)
      params.append('orderDirection', state.orderDirection);

    try {
      const res = await fetch(`/api/tasks?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch tasks.');
      }
      onResults(data.tasks);
    } catch (err: any) {
      onError(err.message);
    } finally {
      onLoadingChange(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTasks();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [
    state.search,
    state.dueTo,
    state.dueTime,
    state.status,
    state.priority,
    state.orderBy,
    state.orderDirection,
  ]);

  return (
    <form className='advanced-search' onSubmit={(e) => e.preventDefault()}>
      <SearchBar onSearch={(query) => dispatch({ type: 'SET_SEARCH', payload: query })} />
      <div className='box3'>
      <div className='box'>
        <label htmlFor="dueTo">
          Due Date
        </label>
        <input
          className='input'
          type="date"
          id="dueTo"
          value={state.dueTo}
          onChange={(e) =>
            dispatch({ type: 'SET_DUETO', payload: e.target.value })
          }
        />
      </div>

      <div className='box'>
        <label htmlFor="dueTime">
          Due Time
        </label>
        <input
          className='input'
          type="time"
          id="dueTime"
          value={state.dueTime}
          onChange={(e) =>
            dispatch({ type: 'SET_DUETIME', payload: e.target.value })
          }
        />
      </div>

      <div className='box'>
        <label htmlFor="status">
          Status
        </label>
        <select
          id="status"
          value={state.status}
          onChange={(e) =>
            dispatch({ type: 'SET_STATUS', payload: e.target.value })
          }
        >
          <option value="">-- All --</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>
      </div>

      <div className='box'>
        <label htmlFor="priority">
          Priority Only
        </label>
        <input
          className='input'
          type="checkbox"
          id="priority"
          checked={state.priority}
          onChange={(e) =>
            dispatch({ type: 'SET_PRIORITY', payload: e.target.checked })
          }
        />
      </div>

      <div className='box'>
        <label htmlFor="orderBy">
          Sort By
        </label>
        <select
          id="orderBy"
          value={state.orderBy}
          onChange={(e) =>
            dispatch({ type: 'SET_ORDERBY', payload: e.target.value })
          }
        >
          <option value="createdAt">Created At</option>
          <option value="due_to">Due Date</option>
          <option value="title">Title</option>
        </select>
      </div>

      <div className='box'>
        <label htmlFor="orderDirection">
          Sort Direction
        </label>
        <select
          id="orderDirection"
          value={state.orderDirection}
          onChange={(e) =>
            dispatch({ type: 'SET_ORDERDIRECTION', payload: e.target.value })
          }
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      </div>
    </form>
  );
}
