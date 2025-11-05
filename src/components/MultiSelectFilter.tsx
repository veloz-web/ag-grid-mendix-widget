import { ReactElement, useState, useRef, useEffect } from "react";

interface MultiSelectFilterProps {
    label: string;
    options: string[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    enableSearch?: boolean;
    placeholder?: string;
}

export function MultiSelectFilter(props: MultiSelectFilterProps): ReactElement {
    const { label, options, selectedValues, onChange, enableSearch = true, placeholder } = props;
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

    const allSelected = selectedValues.length === options.length && options.length > 0;
    const someSelected = selectedValues.length > 0 && selectedValues.length < options.length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchText("");
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen) {
                setIsOpen(false);
                setSearchText("");
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
                document.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [isOpen]);

    // Focus search input when dropdown opens (only if search is enabled)
    useEffect(() => {
        if (isOpen && enableSearch && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen, enableSearch]);

    // Update indeterminate state whenever selectedValues or isOpen changes
    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            selectAllCheckboxRef.current.indeterminate = someSelected;
        }
    }, [someSelected, isOpen]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (isOpen) {
            setSearchText("");
        }
    };

    const toggleValue = (value: string) => {
        const newSelection = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];
        onChange(newSelection);
    };

    const toggleSelectAll = () => {
        if (allSelected) {
            onChange([]);
        } else {
            onChange([...options]);
        }
    };

    const clearAll = () => {
        onChange([]);
        setIsOpen(false);
    };

    const filteredOptions = enableSearch
        ? options.filter((option) => option.toLowerCase().includes(searchText.toLowerCase()))
        : options;

    // Display text logic
    const getDisplayText = () => {
        if (selectedValues.length === 0) {
            return placeholder || `Select ${label.toLowerCase()}...`;
        } else if (selectedValues.length === 1) {
            return selectedValues[0];
        } else if (selectedValues.length === options.length) {
            return "All selected";
        } else {
            return `${selectedValues.length} selected`;
        }
    };

    return (
        <div className="multiselect-filter" ref={containerRef}>
            <div className="multiselect-trigger-wrapper">
                <button
                    type="button"
                    className="multiselect-trigger"
                    onClick={toggleDropdown}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-label={`${label} filter`}
                >
                    <div className="multiselect-content">
                        <span className="multiselect-label">{label}:</span>
                        <span className="multiselect-value">{getDisplayText()}</span>
                    </div>
                    <svg
                        className={`multiselect-arrow ${isOpen ? "open" : ""}`}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M7 10l5 5 5-5z" />
                    </svg>
                </button>
                {selectedValues.length > 0 && (
                    <button
                        type="button"
                        className="multiselect-clear"
                        onClick={(e) => {
                            e.stopPropagation();
                            clearAll();
                        }}
                        aria-label="Clear selection"
                        title="Clear selection"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="multiselect-dropdown" role="listbox">
                    <div className="multiselect-header">
                        <label className="multiselect-select-all-label">
                            <input
                                ref={selectAllCheckboxRef}
                                type="checkbox"
                                className="multiselect-checkbox"
                                checked={allSelected}
                                onChange={toggleSelectAll}
                                aria-label="Select all options"
                            />
                            <span className="multiselect-select-all-text">Select All</span>
                        </label>
                    </div>

                    {enableSearch && (
                        <div className="multiselect-search">
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="multiselect-search-input"
                                placeholder="Search..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                aria-label="Search options"
                            />
                        </div>
                    )}

                    <div className="multiselect-options">
                        {filteredOptions.length === 0 ? (
                            <div className="multiselect-no-results">No matches found</div>
                        ) : (
                            filteredOptions.map((option) => {
                                const isChecked = selectedValues.includes(option);
                                return (
                                    <label
                                        key={option}
                                        className="multiselect-option"
                                        role="option"
                                        aria-selected={isChecked}
                                    >
                                        <input
                                            type="checkbox"
                                            className="multiselect-checkbox"
                                            checked={isChecked}
                                            onChange={() => toggleValue(option)}
                                            aria-label={option}
                                        />
                                        <span className="multiselect-option-text">{option}</span>
                                    </label>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
