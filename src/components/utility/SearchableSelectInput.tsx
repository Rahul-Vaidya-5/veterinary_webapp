import { useEffect, useMemo, useState } from 'react';
import './SearchableSelectInput.css';

type SearchableSelectInputProps = {
  inputId: string;
  listId: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  /** When true, typed values not in the list are accepted as-is */
  allowCustom?: boolean;
};

const normalizeValue = (value: string) => value.trim().toLowerCase();

function SearchableSelectInput({
  inputId,
  listId,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  allowCustom = false,
}: SearchableSelectInputProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeValue(query);
    if (!normalizedQuery) return options;

    return options.filter(option =>
      normalizeValue(option).includes(normalizedQuery),
    );
  }, [options, query]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  const selectOption = (nextValue: string) => {
    onChange(nextValue);
    setQuery(nextValue);
    setIsOpen(false);
    setHighlightedIndex(0);
  };

  const resolveExactOption = (candidate: string) =>
    options.find(
      option => normalizeValue(option) === normalizeValue(candidate),
    );

  const closeAndRestore = () => {
    const exactOption = resolveExactOption(query);

    if (!query.trim()) {
      onChange('');
      setQuery('');
    } else if (exactOption) {
      onChange(exactOption);
      setQuery(exactOption);
    } else if (allowCustom) {
      onChange(query.trim());
      setQuery(query.trim());
    } else {
      setQuery(value);
    }

    setIsOpen(false);
    setHighlightedIndex(0);
  };

  return (
    <div className="searchable-select">
      <input
        id={inputId}
        type="text"
        value={query}
        onChange={event => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (!disabled) {
            setIsOpen(true);
          }
        }}
        onBlur={() => {
          window.setTimeout(() => {
            closeAndRestore();
          }, 120);
        }}
        onKeyDown={event => {
          if (
            !isOpen &&
            (event.key === 'ArrowDown' || event.key === 'ArrowUp')
          ) {
            setIsOpen(true);
            return;
          }

          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setHighlightedIndex(prev =>
              Math.min(prev + 1, Math.max(filteredOptions.length - 1, 0)),
            );
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setHighlightedIndex(prev => Math.max(prev - 1, 0));
          }

          if (event.key === 'Enter') {
            event.preventDefault();
            const highlightedOption = filteredOptions[highlightedIndex];
            const exactOption = resolveExactOption(query);
            if (highlightedOption) {
              selectOption(highlightedOption);
            } else if (exactOption) {
              selectOption(exactOption);
            } else if (allowCustom && query.trim()) {
              selectOption(query.trim());
            }
          }

          if (event.key === 'Escape') {
            event.preventDefault();
            setQuery(value);
            setIsOpen(false);
            setHighlightedIndex(0);
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-autocomplete="list"
      />

      {isOpen && !disabled && (
        <div id={listId} className="searchable-select-menu" role="listbox">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <button
                key={option}
                type="button"
                className={`searchable-select-option${index === highlightedIndex ? ' active' : ''}`}
                onMouseDown={event => {
                  event.preventDefault();
                  selectOption(option);
                }}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                {option}
              </button>
            ))
          ) : (
            <div className="searchable-select-empty">
              {allowCustom && query.trim()
                ? `Add "${query.trim()}" — press Enter`
                : 'No matches found'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchableSelectInput;
